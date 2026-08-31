package ar.edu.uncuyo.mzapata.digesto.normativa;

import ar.edu.uncuyo.mzapata.digesto.archivo.ArchivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Sitio público: sólo normativas aprobadas y visibles.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/normativas")
public class NormativaController {

    private final NormativaService normativaService;
    private final ArchivoService archivoService;

    @GetMapping
    public Page<NormativaSummaryDto> search(
            NormativaFilterDto filtro,
            @PageableDefault(size = 10, sort = "releaseDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return normativaService.search(filtro, pageable);
    }

    @GetMapping("/{id}")
    public NormativaDetailDto find(@PathVariable UUID id) {
        return normativaService.findPublic(id);
    }

    @GetMapping("/{id}/archivo")
    public ResponseEntity<Resource> archivo(@PathVariable UUID id,
                                            @RequestParam(defaultValue = "false") boolean download) {
        return archivoService.toResponse(normativaService.archivoPublic(id), download);
    }
}
