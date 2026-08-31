package ar.edu.uncuyo.mzapata.digesto.backup;

import ar.edu.uncuyo.mzapata.digesto.archivo.Archivo;
import ar.edu.uncuyo.mzapata.digesto.archivo.ArchivoRepository;
import ar.edu.uncuyo.mzapata.digesto.archivo.ArchivoService;
import ar.edu.uncuyo.mzapata.digesto.config.AppProperties;
import ar.edu.uncuyo.mzapata.digesto.config.BusinessException;
import ar.edu.uncuyo.mzapata.digesto.setting.AppSettingService;
import ar.edu.uncuyo.mzapata.digesto.user.Usuario;
import ar.edu.uncuyo.mzapata.digesto.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

/**
 * Backup y restauración: un ZIP con el dump de la base ({@code db.sql}), el listado de archivos
 * referenciados ({@code manifest.txt}) y los PDF guardados en disco ({@code archivos/}).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BackupService {

    private static final String DUMP_ENTRY = "db.sql";
    private static final String MANIFEST_ENTRY = "manifest.txt";
    private static final String FILES_PREFIX = "archivos/";
    private static final Pattern JDBC_URL = Pattern.compile("jdbc:postgresql://([^:/]+):(\\d+)/(\\S+)");

    private final AppProperties properties;
    private final ArchivoRepository archivoRepository;
    private final ArchivoService archivoService;
    private final AppSettingService appSettingService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    // ---------- Estado ----------

    private static void deleteQuietly(Path path) {
        if (path == null) return;
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("No se pudo borrar {}: {}", path, e.getMessage());
        }
    }

    // ---------- Generación ----------

    @Transactional(readOnly = true)
    public BackupStatusDto status() {
        String stored = appSettingService.get(AppSettingService.LAST_BACKUP, null);
        int meses = properties.backup().alertMonths();

        if (stored == null || stored.isBlank())
            return new BackupStatusDto(null, true, meses);

        Instant ultimo = Instant.parse(stored);
        boolean alerta = ultimo.isBefore(Instant.now().minus(meses * 30L, ChronoUnit.DAYS));
        return new BackupStatusDto(ultimo, alerta, meses);
    }

    // ---------- Restauración ----------

    /**
     * Arma el ZIP en un archivo temporal y registra la fecha del backup.
     */
    @Transactional
    public Path createBackup() {
        try {
            Path dump = Files.createTempFile("digesto-dump-", ".sql");
            runPgDump(dump);

            List<Archivo> archivos = archivoRepository.findAll();
            Path zip = Files.createTempFile("digesto-backup-", ".zip");

            try (ZipOutputStream out = new ZipOutputStream(Files.newOutputStream(zip))) {
                out.putNextEntry(new ZipEntry(DUMP_ENTRY));
                Files.copy(dump, out);
                out.closeEntry();

                String manifest = archivos.stream().map(Archivo::getPath)
                        .reduce("", (a, b) -> a.isEmpty() ? b : a + "\n" + b);
                out.putNextEntry(new ZipEntry(MANIFEST_ENTRY));
                out.write(manifest.getBytes(StandardCharsets.UTF_8));
                out.closeEntry();

                for (Archivo archivo : archivos) {
                    Path origen = archivoService.resolve(archivo);
                    if (!Files.exists(origen)) {
                        log.warn("El archivo {} está referenciado en la base pero no existe en disco", archivo.getPath());
                        continue;
                    }
                    out.putNextEntry(new ZipEntry(FILES_PREFIX + archivo.getPath()));
                    Files.copy(origen, out);
                    out.closeEntry();
                }
            }

            Files.deleteIfExists(dump);
            zip.toFile().deleteOnExit();
            appSettingService.set(AppSettingService.LAST_BACKUP, Instant.now().toString());
            return zip;

        } catch (IOException e) {
            throw new BusinessException("No se pudo generar el backup: " + e.getMessage());
        }
    }

    /**
     * Valida el ZIP, confirma la contraseña del superadmin y reemplaza base de datos y archivos.
     * Sin transacción: la restauración recrea el esquema por fuera de JPA.
     */
    public void restore(MultipartFile file, String password, UUID userId) {
        confirmarConContrasena(userId, password);

        if (file == null || file.isEmpty())
            throw new BusinessException("Adjunte el ZIP del backup");

        Path zipPath = null;
        Path dumpPath = null;
        try {
            zipPath = Files.createTempFile("digesto-restore-", ".zip");
            file.transferTo(zipPath);

            try (ZipFile zip = new ZipFile(zipPath.toFile())) {
                dumpPath = validarYExtraerDump(zip);
                validarArchivosReferenciados(zip);

                runPsqlResetSchema();
                runPsqlRestore(dumpPath);
                reemplazarArchivos(zip);
            }
        } catch (IOException e) {
            throw new BusinessException("No se pudo leer el backup: " + e.getMessage());
        } finally {
            deleteQuietly(zipPath);
            deleteQuietly(dumpPath);
        }
    }

    private void confirmarConContrasena(UUID userId, String password) {
        Usuario usuario = usuarioRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> BusinessException.notFound("El usuario no existe"));

        if (password == null || !passwordEncoder.matches(password, usuario.getPasswordHash()))
            throw new BusinessException("La contraseña no es correcta: no se restauró nada");
    }

    private Path validarYExtraerDump(ZipFile zip) throws IOException {
        ZipEntry entry = zip.getEntry(DUMP_ENTRY);
        if (entry == null)
            throw new BusinessException("El ZIP no contiene " + DUMP_ENTRY);

        Path dump = Files.createTempFile("digesto-dump-", ".sql");
        try (InputStream in = zip.getInputStream(entry)) {
            Files.copy(in, dump, StandardCopyOption.REPLACE_EXISTING);
        }

        String contenido = Files.readString(dump, StandardCharsets.UTF_8);
        if (!contenido.contains("PostgreSQL database dump") || !contenido.contains("CREATE TABLE")) {
            Files.deleteIfExists(dump);
            throw new BusinessException("El dump de la base de datos no es válido");
        }
        return dump;
    }

    /**
     * Todo archivo listado en el manifiesto debe venir dentro del ZIP.
     */
    private void validarArchivosReferenciados(ZipFile zip) throws IOException {
        ZipEntry entry = zip.getEntry(MANIFEST_ENTRY);
        if (entry == null)
            throw new BusinessException("El ZIP no contiene " + MANIFEST_ENTRY);

        String manifest;
        try (InputStream in = zip.getInputStream(entry)) {
            manifest = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }

        List<String> faltantes = manifest.lines()
                .map(String::trim)
                .filter(linea -> !linea.isEmpty())
                .filter(linea -> zip.getEntry(FILES_PREFIX + linea) == null)
                .toList();

        if (!faltantes.isEmpty())
            throw new BusinessException("Faltan en el ZIP " + faltantes.size()
                    + " archivo(s) referenciados por la base de datos: " + String.join(", ", faltantes));
    }

    // ---------- Ejecución de pg_dump / psql ----------

    private void reemplazarArchivos(ZipFile zip) throws IOException {
        Path dir = archivoService.storageDir();
        if (Files.exists(dir)) {
            try (var paths = Files.walk(dir)) {
                paths.sorted(Comparator.reverseOrder())
                        .filter(path -> !path.equals(dir))
                        .forEach(BackupService::deleteQuietly);
            }
        }
        Files.createDirectories(dir);

        var entries = zip.entries();
        while (entries.hasMoreElements()) {
            ZipEntry entry = entries.nextElement();
            if (entry.isDirectory() || !entry.getName().startsWith(FILES_PREFIX)) continue;

            Path destino = dir.resolve(entry.getName().substring(FILES_PREFIX.length())).normalize();
            if (!destino.startsWith(dir))
                throw new BusinessException("El ZIP contiene una ruta inválida: " + entry.getName());

            try (InputStream in = zip.getInputStream(entry)) {
                Files.copy(in, destino, StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }

    private void runPgDump(Path salida) {
        Matcher conexion = conexion();
        run(List.of(properties.backup().pgDump(),
                "-h", conexion.group(1),
                "-p", conexion.group(2),
                "-U", datasourceUsername,
                "-d", conexion.group(3),
                "--clean", "--if-exists", "--no-owner", "--no-privileges"), salida);
    }

    private void runPsqlResetSchema() {
        Matcher conexion = conexion();
        run(List.of(properties.backup().psql(),
                "-h", conexion.group(1),
                "-p", conexion.group(2),
                "-U", datasourceUsername,
                "-d", conexion.group(3),
                "-v", "ON_ERROR_STOP=1",
                "-c", "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"), null);
    }

    private void runPsqlRestore(Path dump) {
        Matcher conexion = conexion();
        run(List.of(properties.backup().psql(),
                "-h", conexion.group(1),
                "-p", conexion.group(2),
                "-U", datasourceUsername,
                "-d", conexion.group(3),
                "-v", "ON_ERROR_STOP=1",
                "-f", dump.toAbsolutePath().toString()), null);
    }

    private Matcher conexion() {
        Matcher matcher = JDBC_URL.matcher(datasourceUrl);
        if (!matcher.find())
            throw new BusinessException("No se pudo interpretar la URL de la base de datos");
        return matcher;
    }

    private void run(List<String> command, Path stdout) {
        try {
            ProcessBuilder builder = new ProcessBuilder(command);
            builder.environment().put("PGPASSWORD", datasourcePassword);

            Path errores = Files.createTempFile("digesto-proc-", ".log");
            builder.redirectError(errores.toFile());
            builder.redirectOutput(stdout == null
                    ? ProcessBuilder.Redirect.DISCARD
                    : ProcessBuilder.Redirect.to(stdout.toFile()));

            int codigo = builder.start().waitFor();
            String salidaError = Files.readString(errores, StandardCharsets.UTF_8);
            Files.deleteIfExists(errores);

            if (codigo != 0)
                throw new BusinessException(command.getFirst() + " falló (código " + codigo + "): " + salidaError);

        } catch (IOException e) {
            throw new BusinessException("No se pudo ejecutar " + command.getFirst()
                    + ". Verifique que esté instalado y accesible. Detalle: " + e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("La operación fue interrumpida");
        }
    }
}
