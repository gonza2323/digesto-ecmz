package ar.edu.uncuyo.mzapata.digesto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordDto(
        @NotBlank(message = "Falta el código de recuperación") String token,
        @NotBlank(message = "Ingrese la nueva contraseña")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres") String newPassword
) {}
