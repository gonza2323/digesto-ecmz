package ar.edu.uncuyo.mzapata.digesto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioFormDto(
        @NotBlank(message = "Ingrese el nombre") String firstname,
        @NotBlank(message = "Ingrese el apellido") String lastname,
        @NotBlank(message = "Ingrese el email") @Email(message = "Ingrese un email válido") String email,
        @NotNull(message = "Seleccione el rol") UserRole role
) {}
