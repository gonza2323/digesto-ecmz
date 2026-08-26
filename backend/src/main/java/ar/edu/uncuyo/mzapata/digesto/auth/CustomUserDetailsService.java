package ar.edu.uncuyo.mzapata.digesto.auth;

import ar.edu.uncuyo.mzapata.digesto.user.Users;
import ar.edu.uncuyo.mzapata.digesto.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Users> usuarioOpt = usuarioRepository.findByEmailAndDeletedFalse(username);

        if (usuarioOpt.isEmpty())
            throw new UsernameNotFoundException("Usuario no encontrado");

        Users usuario = usuarioOpt.get();
        return new CustomUserDetails(usuario.getId(), usuario.getEmail(), usuario.getPasswordHash(), List.of(usuario.getRol()));
    }
}