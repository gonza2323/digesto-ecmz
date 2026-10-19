package ar.edu.uncuyo.mzapata.digesto.mail;

import ar.edu.uncuyo.mzapata.digesto.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;
    private final AppProperties properties;

    @Value("${spring.mail.host:}")
    private String mailHost;

    /**
     * Envía un correo. Devuelve false si falla, para que quien llama pueda informar
     * qué destinatarios quedaron sin notificar sin abortar el resto del envío.
     */
    public boolean send(String to, String subject, String body) {
        if (mailHost == null || mailHost.isBlank()) {
            log.warn("SMTP sin configurar. Correo NO enviado a {} con asunto '{}'", to, subject);
            return false;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(properties.mail().from());
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            return true;
        } catch (Exception e) {
            log.error("Falló el envío de correo a {}: {}", to, e.getMessage());
            return false;
        }
    }
}
