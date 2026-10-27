package ar.edu.uncuyo.mzapata.digesto.setting;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Plantilla del correo de notificación. {titulo} y {enlace} se reemplazan al enviar.
 */
public record PlantillaCorreoDto(
        @NotBlank(message = "Ingrese el asunto")
        @Size(max = 255, message = "El asunto no puede superar los 255 caracteres") String asunto,
        @NotBlank(message = "Ingrese el cuerpo")
        @Size(max = 4000, message = "El cuerpo no puede superar los 4000 caracteres") String cuerpo
) {
}
