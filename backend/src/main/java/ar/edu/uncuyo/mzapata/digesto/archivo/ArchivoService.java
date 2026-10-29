package ar.edu.uncuyo.mzapata.digesto.archivo;

import ar.edu.uncuyo.mzapata.digesto.config.AppProperties;
import ar.edu.uncuyo.mzapata.digesto.config.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Guarda los PDF en disco y extrae su texto para la búsqueda.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ArchivoService {

    private final AppProperties properties;
    private final TesseractOcrService ocrService;

    public Path storageDir() {
        return Path.of(properties.storage().dir()).toAbsolutePath().normalize();
    }

    public Path resolve(Archivo archivo) {
        return storageDir().resolve(archivo.getPath());
    }

    /**
     * Copia el PDF subido a la carpeta de almacenamiento con un nombre único.
     */
    public Archivo store(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new BusinessException("Adjunte el archivo PDF de la normativa");

        if (!"application/pdf".equalsIgnoreCase(file.getContentType()))
            throw new BusinessException("El archivo debe ser un PDF");

        String storedName = UUID.randomUUID() + ".pdf";
        try {
            Path dir = storageDir();
            Files.createDirectories(dir);
            try (var input = file.getInputStream()) {
                Files.copy(input, dir.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new BusinessException("No se pudo guardar el archivo: " + e.getMessage());
        }

        String originalName = file.getOriginalFilename() == null ? storedName : file.getOriginalFilename();

        return Archivo.builder()
                .path(storedName)
                .name(originalName)
                .size(file.getSize())
                .mime("application/pdf")
                .build();
    }

    /**
     * Respuesta HTTP con el PDF: adjunto si se pide descargar, en línea si se abre en otra pestaña.
     */
    public ResponseEntity<Resource> toResponse(Archivo archivo, boolean download) {
        Resource resource = new FileSystemResource(resolve(archivo));
        if (!resource.exists())
            throw BusinessException.notFound("El archivo no está disponible");

        ContentDisposition disposition = (download
                ? ContentDisposition.attachment()
                : ContentDisposition.inline())
                .filename(archivo.getName(), java.nio.charset.StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(archivo.getSize())
                .body(resource);
    }

    /**
     * Texto del PDF usado para la búsqueda por palabra clave.
     *
     * <p>Si el PDF ya tiene una capa de texto se usa esa. Si no la tiene (por
     * ejemplo, un escaneo), se aplica OCR con Tesseract. Devuelve {@code null}
     * cuando no se pudo obtener texto, para no guardar saltos de línea vacíos.</p>
     */
    public String extractText(Archivo archivo) {
        Path path = resolve(archivo);
        String text = extractEmbeddedText(archivo, path);

        if (text != null && !text.isBlank())
            return text.strip();

        log.info("El PDF {} no contiene texto embebido; se intentará OCR", archivo.getPath());
        String ocrText = ocrService.extractText(path);

        return ocrText == null || ocrText.isBlank() ? null : ocrText.strip();
    }

    private String extractEmbeddedText(Archivo archivo, Path path) {
        try (PDDocument document = Loader.loadPDF(path.toFile())) {
            return new PDFTextStripper().getText(document);
        } catch (IOException e) {
            log.warn("No se pudo extraer el texto de {}: {}", archivo.getPath(), e.getMessage());
            return null;
        }
    }
}
