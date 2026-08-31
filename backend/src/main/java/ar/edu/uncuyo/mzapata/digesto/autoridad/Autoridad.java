package ar.edu.uncuyo.mzapata.digesto.autoridad;

import ar.edu.uncuyo.mzapata.digesto.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Autoridad extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;
}
