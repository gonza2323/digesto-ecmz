package ar.edu.uncuyo.mzapata.digesto.auth;

import ar.edu.uncuyo.mzapata.digesto.user.Usuario;
import ar.edu.uncuyo.mzapata.digesto.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmailAndDeletedFalse(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return new CustomUserDetails(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getPasswordHash(),
                List.of(usuario.getRole()),
                usuario.isMustChangePassword());
    }
}
