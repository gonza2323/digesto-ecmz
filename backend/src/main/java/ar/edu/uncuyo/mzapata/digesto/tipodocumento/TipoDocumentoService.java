package ar.edu.uncuyo.mzapata.digesto.tipodocumento;

import ar.edu.uncuyo.mzapata.digesto.config.BusinessException;
import ar.edu.uncuyo.mzapata.digesto.normativa.NormativaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TipoDocumentoService {

    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final NormativaRepository normativaRepository;

    @Transactional(readOnly = true)
    public List<TipoDocumentoDto> list() {
        return tipoDocumentoRepository.findAllByOrderByNameAsc().stream().map(TipoDocumentoDto::of).toList();
    }

    @Transactional(readOnly = true)
    public TipoDocumento find(UUID id) {
        return tipoDocumentoRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("El tipo de normativa no existe"));
    }

    @Transactional
    public TipoDocumentoDto create(TipoDocumentoDto dto) {
        String name = dto.name().trim();
        if (tipoDocumentoRepository.existsByNameIgnoreCase(name))
            throw new BusinessException("Ya existe un tipo de normativa con ese nombre");

        return TipoDocumentoDto.of(tipoDocumentoRepository.save(TipoDocumento.builder().name(name).build()));
    }

    @Transactional
    public TipoDocumentoDto update(UUID id, TipoDocumentoDto dto) {
        TipoDocumento tipo = find(id);
        String name = dto.name().trim();
        if (tipoDocumentoRepository.existsByNameIgnoreCaseAndIdNot(name, id))
            throw new BusinessException("Ya existe un tipo de normativa con ese nombre");

        tipo.setName(name);
        return TipoDocumentoDto.of(tipo);
    }

    @Transactional
    public void delete(UUID id) {
        TipoDocumento tipo = find(id);
        if (normativaRepository.existsByTipoDocumentoId(id))
            throw new BusinessException("No se puede eliminar: hay normativas que usan este tipo");

        tipoDocumentoRepository.delete(tipo);
    }
}
