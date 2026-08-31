package ar.edu.uncuyo.mzapata.digesto.user;

import ar.edu.uncuyo.mzapata.digesto.auth.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Gestión de cuentas administrativas: sólo superadmin.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('SUPERADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioDto> list() {
        return usuarioService.list();
    }

    @PostMapping
    public UsuarioDto create(@Valid @RequestBody UsuarioFormDto dto) {
        return usuarioService.create(dto);
    }

    @PutMapping("/{id}")
    public UsuarioDto update(@PathVariable UUID id, @Valid @RequestBody UsuarioFormDto dto) {
        return usuarioService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal CustomUserDetails current) {
        usuarioService.delete(id, current.getId());
    }
}
