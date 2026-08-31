package ar.edu.uncuyo.mzapata.digesto.expediente;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ExpedienteRepository extends JpaRepository<Expediente, UUID> {
    Optional<Expediente> findByRecordNumber(Integer recordNumber);
}
