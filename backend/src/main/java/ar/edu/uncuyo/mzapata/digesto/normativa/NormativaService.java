package ar.edu.uncuyo.mzapata.digesto.normativa;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NormativaService {
    private final NormativaRepository normativaRepository;

    public Page<NormativaSummaryDTO> listNormativas(Pageable pageable) {
        return normativaRepository.listNormativasSummaries(pageable);
    }
}
