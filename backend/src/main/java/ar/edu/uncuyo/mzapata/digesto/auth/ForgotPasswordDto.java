package ar.edu.uncuyo.mzapata.digesto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordDto(
        @NotBlank(message = "Ingrese su email") @Email(message = "Ingrese un email válido") String email
) {
}
