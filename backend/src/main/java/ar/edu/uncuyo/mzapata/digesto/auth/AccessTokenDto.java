package ar.edu.uncuyo.mzapata.digesto.auth;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessTokenDto {
    private String value;
    private Instant expiryDate;
}
