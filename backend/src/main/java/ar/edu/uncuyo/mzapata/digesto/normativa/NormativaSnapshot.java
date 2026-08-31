package ar.edu.uncuyo.mzapata.digesto.normativa;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Valores previos de una normativa publicada, guardados antes de modificarla.
 */
public record NormativaSnapshot(
        Integer number,
        String title,
        String description,
        String text,
        LocalDate releaseDate,
        UUID autoridadId,
        UUID tipoDocumentoId,
        UUID expedienteId,
        UUID archivoId,
        List<String> notificaciones
) {
    public static NormativaSnapshot of(Normativa n) {
        return new NormativaSnapshot(
                n.getNumber(),
                n.getTitle(),
                n.getDescription(),
                n.getText(),
                n.getReleaseDate(),
                n.getAutoridad().getId(),
                n.getTipoDocumento().getId(),
                n.getExpediente().getId(),
                n.getArchivo().getId(),
                n.getNotificaciones().stream().map(Notificacion::getEmail).toList());
    }
}
