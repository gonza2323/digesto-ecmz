/*+ id: UUID
+ path: String
+ nombre: String
+ tamaño: Int
+ mime: String*/
package ar.edu.uncuyo.mzapata.digesto.archivo;

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
public class Archivo extends BaseEntity {

    @Column(nullable = false)
    private String path;
    @Column(nullable = false)
    private String name;
    private Integer size;
    private String mime;

}
