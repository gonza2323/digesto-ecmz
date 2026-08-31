package ar.edu.uncuyo.mzapata.digesto.auth;

import ar.edu.uncuyo.mzapata.digesto.entity.BaseEntity;
import ar.edu.uncuyo.mzapata.digesto.user.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

/** Enlace temporal para recuperar la contraseña. */
@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(optional = false)
    private Usuario usuario;

    @Column(nullable = false)
    private Instant expiresAt;

    private boolean used;
}
