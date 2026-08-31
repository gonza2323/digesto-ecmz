package ar.edu.uncuyo.mzapata.digesto.normativa;

import ar.edu.uncuyo.mzapata.digesto.tiponormativa.TipoNormativa;
import jakarta.persistence.Lob;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NormativaDto {

    private Integer nro;
    private String title;
    private String description;
    @Lob
    private String texto;
    private LocalDate emisionDate;
    private TipoNormativa tipoNormativa;
}
