package ar.edu.uncuyo.mzapata.digesto.setting;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppSettingService {

    public static final String MAIL_SUBJECT = "mail.notificacion.asunto";
    public static final String MAIL_BODY = "mail.notificacion.cuerpo";
    public static final String LAST_BACKUP = "backup.ultimo";

    public static final String DEFAULT_MAIL_SUBJECT =
            "Digesto Escuela de Comercio Martín Zapata - Nueva normativa publicada";
    public static final String DEFAULT_MAIL_BODY = """
            Usted ha sido notificado de la publicación de la siguiente normativa:

            {titulo}

            Puede consultarla en: {enlace}
            """;

    private final AppSettingRepository appSettingRepository;

    @Transactional(readOnly = true)
    public String get(String key, String defaultValue) {
        return appSettingRepository.findById(key).map(AppSetting::getValue).orElse(defaultValue);
    }

    @Transactional
    public void set(String key, String value) {
        appSettingRepository.save(new AppSetting(key, value));
    }
}
