package ar.edu.uncuyo.mzapata.digesto.normativa;

import java.time.LocalDate;
import java.util.UUID;

public record NormativaSummaryDto(
        UUID id,
        Integer number,
        String title,
        String description,
        LocalDate releaseDate,
        LocalDate loadDate,
        String tipoDocumento,
        String autoridad,
        String archivoName,
        long archivoSize,
        String estado
) {
    public static NormativaSummaryDto of(Normativa n) {
        return new NormativaSummaryDto(
                n.getId(),
                n.getNumber(),
                n.getTitle(),
                n.getDescription(),
                n.getReleaseDate(),
                n.getLoadDate(),
                n.getTipoDocumento().getName(),
                n.getAutoridad().getName(),
                n.getArchivo().getName(),
                n.getArchivo().getSize(),
                n.estado());
    }
}
