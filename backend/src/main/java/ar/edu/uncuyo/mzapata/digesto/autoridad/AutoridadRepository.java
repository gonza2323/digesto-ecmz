package ar.edu.uncuyo.mzapata.digesto.autoridad;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AutoridadRepository extends JpaRepository<Autoridad, UUID> {
    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);

    List<Autoridad> findAllByOrderByNameAsc();
}
