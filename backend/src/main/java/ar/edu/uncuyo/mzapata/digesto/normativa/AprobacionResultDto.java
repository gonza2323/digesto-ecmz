package ar.edu.uncuyo.mzapata.digesto.normativa;

import java.util.List;

/** Resultado de aprobar una normativa, con los correos que no se pudieron enviar. */
public record AprobacionResultDto(NormativaDetailDto normativa, List<String> notificacionesFallidas) {}
