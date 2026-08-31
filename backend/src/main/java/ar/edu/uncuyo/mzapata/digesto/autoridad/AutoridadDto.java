package ar.edu.uncuyo.mzapata.digesto.autoridad;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record AutoridadDto(UUID id, @NotBlank(message = "Ingrese el nombre") String name) {

    public static AutoridadDto of(Autoridad autoridad) {
        return new AutoridadDto(autoridad.getId(), autoridad.getName());
    }
}
