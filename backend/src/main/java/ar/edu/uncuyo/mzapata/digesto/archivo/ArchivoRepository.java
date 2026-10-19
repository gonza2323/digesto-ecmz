package ar.edu.uncuyo.mzapata.digesto.archivo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ArchivoRepository extends JpaRepository<Archivo, UUID> {
}
