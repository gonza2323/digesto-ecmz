package ar.edu.uncuyo.mzapata.digesto.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Auth auth,
        String apiUrl,
        String frontendUrl,
        List<String> corsOrigins,
        Storage storage,
        Mail mail,
        Backup backup,
        Ocr ocr
) {
    public record Auth(PasswordReset passwordReset) {
        public record PasswordReset(long durationMinutes) {
        }
    }

    /**
     * Carpeta del disco donde se guardan los PDF de las normativas.
     */
    public record Storage(String dir) {
    }

    /**
     * Remitente de los correos salientes.
     */
    public record Mail(String from) {
    }

    /**
     * Ejecución del dump/restauración y umbral de la alerta. En modo {@code host} se usan
     * los binarios {@code pgDump}/{@code psql}; en modo {@code docker} se ejecutan dentro
     * del contenedor indicado por {@code dockerContainer} mediante {@code dockerBin}.
     */
    public record Backup(String pgDump, String psql, int alertMonths,
                         String mode, String dockerBin, String dockerContainer) {
    }

    /**
     * Parámetros del OCR aplicado a los PDF sin capa de texto.
     */
    public record Ocr(String tesseract, String language, int dpi, int psm, long timeoutSeconds) {
    }
}
