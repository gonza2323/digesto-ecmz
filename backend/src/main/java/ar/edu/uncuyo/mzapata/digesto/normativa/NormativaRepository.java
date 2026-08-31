package ar.edu.uncuyo.mzapata.digesto.normativa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface NormativaRepository extends JpaRepository<Normativa, UUID> {

    boolean existsByAutoridadId(UUID autoridadId);

    boolean existsByTipoDocumentoId(UUID tipoDocumentoId);

    boolean existsByExpedienteRecordNumberAndDeletedFalse(Integer recordNumber);

    @EntityGraph(attributePaths = {"tipoDocumento", "autoridad", "expediente", "archivo"})
    Optional<Normativa> findByIdAndDeletedFalse(UUID id);

    /**
     * Unicidad de (año de publicación, número, tipo de normativa).
     */
    @Query("""
                SELECT COUNT(n) > 0 FROM Normativa n
                WHERE n.deleted = false
                  AND n.number = :number
                  AND n.tipoDocumento.id = :tipoDocumentoId
                  AND YEAR(n.releaseDate) = :anio
                  AND (:excludeId IS NULL OR n.id <> :excludeId)
            """)
    boolean existsDuplicate(@Param("anio") int anio,
                            @Param("number") Integer number,
                            @Param("tipoDocumentoId") UUID tipoDocumentoId,
                            @Param("excludeId") UUID excludeId);

    /**
     * Búsqueda con filtros opcionales.
     * {@code soloPublicas} restringe al sitio público; {@code soloPendientes}, a la cola de aprobación.
     */
    @EntityGraph(attributePaths = {"tipoDocumento", "autoridad", "expediente", "archivo"})
    @Query("""
                SELECT n FROM Normativa n
                WHERE n.deleted = false
                  AND (:soloPublicas = false OR (n.visible = true AND n.accepted = true))
                  AND (:soloPendientes = false OR n.pendingApproval = true)
                  AND (:tipoDocumentoId IS NULL OR n.tipoDocumento.id = :tipoDocumentoId)
                  AND (:autoridadId IS NULL OR n.autoridad.id = :autoridadId)
                  AND (:anio IS NULL OR YEAR(n.releaseDate) = :anio)
                  AND (:number IS NULL OR n.number = :number)
                  AND (:recordNumber IS NULL OR n.expediente.recordNumber = :recordNumber)
                  AND (:desde IS NULL OR n.releaseDate >= :desde)
                  AND (:hasta IS NULL OR n.releaseDate <= :hasta)
                  AND (:texto IS NULL OR (LOWER(n.title) LIKE :texto
                                       OR LOWER(n.description) LIKE :texto
                                       OR LOWER(n.text) LIKE :texto))
            """)
    Page<Normativa> search(@Param("soloPublicas") boolean soloPublicas,
                           @Param("soloPendientes") boolean soloPendientes,
                           @Param("tipoDocumentoId") UUID tipoDocumentoId,
                           @Param("autoridadId") UUID autoridadId,
                           @Param("anio") Integer anio,
                           @Param("number") Integer number,
                           @Param("recordNumber") Integer recordNumber,
                           @Param("desde") LocalDate desde,
                           @Param("hasta") LocalDate hasta,
                           @Param("texto") String texto,
                           Pageable pageable);
}
