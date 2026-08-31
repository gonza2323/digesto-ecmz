package ar.edu.uncuyo.mzapata.digesto.auth;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AccessTokenService accessTokenService;
    private final AuthService authService;
    private final PasswordService passwordService;

    @PostMapping("/login")
    public LoginResponseDto login(@Valid @RequestBody LoginRequestDto loginRequest) {
        CustomUserDetails user = authService.loginWithEmailPassword(loginRequest);
        AccessTokenDto accessToken = accessTokenService.createToken(user.getId(), user.getRoles());

        return LoginResponseDto.builder()
                .token(accessToken)
                .user(new AuthUserDto(user.getId(), user.getRoles(), user.isMustChangePassword()))
                .build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public AuthUserDto me(@AuthenticationPrincipal CurrentUser user) {
        return authService.me(user.getId());
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public void changePassword(@AuthenticationPrincipal CurrentUser user,
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
