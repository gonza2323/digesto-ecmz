package ar.edu.uncuyo.mzapata.digesto.auth;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    AccessTokenDto token;
    AuthUserDto user;
}
