package ar.edu.uncuyo.mzapata.digesto.normativa;

import java.util.UUID;

/**
 * Solicita el OCR asíncrono de una normativa recién guardada.
 * Incluye el archivo para no pisar el texto de una versión posterior.
 */
public record NormativaOcrRequested(UUID normativaId, UUID archivoId) {
}
