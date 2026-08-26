package ar.edu.uncuyo.mzapata.digesto.auth;

import ar.edu.uncuyo.mzapata.digesto.user.UserRole;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Getter
@RequiredArgsConstructor
public class CurrentUser implements Principal {

    private final UUID id;
    private final List<UserRole> roles;

    @Override
    public String getName() {
        return id.toString();
    }
}
