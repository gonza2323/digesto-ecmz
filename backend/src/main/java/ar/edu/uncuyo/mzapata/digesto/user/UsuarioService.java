package ar.edu.uncuyo.mzapata.digesto.user;

import ar.edu.uncuyo.mzapata.digesto.bussinesException.BusinessException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;

    @Transactional
    //TODO: Decidir la creacion por defecto de la contraseña, y aplicar job para mandar contraseña por email
    public Usuario crearUsuario(UsuarioDetailDto dto) {

        if (!validarCreate(dto)) {
            throw new RuntimeException("No se pudo crear el usuario");
        }



        Usuario usuario = Usuario.builder()
                .firstname(dto.getFirstname())
                .lastname(dto.getLastname())
                .email(dto.getEmail())
                .passwordHash(dto.getFirstname().toLowerCase() + dto.getLastname().toLowerCase())
                .mustChangePassword(true)
                .role(dto.getRole())
                .build();

        repository.save(usuario);
        return usuario;
    }

    @Transactional
    public void eliminarUsuario(UsuarioSummaryDto dto){
        Usuario usuarioActual = repository.findByEmailAndDeletedFalse(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("No se pudo encontrar al usuario"));

        usuarioActual.setDeleted(true);
    }

    @Transactional
    public UsuarioDetailDto buscarUsuario(String email) {
        return repository.findByEmailAndDeletedFalse(email)
                .map(this::toDetailDto)
                .orElseThrow(() -> new BusinessException("No se pudo encontrar al usuario"));
    }

    //funcion para traer los datos completos del usuario actual
    @Transactional
    public UsuarioDetailDto getUsuario(String id) {
        return repository.findByIdAndDeletedFalse(UUID.fromString(id))
                .map(this::toDetailDto)
                .orElseThrow(() -> new BusinessException("No se pudo encontrar al usuario"));
    }

    @Transactional
    //TODO: Mejorar mensaje de error
    public UsuarioDetailDto actualizarUsuario(String id, UsuarioRequestDto newData){
        Optional<Usuario> usuarioActual = repository.findByIdAndDeletedFalse(UUID.fromString(id));

        if (!usuarioActual.isPresent()) {
            throw new RuntimeException("Ha ocurrido un error");
        }

        if (usuarioActual.get().isMustChangePassword()){
            throw new RuntimeException("Debe cambiar la primera contraseña"); //poner error mas claro
        }

        if (!validarUpdate(newData, UUID.fromString(id))){
            throw new RuntimeException("Uno o mas campos invalidos");
        }

        usuarioActual.get().setFirstname(newData.getFirstname());
        usuarioActual.get().setLastname(newData.getLastname());
        usuarioActual.get().setEmail(newData.getEmail());
        usuarioActual.get().setPasswordHash(newData.getPassword());

        repository.save(usuarioActual.get());
        return toDetailDto(usuarioActual.get());
    }

    // =========== Funciones De Utilidad ===========

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

    //Mapper para datos del usuario
    private UsuarioDetailDto toDetailDto(Usuario usuario) {
        return UsuarioDetailDto.builder()
                .id(usuario.getId())
                .firstname(usuario.getFirstname())
                .lastname(usuario.getLastname())
                .email(usuario.getEmail())
                .role(usuario.getRole())
                .build();
    }
    //validacion de campos para el update
    private boolean validarUpdate(UsuarioRequestDto dto, UUID id){
        if (dto.getFirstname() == null || dto.getFirstname().isBlank()
                || dto.getLastname() == null || dto.getLastname().isBlank()
                || dto.getEmail() == null || dto.getEmail().isBlank()
                || dto.getPassword() == null || dto.getPassword().isBlank() ) {
            return false;
        }
        return !repository.existsByEmailAndIdNotAndDeletedFalse(dto.getEmail(), id);
    }


}
