package ar.edu.uncuyo.mzapata.digesto.user;

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

    /**
     * Crea el usuario con una contraseña generada que se envía por correo.
     */
    @Transactional
    public UsuarioDto create(UsuarioFormDto dto) {
        String email = dto.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailAndDeletedFalse(email))
            throw new BusinessException("Ya existe un usuario con ese email");

        String password = generatePassword();

        Usuario usuario = usuarioRepository.save(Usuario.builder()
                .firstname(dto.firstname().trim())
                .lastname(dto.lastname().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .mustChangePassword(true)
                .role(dto.role())
                .build());

        mailService.send(email,
                "Digesto - Acceso al sistema",
                "Se creó su cuenta en el Digesto.\n\nEmail: " + email
                        + "\nContraseña provisoria: " + password
                        + "\n\nDeberá cambiarla la primera vez que ingrese.");

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

    private String generatePassword() {
        byte[] bytes = new byte[9];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
