package ar.edu.uncuyo.mzapata.digesto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordDto(
        @NotBlank(message = "Ingrese su email")
        @Size(max = 254, message = "El email no puede superar los 254 caracteres")
        @Email(message = "Ingrese un email válido") String email
) {
}
