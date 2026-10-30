package ar.edu.uncuyo.mzapata.digesto.normativa;

import ar.edu.uncuyo.mzapata.digesto.archivo.ArchivoService;
import ar.edu.uncuyo.mzapata.digesto.archivo.TesseractOcrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;

/**
 * Aplica OCR en segundo plano a las normativas cuyo PDF no tiene texto embebido.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NormativaOcrService {

    private final NormativaRepository normativaRepository;
    private final ArchivoService archivoService;
    private final TesseractOcrService ocrService;

    /**
     * Se ejecuta después de confirmar la transacción que guardó la normativa,
     * para que el registro ya exista en la base de datos.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void process(NormativaOcrRequested event) {
        UUID normativaId = event.normativaId();
        UUID archivoId = event.archivoId();

        try {
            Normativa normativa = normativaRepository.findByIdAndDeletedFalse(normativaId).orElse(null);
            if (normativa == null) {
                log.info("Se omitió el OCR de la normativa {}: ya no existe", normativaId);
                return;
            }
            if (!archivoId.equals(normativa.getArchivo().getId())) {
                log.info("Se omitió el OCR de la normativa {}: el archivo cambió", normativaId);
                return;
            }

            String text = ocrService.extractText(archivoService.resolve(normativa.getArchivo()));
            if (text == null || text.isBlank()) {
                log.warn("El OCR no produjo texto para la normativa {}", normativaId);
                return;
            }

            int updated = normativaRepository.updateText(normativaId, archivoId, text.strip());
            if (updated == 0)
                log.info("Se omitió el texto OCR de la normativa {}: el archivo cambió o fue eliminada", normativaId);
            else
                log.info("Texto OCR actualizado para la normativa {}", normativaId);
        } catch (Exception e) {
            log.warn("No se pudo completar el OCR de la normativa {}: {}", normativaId, e.getMessage());
        }
    }
}
