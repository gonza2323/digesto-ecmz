package ar.edu.uncuyo.mzapata.digesto.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
    Auth auth,
    String apiUrl,
    String frontendUrl,
    List<String> corsOrigins
) {
    public record Auth(AccessToken accessToken) {
        public record AccessToken(
            String secret,
            long durationMinutes
        ) {}
    }
}