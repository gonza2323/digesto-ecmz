package ar.edu.uncuyo.mzapata.digesto.user;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;

    @Transactional
    //TODO: Decidir la creacion por defecto de la contraseña
    public Usuario crearUsuario(UsuarioDetailDto dto) {

        if (!validarCreate(dto)) {
            throw new RuntimeException("No se pudo crear el usuario");
        }

        Usuario usuario = Usuario.builder()
                .firstname(dto.getFirstname())
                .lastname(dto.getLastname())
                .email(dto.getEmail())
                .passwordHash("")
                .mustChangePassword(true)
                .role(dto.getRole())
                .build();

        repository.save(usuario);
        return usuario;
    }

    @Transactional
    public void deleteUsuario(UsuarioSummaryDto dto){
        Usuario usuarioActual = repository.findByEmailAndDeletedFalse(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("No se pudo encontrar al usuario"));

        usuarioActual.setDeleted(true);
    }

    //Valido Campos
    //TODO: Mejorar la validacion del email y revisar
    private boolean validarCreate(UsuarioDetailDto dto) {
        if (dto.getFirstname() == null || dto.getFirstname().isBlank()
                || dto.getLastname() == null || dto.getLastname().isBlank()
                || dto.getEmail() == null || dto.getEmail().isBlank()) {
            return false;
        }
        return !repository.existsByEmailAndDeletedFalse(dto.getEmail());
    }
}
