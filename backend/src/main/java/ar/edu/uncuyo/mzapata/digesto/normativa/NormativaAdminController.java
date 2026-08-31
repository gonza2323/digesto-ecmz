package ar.edu.uncuyo.mzapata.digesto.normativa;

import ar.edu.uncuyo.mzapata.digesto.archivo.ArchivoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

/** Panel de administración: incluye borradores y pendientes de aprobación. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/normativas")
@PreAuthorize("isAuthenticated()")
public class NormativaAdminController {

    private final NormativaService normativaService;
    private final ArchivoService archivoService;

    @GetMapping
    public Page<NormativaSummaryDto> list(
            NormativaFilterDto filtro,
            @RequestParam(defaultValue = "false") boolean pendientes,
            @PageableDefault(size = 10, sort = "loadDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return normativaService.searchAdmin(filtro, pendientes, pageable);
    }

    @GetMapping("/expediente-en-uso")
    public Map<String, Boolean> expedienteEnUso(@RequestParam Integer numero) {
        return Map.of("enUso", normativaService.expedienteEnUso(numero));
    }

    @GetMapping("/{id}")
    public NormativaDetailDto find(@PathVariable UUID id) {
        return normativaService.findAdmin(id);
    }

    @GetMapping("/{id}/archivo")
    public ResponseEntity<Resource> archivo(@PathVariable UUID id,
                                            @RequestParam(defaultValue = "false") boolean download) {
        return archivoService.toResponse(normativaService.archivoAdmin(id), download);
    }

    @PostMapping
    public NormativaDetailDto create(@Valid @RequestPart NormativaFormDto normativa,
                                     @RequestPart MultipartFile archivo) {
        return normativaService.create(normativa, archivo);
    }

    @PutMapping("/{id}")
    public NormativaDetailDto update(@PathVariable UUID id,
                                     @Valid @RequestPart NormativaFormDto normativa,
                                     @RequestPart(required = false) MultipartFile archivo) {
        return normativaService.update(id, normativa, archivo);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        normativaService.delete(id);
    }

    @PostMapping("/{id}/aprobar")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public AprobacionResultDto approve(@PathVariable UUID id) {
        return normativaService.approve(id);
    }

    @PostMapping("/{id}/rechazar")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public NormativaDetailDto reject(@PathVariable UUID id,
                                     @RequestParam(required = false) String motivo) {
        return normativaService.reject(id, motivo);
    }
}
