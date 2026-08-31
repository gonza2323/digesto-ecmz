/*+ id: UUID
+ nro: int
+ titulo: String
+ descripcion: String
+ fechaEmision: LocalDate
+ fechaCarga: LocalDate
+ visible: Bool
+ texto: String
+ vector: pg_vector (tal vez para búsquedas)
+ aceptado: Bool*/

package ar.edu.uncuyo.mzapata.digesto.normativa;

import ar.edu.uncuyo.mzapata.digesto.archivo.Archivo;
import ar.edu.uncuyo.mzapata.digesto.entity.BaseEntity;
import ar.edu.uncuyo.mzapata.digesto.tiponormativa.TipoNormativa;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Array;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Normativa extends BaseEntity {

    //no se puede repetir nro + año(fecha emision) + tipo
    private Integer nro;
    private String title;
    private String description;
    @Lob
    private String texto;
    private LocalDate emisionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    private TipoNormativa tipoNormativa;

    @ManyToOne(fetch = FetchType.LAZY)
    private Archivo file;

    private LocalDate loadDate;
    private Boolean visible;
    private Boolean accepted;

    //pg_vector (para embeddings / búsquedas vectoriales con Hibernate 6.4+)
    @JdbcTypeCode(SqlTypes.VECTOR)
    @Array(length = 1536) // Cambia 1536 por la dimensión de tu modelo (ej. 384, 768, 1536)
    private float[] vector;




}