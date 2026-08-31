package ar.edu.uncuyo.mzapata.digesto.normativa;

import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.UUID;

/** Filtros de la búsqueda. Todos opcionales: los nulos no filtran. */
public record NormativaFilterDto(
        String q,
        UUID tipoDocumentoId,
        UUID autoridadId,
        Integer anio,
        Integer number,
        Integer recordNumber,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
) {
    /** Patrón LIKE en minúsculas, o null si no se buscó por palabra clave. */
    public String texto() {
        return q == null || q.isBlank() ? null : "%" + q.trim().toLowerCase() + "%";
    }
}
