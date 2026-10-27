package ar.edu.uncuyo.mzapata.digesto.expediente;

public record ExpedienteDto(
        Integer recordNumber,
        String recordTitle
) {
    public static ExpedienteDto of(Expediente expediente) {
        return new ExpedienteDto(expediente.getRecordNumber(), expediente.getRecordTitle());
    }
}
