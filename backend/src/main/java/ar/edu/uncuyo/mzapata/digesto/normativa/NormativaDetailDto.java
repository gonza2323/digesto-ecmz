package ar.edu.uncuyo.mzapata.digesto.normativa;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record NormativaDetailDto(
        UUID id,
        Integer number,
        String title,
        String description,
        LocalDate releaseDate,
        LocalDate loadDate,
        UUID tipoDocumentoId,
        String tipoDocumento,
        UUID autoridadId,
        String autoridad,
        Integer recordNumber,
        String recordTitle,
        String archivoName,
        long archivoSize,
        String estado,
        List<String> notificaciones
) {
    /**
     * Vista pública: sin la lista de correos notificados.
     */
    public static NormativaDetailDto of(Normativa n) {
        return build(n, null);
    }

    /**
     * Vista de administración: incluye los correos a notificar.
     */
    public static NormativaDetailDto ofAdmin(Normativa n) {
        return build(n, n.getNotificaciones().stream().map(Notificacion::getEmail).toList());
    }

    private static NormativaDetailDto build(Normativa n, List<String> notificaciones) {
        return new NormativaDetailDto(
                n.getId(),
                n.getNumber(),
                n.getTitle(),
                n.getDescription(),
                n.getReleaseDate(),
                n.getLoadDate(),
                n.getTipoDocumento().getId(),
                n.getTipoDocumento().getName(),
                n.getAutoridad().getId(),
                n.getAutoridad().getName(),
                n.getExpediente().getRecordNumber(),
                n.getExpediente().getRecordTitle(),
                n.getArchivo().getName(),
                n.getArchivo().getSize(),
                n.estado(),
                notificaciones);
    }
}
