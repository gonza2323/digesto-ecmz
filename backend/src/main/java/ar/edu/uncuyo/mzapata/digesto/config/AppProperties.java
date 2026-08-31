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
        Backup backup
) {
    public record Auth(PasswordReset passwordReset) {
        public record PasswordReset(long durationMinutes) {}
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
     * Binarios de PostgreSQL usados para el dump/restauración y umbral de la alerta.
     */
    public record Backup(String pgDump, String psql, int alertMonths) {
    }
}
