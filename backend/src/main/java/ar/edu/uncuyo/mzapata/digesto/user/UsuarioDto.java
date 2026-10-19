package ar.edu.uncuyo.mzapata.digesto.user;

import java.util.UUID;

public record UsuarioDto(
        UUID id,
        String firstname,
        String lastname,
        String email,
        UserRole role,
        boolean mustChangePassword
) {
    public static UsuarioDto of(Usuario usuario) {
        return new UsuarioDto(
                usuario.getId(),
                usuario.getFirstname(),
                usuario.getLastname(),
                usuario.getEmail(),
                usuario.getRole(),
                usuario.isMustChangePassword());
    }
}
