package ar.edu.uncuyo.mzapata.digesto.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/usuarios")
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService userService;

    @PostMapping("/crear")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> crearUsuario(UsuarioDetailDto dto) {
        try {
            userService.crearUsuario(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
