package ar.edu.uncuyo.mzapata.digesto.normativa;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Datos con los que se crea o modifica una normativa. El PDF viaja aparte, como multipart. */
public record NormativaFormDto(
        @NotNull(message = "Ingrese el número de la normativa")
        @Positive(message = "El número debe ser mayor a cero")
        Integer number,

        @NotBlank(message = "Ingrese el título")
        String title,

        @NotBlank(message = "Ingrese la descripción")
        String description,

        @NotNull(message = "Ingrese la fecha de publicación")
        LocalDate releaseDate,

        @NotNull(message = "Seleccione la autoridad")
        UUID autoridadId,

        @NotNull(message = "Seleccione el tipo de normativa")
        UUID tipoDocumentoId,

        @NotNull(message = "Ingrese el número de expediente")
        @Positive(message = "El número de expediente debe ser mayor a cero")
        Integer recordNumber,

        @NotBlank(message = "Ingrese el título del expediente")
        String recordTitle,

        List<@Email(message = "Hay una dirección de correo inválida") String> notificaciones,

        /** false guarda como borrador; true la envía a aprobación. */
        boolean enviarAAprobacion
) {}
