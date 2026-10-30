package ar.edu.uncuyo.mzapata.digesto.archivo;

import ar.edu.uncuyo.mzapata.digesto.config.AppProperties;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ArchivoServiceTest {

    @TempDir
    Path storageDir;

    @Test
    void extractsEmbeddedText() throws IOException {
        Archivo archivo = pdfWithText("Documento con texto");

        String text = service().extractEmbeddedText(archivo);

        assertEquals("Documento con texto", text);
    }

    @Test
    void returnsNullWhenPdfHasNoText() throws IOException {
        Archivo archivo = blankPdf();

        assertNull(service().extractEmbeddedText(archivo));
    }

    @Test
    void returnsNullWhenPdfCannotBeRead() throws IOException {
        Path path = storageDir.resolve("roto.pdf");
        Files.writeString(path, "esto no es un PDF");

        assertNull(service().extractEmbeddedText(archivo(path)));
    }

    private ArchivoService service() {
        AppProperties properties = new AppProperties(
                null,
                null,
                null,
                List.of(),
                new AppProperties.Storage(storageDir.toString()),
                null,
                null,
                new AppProperties.Ocr("tesseract", "spa", 300, 3, 120));

        return new ArchivoService(properties);
    }

    private Archivo pdfWithText(String content) throws IOException {
        Path path = storageDir.resolve("con-texto.pdf");
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(document, page)) {
                stream.beginText();
                stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                stream.newLineAtOffset(50, 700);
                stream.showText(content);
                stream.endText();
            }
            document.save(path.toFile());
        }
        return archivo(path);
    }

    private Archivo blankPdf() throws IOException {
        Path path = storageDir.resolve("escaneado.pdf");
        try (PDDocument document = new PDDocument()) {
            document.addPage(new PDPage());
            document.save(path.toFile());
        }
        return archivo(path);
    }

    private Archivo archivo(Path path) throws IOException {
        return Archivo.builder()
                .path(path.getFileName().toString())
                .name(path.getFileName().toString())
                .size(Files.size(path))
                .mime("application/pdf")
                .build();
    }
}
