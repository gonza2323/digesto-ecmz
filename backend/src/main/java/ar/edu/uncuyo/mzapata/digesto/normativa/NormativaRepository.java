package ar.edu.uncuyo.mzapata.digesto.normativa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NormativaRepository extends JpaRepository<Normativa, UUID> {

    // ?1[0] = nro, ?1[1] = emisionDate, ?1[2] = tipoNormativa
    @Query("SELECT n FROM Normativa n WHERE n.nro = ?1[0] AND n.emisionDate = ?1[1] AND n.tipoNormativa = ?1[2]")
    Optional<Normativa> findByDetails(List<Object> details);
}