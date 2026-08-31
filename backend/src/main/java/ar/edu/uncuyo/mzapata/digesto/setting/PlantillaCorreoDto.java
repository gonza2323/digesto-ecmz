package ar.edu.uncuyo.mzapata.digesto.setting;

import jakarta.validation.constraints.NotBlank;

/** Plantilla del correo de notificación. {titulo} y {enlace} se reemplazan al enviar. */
public record PlantillaCorreoDto(
        @NotBlank(message = "Ingrese el asunto") String asunto,
        @NotBlank(message = "Ingrese el cuerpo") String cuerpo
) {}
