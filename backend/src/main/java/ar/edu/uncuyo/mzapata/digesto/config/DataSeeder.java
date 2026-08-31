package ar.edu.uncuyo.mzapata.digesto.config;

import ar.edu.uncuyo.mzapata.digesto.autoridad.Autoridad;
import ar.edu.uncuyo.mzapata.digesto.autoridad.AutoridadRepository;
import ar.edu.uncuyo.mzapata.digesto.tipodocumento.TipoDocumento;
import ar.edu.uncuyo.mzapata.digesto.tipodocumento.TipoDocumentoRepository;
import ar.edu.uncuyo.mzapata.digesto.user.UserRole;
import ar.edu.uncuyo.mzapata.digesto.user.Usuario;
import ar.edu.uncuyo.mzapata.digesto.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/** Carga inicial: tipos de normativa, autoridades y las dos cuentas administrativas. */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final List<String> TIPOS = List.of("Disposición", "Resolución", "Circular");
    private static final List<String> AUTORIDADES = List.of(
            "Dirección", "Vicedirección", "Consejo Directivo", "Secretaría Académica");

    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final AutoridadRepository autoridadRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        TIPOS.stream()
                .filter(name -> !tipoDocumentoRepository.existsByNameIgnoreCase(name))
                .forEach(name -> tipoDocumentoRepository.save(TipoDocumento.builder().name(name).build()));

        AUTORIDADES.stream()
                .filter(name -> !autoridadRepository.existsByNameIgnoreCase(name))
                .forEach(name -> autoridadRepository.save(Autoridad.builder().name(name).build()));

        crearUsuario("admin@mzapata.uncuyo.edu.ar", "Admin", "Digesto", "admin", UserRole.ADMIN);
        crearUsuario("superadmin@mzapata.uncuyo.edu.ar", "Super", "Admin", "superadmin", UserRole.SUPERADMIN);
    }

    private void crearUsuario(String email, String firstname, String lastname, String password, UserRole role) {
        if (usuarioRepository.existsByEmailAndDeletedFalse(email)) return;

        usuarioRepository.save(Usuario.builder()
                .firstname(firstname)
                .lastname(lastname)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .mustChangePassword(true)
                .role(role)
                .build());

        log.info("Usuario inicial creado: {} (contraseña provisoria: {})", email, password);
    }
}
