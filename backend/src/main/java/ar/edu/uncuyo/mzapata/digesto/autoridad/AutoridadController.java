package ar.edu.uncuyo.mzapata.digesto.autoridad;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/autoridades")
public class AutoridadController {

    private final AutoridadService autoridadService;

    @GetMapping
    public List<AutoridadDto> list() {
        return autoridadService.list();
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public AutoridadDto create(@Valid @RequestBody AutoridadDto dto) {
        return autoridadService.create(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public AutoridadDto update(@PathVariable UUID id, @Valid @RequestBody AutoridadDto dto) {
        return autoridadService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public void delete(@PathVariable UUID id) {
        autoridadService.delete(id);
    }
}
