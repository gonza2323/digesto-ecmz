package ar.edu.uncuyo.mzapata.digesto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {

    @NotBlank(message = "Ingrese su email")
    @Size(max = 254, message = "El email no puede superar los 254 caracteres")
    @Email(message = "Ingrese un email válido")
    private String email;

    @NotBlank(message = "Ingrese su contraseña")
    @Size(max = 128, message = "La contraseña no puede superar los 128 caracteres")
    private String password;
}
