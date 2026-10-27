package ar.edu.uncuyo.mzapata.digesto.autoridad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AutoridadDto(UUID id,
                           @NotBlank(message = "Ingrese el nombre")
                           @Size(max = 255, message = "El nombre no puede superar los 255 caracteres")
                           String name) {

    public static AutoridadDto of(Autoridad autoridad) {
        return new AutoridadDto(autoridad.getId(), autoridad.getName());
    }
}
