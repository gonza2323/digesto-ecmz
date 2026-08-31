package ar.edu.uncuyo.mzapata.digesto.tipodocumento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, UUID> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);
    List<TipoDocumento> findAllByOrderByNameAsc();
}
