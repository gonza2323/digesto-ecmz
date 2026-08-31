package ar.edu.uncuyo.mzapata.digesto.auth;

import ar.edu.uncuyo.mzapata.digesto.config.AppProperties;
import ar.edu.uncuyo.mzapata.digesto.config.BusinessException;
import ar.edu.uncuyo.mzapata.digesto.mail.MailService;
import ar.edu.uncuyo.mzapata.digesto.user.Usuario;
import ar.edu.uncuyo.mzapata.digesto.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final AppProperties properties;

    /** Cambio de contraseña del propio usuario (también cubre el cambio obligatorio del primer ingreso). */
    @Transactional
    public void change(UUID userId, ChangePasswordDto dto) {
        Usuario usuario = usuarioRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> BusinessException.notFound("El usuario no existe"));

        if (!passwordEncoder.matches(dto.currentPassword(), usuario.getPasswordHash()))
            throw new BusinessException("La contraseña actual no es correcta");

        usuario.setPasswordHash(passwordEncoder.encode(dto.newPassword()));
        usuario.setMustChangePassword(false);
    }

    /** Envía el enlace de recuperación. No revela si el email existe. */
    @Transactional
    public void forgot(ForgotPasswordDto dto) {
        usuarioRepository.findByEmailAndDeletedFalse(dto.email().trim().toLowerCase()).ifPresent(usuario -> {
            PasswordResetToken token = tokenRepository.save(PasswordResetToken.builder()
                    .token(UUID.randomUUID().toString())
                    .usuario(usuario)
                    .expiresAt(Instant.now().plusSeconds(60 * properties.auth().passwordReset().durationMinutes()))
                    .used(false)
                    .build());

            mailService.send(usuario.getEmail(),
                    "Digesto - Recuperación de contraseña",
                    "Para definir una nueva contraseña ingrese a:\n\n"
                            + properties.frontendUrl() + "/reset-password?token=" + token.getToken()
                            + "\n\nEl enlace vence en " + properties.auth().passwordReset().durationMinutes() + " minutos.");
        });
    }

    @Transactional
    public void reset(ResetPasswordDto dto) {
        PasswordResetToken token = tokenRepository.findByToken(dto.token())
                .orElseThrow(() -> new BusinessException("El enlace de recuperación no es válido"));

        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now()))
            throw new BusinessException("El enlace de recuperación venció o ya fue usado");

        Usuario usuario = token.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(dto.newPassword()));
        usuario.setMustChangePassword(false);
        token.setUsed(true);
    }
}
