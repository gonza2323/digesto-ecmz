package ar.edu.uncuyo.mzapata.digesto.user;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    boolean existsByEmailAndDeletedFalse(String name);
    boolean existsByEmailAndIdNotAndDeletedFalse(String name, UUID id);

    Optional<Usuario> findByIdAndDeletedFalse(UUID id);
    Optional<Usuario> findByEmailAndDeletedFalse(String email);
}
