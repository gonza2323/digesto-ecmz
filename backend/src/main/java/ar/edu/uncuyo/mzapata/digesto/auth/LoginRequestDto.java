package ar.edu.uncuyo.mzapata.digesto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
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

    @Email(message = "Ingrese un email válido")
    private String email;

    @NotNull(message = "Ingrese su contraseña")
    private String password;
}
