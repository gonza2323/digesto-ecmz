package ar.edu.uncuyo.mzapata.digesto.normativa;

import ar.edu.uncuyo.mzapata.digesto.archivo.Archivo;
import ar.edu.uncuyo.mzapata.digesto.autoridad.Autoridad;
import ar.edu.uncuyo.mzapata.digesto.entity.BaseEntity;
import ar.edu.uncuyo.mzapata.digesto.expediente.Expediente;
import ar.edu.uncuyo.mzapata.digesto.tipodocumento.TipoDocumento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Normativa extends BaseEntity {

    /** Número propio de la normativa: único por (año de publicación, número, tipo). */
    @Column(nullable = false)
    private Integer number;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    /** Texto extraído del PDF. No se muestra al público, sólo alimenta la búsqueda. */
    @Column(columnDefinition = "text")
    private String text;

    /** Fecha en que se decretó la normativa. */
    @Column(nullable = false)
    private LocalDate releaseDate;

    /** Fecha de carga al sistema. */
    @Column(nullable = false)
    private LocalDate loadDate;

    private boolean visible;

    private boolean accepted;

    /** Enviada a aprobación; si es false y no está aceptada, es un borrador. */
    private boolean pendingApproval;

    /** Copia JSON de los valores previos, para poder deshacer una modificación rechazada. */
    @Column(columnDefinition = "text")
    private String previousVersion;

    @ManyToOne(optional = false)
    private Autoridad autoridad;

    @ManyToOne(optional = false)
    private TipoDocumento tipoDocumento;

    @ManyToOne(optional = false)
    private Expediente expediente;

    @OneToOne(optional = false, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private Archivo archivo;

    @OneToMany(mappedBy = "normativa", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Notificacion> notificaciones = new ArrayList<>();

    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private UUID createdBy;

    @LastModifiedBy
    private UUID updatedBy;

    public String estado() {
        if (accepted && visible) return "PUBLICADA";
        if (pendingApproval) return "PENDIENTE";
        return "BORRADOR";
    }

    public void replaceNotificaciones(List<String> emails) {
        notificaciones.clear();
        if (emails == null) return;
        emails.stream()
                .filter(email -> email != null && !email.isBlank())
                .map(email -> Notificacion.builder().email(email.trim()).normativa(this).build())
                .forEach(notificaciones::add);
    }
}
