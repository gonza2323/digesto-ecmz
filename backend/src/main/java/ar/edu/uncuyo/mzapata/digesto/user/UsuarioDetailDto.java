package ar.edu.uncuyo.mzapata.digesto.user;

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
public class UsuarioDetailDto {
    private Long id;
    private String email;
    private UserRole role;
}
