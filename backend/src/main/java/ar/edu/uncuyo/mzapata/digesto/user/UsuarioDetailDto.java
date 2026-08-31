package ar.edu.uncuyo.mzapata.digesto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDetailDto {
    private UUID id;
    private String firstname;
    private String lastname;
    private String email;
    private UserRole role;
}
