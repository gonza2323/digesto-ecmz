package ar.edu.uncuyo.mzapata.digesto.user;

import ar.edu.uncuyo.mzapata.digesto.auth.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/usuarios")
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService userService;


    @PostMapping("/crear")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> crearUsuario(@RequestBody UsuarioDetailDto dto) {
        try {
            userService.crearUsuario(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/eliminar")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> eliminarUsuario(@RequestBody UsuarioSummaryDto dto){
        try {
            userService.eliminarUsuario(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    //TODO: Revisar como entra el formato del email a buscar. Verificar si esta vacio, incorrecto, malicioso, etc.
    @GetMapping("/buscar/{email}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<UsuarioDetailDto> buscarUsuario(@PathVariable String email) {
        try {
            return ResponseEntity.ok(userService.buscarUsuario(email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDetailDto> buscarMiUsuario(@AuthenticationPrincipal CurrentUser currentUser) {
        try {
            if (currentUser != null) {
                String id = currentUser.getName();
                return ResponseEntity.ok(userService.getUsuario(id));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/actualizar")
    public ResponseEntity<UsuarioDetailDto> actualizarUsuario(@AuthenticationPrincipal CurrentUser currentUser, @RequestBody UsuarioRequestDto dto){
        try {
            if (currentUser != null) {
                String id = currentUser.getName();
                return ResponseEntity.ok(userService.actualizarUsuario(id, dto));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/primer-ingreso")
    public ResponseEntity<UsuarioDetailDto> firstLogIn(@AuthenticationPrincipal CurrentUser currentUser, @RequestParam String newPassword){
        try {
            if (currentUser != null) {
                String id = currentUser.getName();
                return ResponseEntity.ok(userService.firstLogIn(id, newPassword));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    

}
