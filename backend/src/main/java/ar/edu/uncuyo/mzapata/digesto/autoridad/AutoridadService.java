package ar.edu.uncuyo.mzapata.digesto.autoridad;

import ar.edu.uncuyo.mzapata.digesto.config.BusinessException;
import ar.edu.uncuyo.mzapata.digesto.normativa.NormativaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AutoridadService {

    private final AutoridadRepository autoridadRepository;
    private final NormativaRepository normativaRepository;

    @Transactional(readOnly = true)
    public List<AutoridadDto> list() {
        return autoridadRepository.findAllByOrderByNameAsc().stream().map(AutoridadDto::of).toList();
    }

    @Transactional(readOnly = true)
    public Autoridad find(UUID id) {
        return autoridadRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("La autoridad no existe"));
    }

    @Transactional
    public AutoridadDto create(AutoridadDto dto) {
        String name = dto.name().trim();
        if (autoridadRepository.existsByNameIgnoreCase(name))
            throw new BusinessException("Ya existe una autoridad con ese nombre");

        return AutoridadDto.of(autoridadRepository.save(Autoridad.builder().name(name).build()));
    }

    @Transactional
    public AutoridadDto update(UUID id, AutoridadDto dto) {
        Autoridad autoridad = find(id);
        String name = dto.name().trim();
        if (autoridadRepository.existsByNameIgnoreCaseAndIdNot(name, id))
            throw new BusinessException("Ya existe una autoridad con ese nombre");

        autoridad.setName(name);
        return AutoridadDto.of(autoridad);
    }

    @Transactional
    public void delete(UUID id) {
        Autoridad autoridad = find(id);
        if (normativaRepository.existsByAutoridadId(id))
            throw new BusinessException("No se puede eliminar: hay normativas que usan esta autoridad");

        autoridadRepository.delete(autoridad);
    }
}
