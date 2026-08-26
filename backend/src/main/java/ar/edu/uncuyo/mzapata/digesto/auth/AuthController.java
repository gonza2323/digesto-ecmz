package ar.edu.uncuyo.mzapata.digesto.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@EnableMethodSecurity(prePostEnabled = true)
public class AuthController {

    private final AccessTokenService accessTokenService;
    private final AuthService authService;
//    private final ClienteFacade clienteFacade;
//    private final PersonaService personaService;

    @PostMapping("/login")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto loginRequest) {
        CustomUserDetails user = authService.loginWithEmailPassword(loginRequest);
        AccessTokenDto accessToken = accessTokenService.createToken(user.getId(), user.getRoles());

        LoginResponseDto response = LoginResponseDto.builder()
                .token(accessToken)
                .user(new AuthUserDto(user.getId(), user.getRoles()))
                .build();

        return ResponseEntity.ok()
                .body(response);
    }

//    @PostMapping("/signup")
//    @PreAuthorize("isAnonymous()")
//    public ResponseEntity<LoginResponseDto> signup(
//            @RequestPart ClienteCreateRequestDto clienteDto,
//            @RequestPart(required = false) MultipartFile imageFile) {
//
//        ImageData imageData = null;
//        if (imageFile != null && !imageFile.isEmpty()) {
//            try {
//                byte[] content = imageFile.getBytes();
//                String fileName = imageFile.getOriginalFilename();
//                String mimeType = imageFile.getContentType();
//                imageData = new ImageData(fileName, mimeType, content);
//            } catch (IOException e) {
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
//            }
//        }
//
//        Cliente cliente = clienteFacade.registarCliente(clienteDto, imageData);
//
//        Usuario user = cliente.getUsuario();
//        AccessTokenDto accessToken = accessTokenService.createToken(user.getId(), List.of(user.getRol()));
//
//        LoginResponseDto response = LoginResponseDto.builder()
//                .token(accessToken)
//                .user(new AuthUserDto(user.getId(), List.of(user.getRol())))
//                .build();
//
//        return ResponseEntity.ok()
//                .body(response);
//    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthUserDto> authStatus(@AuthenticationPrincipal CurrentUser user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(new AuthUserDto(user.getId(), user.getRoles()));
    }
}
