package ar.edu.uncuyo.mzapata.digesto.tiponormativa;

import ar.edu.uncuyo.mzapata.digesto.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class TipoNormativa extends BaseEntity {
    @Column(nullable = false)
    private String nombre;
}
