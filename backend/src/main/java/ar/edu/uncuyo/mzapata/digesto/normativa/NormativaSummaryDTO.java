package ar.edu.uncuyo.mzapata.digesto.normativa;

import lombok.AllArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
public class NormativaSummaryDTO {
    private Integer nro;
    private String titulo;
    private String descripcion;
    private LocalDate fechaEmision;
    private boolean aceptado;
}
