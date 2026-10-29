package ar.edu.uncuyo.mzapata.digesto.archivo;

import ar.edu.uncuyo.mzapata.digesto.config.AppProperties;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TesseractOcrServiceTest {

    @TempDir
    Path tempDir;

    @Test
    @DisabledOnOs(OS.WINDOWS)
    void runsTesseractWithConfiguredArguments() throws IOException {
        Path argsFile = tempDir.resolve("args.txt");
        Path fakeTesseract = tempDir.resolve("fake-tesseract");
        Files.writeString(fakeTesseract, "#!/bin/sh\n"
                + "printf '%s\\n' \"$@\" > \"" + argsFile + "\"\n"
                + "echo 'hola cómo estás?'\n");
        Files.setPosixFilePermissions(fakeTesseract, PosixFilePermissions.fromString("rwxr-xr-x"));

        TesseractOcrService service = service(fakeTesseract.toString());

        assertEquals("hola cómo estás?", service.extractText(blankPdf()));

        List<String> args = Files.readAllLines(argsFile);
        assertEquals("stdout", args.get(1));
        assertEquals("-l", args.get(2));
        assertEquals("spa", args.get(3));
        assertEquals("--psm", args.get(4));
        assertEquals("3", args.get(5));
    }

    @Test
    void returnsEmptyWhenTesseractCannotRun() throws IOException {
        TesseractOcrService service = service(tempDir.resolve("no-existe").toString());

        assertEquals("", service.extractText(blankPdf()));
    }

    private TesseractOcrService service(String tesseract) {
        AppProperties properties = new AppProperties(
                null,
                null,
                null,
                List.of(),
                new AppProperties.Storage(tempDir.toString()),
                null,
                null,
                new AppProperties.Ocr(tesseract, "spa", 150, 3, 30));

        return new TesseractOcrService(properties);
    }

    private Path blankPdf() throws IOException {
        Path path = tempDir.resolve("escaneado.pdf");
        try (PDDocument document = new PDDocument()) {
            document.addPage(new PDPage());
            document.save(path.toFile());
        }
        return path;
    }
}
