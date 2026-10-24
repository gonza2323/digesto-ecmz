package ar.edu.uncuyo.mzapata.digesto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioFormDto(
        @NotBlank(message = "Ingrese el nombre")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres") String firstname,
        @NotBlank(message = "Ingrese el apellido")
        @Size(max = 100, message = "El apellido no puede superar los 100 caracteres") String lastname,
        @NotBlank(message = "Ingrese el email")
        @Size(max = 254, message = "El email no puede superar los 254 caracteres")
        @Email(message = "Ingrese un email válido") String email,
        @NotNull(message = "Seleccione el rol") UserRole role
) {
}
