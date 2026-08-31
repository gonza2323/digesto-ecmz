package ar.edu.uncuyo.mzapata.digesto.auth;

import ar.edu.uncuyo.mzapata.digesto.user.UserRole;

import java.util.Collection;
import java.util.UUID;

public record AuthUserDto(UUID userId, Collection<UserRole> roles, boolean mustChangePassword) {}
