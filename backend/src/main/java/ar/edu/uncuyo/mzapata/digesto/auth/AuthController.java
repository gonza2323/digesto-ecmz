package ar.edu.uncuyo.mzapata.digesto.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

/**
 * Autenticación basada en sesión HTTP (cookie de sesión): el login deja la identidad
 * guardada en la sesión y las siguientes requests llegan autenticadas gracias a esa
 * cookie. No se emite ni se valida ningún tipo de token.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordService passwordService;

    // Desde Spring Security 6 el SecurityContext hay que guardarlo explícitamente
    // para que persista entre requests (ya no se hace automáticamente al final del request).
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    @PostMapping("/login")
    public AuthUserDto login(@Valid @RequestBody LoginRequestDto loginRequest,
                             HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = authService.loginWithEmailPassword(loginRequest);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        return new AuthUserDto(user.getId(), user.getRoles(), user.isMustChangePassword());
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public AuthUserDto me(@AuthenticationPrincipal CustomUserDetails user) {
        return authService.me(user.getId());
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public void changePassword(@AuthenticationPrincipal CustomUserDetails user,
                               @Valid @RequestBody ChangePasswordDto dto) {
        passwordService.change(user.getId(), dto);
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@Valid @RequestBody ForgotPasswordDto dto) {
        passwordService.forgot(dto);
    }

    @PostMapping("/reset-password")
    public void resetPassword(@Valid @RequestBody ResetPasswordDto dto) {
        passwordService.reset(dto);
    }
}
