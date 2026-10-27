package ar.edu.uncuyo.mzapata.digesto.normativa;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Datos con los que se crea o modifica una normativa. El PDF viaja aparte, como multipart.
 */
public record NormativaFormDto(
        @NotNull(message = "Ingrese el número de la normativa")
        @Positive(message = "El número debe ser mayor a cero")
        @Max(value = 999999999, message = "El número de la normativa es excesivamente largo")
        Integer number,

        @NotBlank(message = "Ingrese el título")
        @Size(max = 255, message = "El título no puede superar los 255 caracteres")
        String title,

        @NotBlank(message = "Ingrese la descripción")
        @Size(max = 2000, message = "La descripción no puede superar los 2000 caracteres")
        String description,

        @NotNull(message = "Ingrese la fecha de publicación")
        LocalDate releaseDate,

        @NotNull(message = "Seleccione la autoridad")
        UUID autoridadId,

        @NotNull(message = "Seleccione el tipo de normativa")
        UUID tipoDocumentoId,

        @NotNull(message = "Ingrese el número de expediente")
        @Positive(message = "El número de expediente debe ser mayor a cero")
        @Max(value = 999999999, message = "El número de expediente es excesivamente largo")
        Integer recordNumber,

        @NotBlank(message = "Ingrese el título del expediente")
        @Size(max = 255, message = "El título del expediente no puede superar los 255 caracteres")
        String recordTitle,

        @Size(max = 20, message = "No puede agregar más de 20 correos")
        List<@Size(max = 254, message = "Una dirección de correo es excesivamente larga")
        @Email(message = "Hay una dirección de correo inválida") String> notificaciones
) {
}
