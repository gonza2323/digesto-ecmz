package ar.edu.uncuyo.mzapata.digesto.normativa;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface NormativaRepository extends JpaRepository<Normativa, UUID> {
    @Query("""
    SELECT NEW ar.edu.uncuyo.mzapata.digesto.normativa.NormativaSummaryDTO(
            n.nro,
            n.title,
            n.description,
            n.uploadedDate,
            n.accepted
        )
    FROM Normativa n
    WHERE n.deleted = false
""")
    Page<NormativaSummaryDTO> listNormativasSummaries(Pageable pageable);
}
