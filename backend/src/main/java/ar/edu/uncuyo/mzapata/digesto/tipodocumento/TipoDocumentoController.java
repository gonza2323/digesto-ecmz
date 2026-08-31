package ar.edu.uncuyo.mzapata.digesto.tipodocumento;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tipos-documento")
public class TipoDocumentoController {

    private final TipoDocumentoService tipoDocumentoService;

    @GetMapping
    public List<TipoDocumentoDto> list() {
        return tipoDocumentoService.list();
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public TipoDocumentoDto create(@Valid @RequestBody TipoDocumentoDto dto) {
        return tipoDocumentoService.create(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public TipoDocumentoDto update(@PathVariable UUID id, @Valid @RequestBody TipoDocumentoDto dto) {
        return tipoDocumentoService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public void delete(@PathVariable UUID id) {
        tipoDocumentoService.delete(id);
    }
}
