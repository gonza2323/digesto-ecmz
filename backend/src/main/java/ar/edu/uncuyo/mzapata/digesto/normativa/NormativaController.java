package ar.edu.uncuyo.mzapata.digesto.normativa;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/normativas")
public class NormativaController {
    private final NormativaService normativaService;

    @GetMapping("")
    public Page<NormativaSummaryDTO> listNormativasSummaries(Pageable pageable) {
        return normativaService.listNormativas(pageable);
    }


}
