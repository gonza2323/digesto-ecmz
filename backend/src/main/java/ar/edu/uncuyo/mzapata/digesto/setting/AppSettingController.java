package ar.edu.uncuyo.mzapata.digesto.setting;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/plantilla-correo")
@PreAuthorize("isAuthenticated()")
public class AppSettingController {

    private final AppSettingService appSettingService;

    @GetMapping
    public PlantillaCorreoDto get() {
        return new PlantillaCorreoDto(
                appSettingService.get(AppSettingService.MAIL_SUBJECT, AppSettingService.DEFAULT_MAIL_SUBJECT),
                appSettingService.get(AppSettingService.MAIL_BODY, AppSettingService.DEFAULT_MAIL_BODY));
    }

    @PutMapping
    public PlantillaCorreoDto update(@Valid @RequestBody PlantillaCorreoDto dto) {
        appSettingService.set(AppSettingService.MAIL_SUBJECT, dto.asunto());
        appSettingService.set(AppSettingService.MAIL_BODY, dto.cuerpo());
        return dto;
    }
}
