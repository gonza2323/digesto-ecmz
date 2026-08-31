package ar.edu.uncuyo.mzapata.digesto.user;

import ar.edu.uncuyo.mzapata.digesto.bussinesException.BusinessException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

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
    //TODO: Mejorar mensaje de error, hacer un update dedicado para la contraseña
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

        repository.save(usuarioActual.get());
        return toDetailDto(usuarioActual.get());
    }

    @Transactional
    //TODO: En iteracion futura agregar la encriptacion de claves
    public UsuarioDetailDto firstLogIn(String id, String newPassword) { //funcion para primer ingreso
        Optional<Usuario> usuario = repository.findByIdAndDeletedFalse(UUID.fromString(id));
        if (usuario.isPresent()){

            //valido que no este vacia ni sean solo espacios en blanco
            if (newPassword.isBlank() || newPassword.isEmpty()){
                throw new BusinessException("La contraseña no puede estar vacia");
            }

            String oldPassword = usuario.get().getPasswordHash(); //recordar que sera un hash

            //valido que no deje igual la contrasenia
            if (Objects.equals(oldPassword, newPassword)){
                throw new BusinessException("La contraseña debe ser distinta");
            }

            usuario.get().setPasswordHash(newPassword);
            usuario.get().setMustChangePassword(false);
            repository.save(usuario.get());

            return toDetailDto(usuario.get());
        } else {
            throw new RuntimeException("No existe el usuario");
        }
    }

    // ====================== Funciones De Utilidad ======================

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
    //validacion de campos para el update, creo que conviene dejar por separado el update de la contraseña
    private boolean validarUpdate(UsuarioRequestDto dto, UUID id){
        if (dto.getFirstname() == null || dto.getFirstname().isBlank()
                || dto.getLastname() == null || dto.getLastname().isBlank()
                || dto.getEmail() == null || dto.getEmail().isBlank()) {
            return false;
        }
        return !repository.existsByEmailAndIdNotAndDeletedFalse(dto.getEmail(), id);
    }

    //    //funcion para emparejar los datos ingresados por el usuario en funciones de utilidad
    //    private UsuarioDetailDto formatData(UsuarioDetailDto dto){
    //
    //    }


}
