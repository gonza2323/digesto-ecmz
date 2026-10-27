package ar.edu.uncuyo.mzapata.digesto.normativa;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Filtros de la búsqueda. Todos opcionales: los nulos no filtran.
 */
public record NormativaFilterDto(
        String q,
        UUID tipoDocumentoId,
        UUID autoridadId,
        @Min(value = 1900, message = "El año debe ser mayor o igual a 1900")
        @Max(value = 2100, message = "El año debe ser menor o igual a 2100")
        Integer anio,
        @Min(value = 1, message = "El número debe ser mayor a cero")
        @Max(value = 999999999, message = "El número es excesivamente largo")
        Integer number,
        @Min(value = 1, message = "El número de expediente debe ser mayor a cero")
        @Max(value = 999999999, message = "El número de expediente es excesivamente largo")
        Integer recordNumber,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta
) {
    /**
     * Patrón LIKE en minúsculas, o null si no se buscó por palabra clave.
     */
    public String texto() {
        return q == null || q.isBlank() ? null : "%" + q.trim().toLowerCase() + "%";
    }
}
