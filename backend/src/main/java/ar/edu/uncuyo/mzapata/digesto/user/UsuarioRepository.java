package ar.edu.uncuyo.mzapata.digesto.user;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    boolean existsByEmailAndDeletedFalse(String email);

    boolean existsByEmailAndIdNotAndDeletedFalse(String email, UUID id);

    List<Usuario> findAllByDeletedFalseOrderByLastnameAsc();

    Optional<Usuario> findByIdAndDeletedFalse(UUID id);

    Optional<Usuario> findByEmailAndDeletedFalse(String email);
}
