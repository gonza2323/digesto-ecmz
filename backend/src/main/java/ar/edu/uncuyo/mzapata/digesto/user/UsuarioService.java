package ar.edu.uncuyo.mzapata.digesto.user;

import ar.edu.uncuyo.mzapata.digesto.auth.PasswordResetToken;
import ar.edu.uncuyo.mzapata.digesto.auth.PasswordResetTokenRepository;
import ar.edu.uncuyo.mzapata.digesto.config.AppProperties;
import ar.edu.uncuyo.mzapata.digesto.config.BusinessException;
import ar.edu.uncuyo.mzapata.digesto.mail.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final PasswordResetTokenRepository tokenRepository;
    private final AppProperties properties;
    private final SecureRandom random = new SecureRandom();

    @Transactional(readOnly = true)
    public List<UsuarioDto> list() {
        return usuarioRepository.findAllByDeletedFalseOrderByLastnameAsc().stream().map(UsuarioDto::of).toList();
    }

    @Transactional(readOnly = true)
    public Usuario find(UUID id) {
        return usuarioRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> BusinessException.notFound("El usuario no existe"));
    }

    /** Crea el usuario y envía un enlace de activación de un solo uso. */
    @Transactional
    public UsuarioDto create(UsuarioFormDto dto) {
        String email = dto.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailAndDeletedFalse(email))
            throw new BusinessException("Ya existe un usuario con ese email");

        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .firstname(dto.firstname().trim())
                .lastname(dto.lastname().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(randomToken()))
                .mustChangePassword(true)
                .role(dto.role())
                .build());

        PasswordResetToken token = tokenRepository.save(PasswordResetToken.builder()
                .token(UUID.randomUUID().toString())
                .usuario(usuario)
                .expiresAt(java.time.Instant.now().plusSeconds(
                        60 * properties.auth().passwordReset().durationMinutes()))
                .used(false)
                .activation(true)
                .build());

        mailService.send(email,
                "Digesto - Activación de cuenta",
                "Se creó su cuenta en el Digesto.\n\n"
                        + "Para definir su contraseña ingrese a:\n\n"
                        + properties.frontendUrl() + "/reset-password?token=" + token.getToken()
                        + "\n\nEl enlace vence en "
                        + properties.auth().passwordReset().durationMinutes() + " minutos.");

        return UsuarioDto.of(usuario);
    }

    @Transactional
    public UsuarioDto update(UUID id, UsuarioFormDto dto) {
        Usuario usuario = find(id);
        String email = dto.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailAndIdNotAndDeletedFalse(email, id))
            throw new BusinessException("Ya existe un usuario con ese email");

        usuario.setFirstname(dto.firstname().trim());
        usuario.setLastname(dto.lastname().trim());
        usuario.setEmail(email);
        usuario.setRole(dto.role());

        return UsuarioDto.of(usuario);
    }

    @Transactional
    public void delete(UUID id, UUID currentUserId) {
        if (id.equals(currentUserId))
            throw new BusinessException("No puede eliminar su propio usuario");

        find(id).setDeleted(true);
    }

    private String randomToken() {
        byte[] bytes = new byte[9];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
