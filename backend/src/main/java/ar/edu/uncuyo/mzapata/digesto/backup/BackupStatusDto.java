package ar.edu.uncuyo.mzapata.digesto.backup;

import java.time.Instant;

/** Estado del último backup. {@code alerta} se enciende si pasó el plazo configurado. */
public record BackupStatusDto(Instant ultimoBackup, boolean alerta, int mesesDeAlerta) {}
