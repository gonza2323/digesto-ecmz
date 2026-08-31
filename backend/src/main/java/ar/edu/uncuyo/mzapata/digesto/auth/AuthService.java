package ar.edu.uncuyo.mzapata.digesto.auth;

import ar.edu.uncuyo.mzapata.digesto.config.BusinessException;
import ar.edu.uncuyo.mzapata.digesto.user.Usuario;
import ar.edu.uncuyo.mzapata.digesto.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;

    /**
     * Valida las credenciales y devuelve la Authentication resultante, para que el
     * controller la guarde en la sesión HTTP.
     */
    public Authentication loginWithEmailPassword(LoginRequestDto loginRequest) {
        return authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
    }

    @Transactional(readOnly = true)
    public AuthUserDto me(UUID userId) {
        Usuario usuario = usuarioRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> BusinessException.notFound("El usuario no existe"));

        return new AuthUserDto(usuario.getId(), List.of(usuario.getRole()), usuario.isMustChangePassword());
    }
}
