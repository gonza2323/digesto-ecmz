package ar.edu.uncuyo.mzapata.digesto.archivo;

import ar.edu.uncuyo.mzapata.digesto.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.concurrent.TimeUnit;

/**
 * OCR de PDFs escaneados mediante el binario de Tesseract.
 *
 * <p>PDFBox renderiza cada página a una imagen y Tesseract la reconoce con los
 * parámetros configurados en {@code app.ocr.*}. Se usa para los PDF que no
 * tienen una capa de texto embebida.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TesseractOcrService {

    private final AppProperties properties;

    /**
     * Reconoce el texto de todas las páginas del PDF. Devuelve cadena vacía si
     * no se pudo aplicar OCR; nunca lanza una excepción por un fallo de OCR.
     */
    public String extractText(Path pdf) {
        AppProperties.Ocr ocr = properties.ocr();
        StringBuilder text = new StringBuilder();

        try (PDDocument document = Loader.loadPDF(pdf.toFile())) {
            Path workDir = Files.createTempDirectory("digesto-ocr-");
            try {
                PDFRenderer renderer = new PDFRenderer(document);
                for (int page = 0; page < document.getNumberOfPages(); page++) {
                    String pageText = ocrPage(renderer, page, workDir, ocr);
                    if (pageText.isBlank()) continue;

                    if (!text.isEmpty()) text.append("\n\n");
                    text.append(pageText.strip());
                }
                log.info("OCR aplicado a {} ({} páginas)", pdf.getFileName(), document.getNumberOfPages());
            } finally {
                deleteRecursively(workDir);
            }
        } catch (IOException e) {
            log.warn("No se pudo aplicar OCR a {}: {}", pdf.getFileName(), e.getMessage());
        }

        return text.toString();
    }

    private String ocrPage(PDFRenderer renderer, int page, Path workDir, AppProperties.Ocr ocr) throws IOException {
        Path image = workDir.resolve("page-" + (page + 1) + ".png");
        Path output = workDir.resolve("page-" + (page + 1) + ".txt");
        Path error = workDir.resolve("page-" + (page + 1) + ".err");

        try {
            BufferedImage rendered = renderer.renderImageWithDPI(page, ocr.dpi(), ImageType.GRAY);
            try {
                if (!ImageIO.write(rendered, "png", image.toFile()))
                    throw new IOException("no se pudo generar la imagen de la página " + (page + 1));
            } finally {
                rendered.flush();
            }

            ProcessBuilder builder = new ProcessBuilder(
                    ocr.tesseract(),
                    image.toString(),
                    "stdout",
                    "-l", ocr.language(),
                    "--psm", String.valueOf(ocr.psm())
            );
            builder.redirectOutput(output.toFile());
            builder.redirectError(error.toFile());

            Process process;
            try {
                process = builder.start();
            } catch (IOException e) {
                throw new IOException("no se pudo ejecutar '" + ocr.tesseract()
                        + "' (verifique que Tesseract y el idioma '" + ocr.language()
                        + "' estén instalados): " + e.getMessage(), e);
            }

            try {
                if (!process.waitFor(ocr.timeoutSeconds(), TimeUnit.SECONDS)) {
                    process.destroyForcibly();
                    throw new IOException("Tesseract excedió el tiempo límite en la página "
                            + (page + 1) + errorDetail(error));
                }
            } catch (InterruptedException e) {
                process.destroyForcibly();
                Thread.currentThread().interrupt();
                throw new IOException("OCR interrumpido en la página " + (page + 1), e);
            }

            if (process.exitValue() != 0)
                throw new IOException("Tesseract terminó con código " + process.exitValue()
                        + " en la página " + (page + 1) + errorDetail(error));

            return Files.readString(output, StandardCharsets.UTF_8);
        } finally {
            deleteQuietly(image);
            deleteQuietly(output);
            deleteQuietly(error);
        }
    }

    private String errorDetail(Path error) {
        try {
            String detail = Files.readString(error, StandardCharsets.UTF_8).strip()
                    .replaceAll("\\s+", " ");
            if (detail.isEmpty()) return "";
            if (detail.length() > 500) detail = detail.substring(0, 500) + "…";
            return ": " + detail;
        } catch (IOException e) {
            return "";
        }
    }

    private void deleteRecursively(Path dir) {
        try (var paths = Files.walk(dir)) {
            paths.sorted(Comparator.reverseOrder()).forEach(this::deleteQuietly);
        } catch (IOException | UncheckedIOException e) {
            log.warn("No se pudieron eliminar los archivos temporales de OCR en {}: {}", dir, e.getMessage());
        }
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.debug("No se pudo eliminar el archivo temporal {}: {}", path, e.getMessage());
        }
    }
}
