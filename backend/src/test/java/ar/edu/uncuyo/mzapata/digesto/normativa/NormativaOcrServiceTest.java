package ar.edu.uncuyo.mzapata.digesto.normativa;

import ar.edu.uncuyo.mzapata.digesto.archivo.Archivo;
import ar.edu.uncuyo.mzapata.digesto.archivo.ArchivoService;
import ar.edu.uncuyo.mzapata.digesto.archivo.TesseractOcrService;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class NormativaOcrServiceTest {

    private final NormativaRepository normativaRepository = mock(NormativaRepository.class);
    private final ArchivoService archivoService = mock(ArchivoService.class);
    private final TesseractOcrService ocrService = mock(TesseractOcrService.class);
    private final NormativaOcrService service = new NormativaOcrService(
            normativaRepository, archivoService, ocrService);

    @Test
    void updatesTextWhenFileMatches() {
        UUID normativaId = UUID.randomUUID();
        Archivo archivo = archivo(UUID.randomUUID());
        Normativa normativa = normativa(normativaId, archivo);
        Path path = Path.of("/tmp/normativa.pdf");

        when(normativaRepository.findByIdAndDeletedFalse(normativaId)).thenReturn(Optional.of(normativa));
        when(archivoService.resolve(archivo)).thenReturn(path);
        when(ocrService.extractText(path)).thenReturn(" hola cómo estás? ");
        when(normativaRepository.updateText(normativaId, archivo.getId(), "hola cómo estás?")).thenReturn(1);

        service.process(new NormativaOcrRequested(normativaId, archivo.getId()));

        verify(normativaRepository).updateText(normativaId, archivo.getId(), "hola cómo estás?");
    }

    @Test
    void skipsWhenNormativaNoLongerExists() {
        UUID normativaId = UUID.randomUUID();
        UUID archivoId = UUID.randomUUID();

        when(normativaRepository.findByIdAndDeletedFalse(normativaId)).thenReturn(Optional.empty());

        service.process(new NormativaOcrRequested(normativaId, archivoId));

        verifyNoInteractions(ocrService);
        verify(normativaRepository, never()).updateText(any(), any(), any());
    }

    @Test
    void skipsWhenArchivoChanged() {
        UUID normativaId = UUID.randomUUID();
        UUID requestedArchivoId = UUID.randomUUID();
        Normativa normativa = normativa(normativaId, archivo(UUID.randomUUID()));

        when(normativaRepository.findByIdAndDeletedFalse(normativaId)).thenReturn(Optional.of(normativa));

        service.process(new NormativaOcrRequested(normativaId, requestedArchivoId));

        verifyNoInteractions(ocrService);
        verify(normativaRepository, never()).updateText(any(), any(), any());
    }

    @Test
    void skipsWhenOcrProducesNoText() {
        UUID normativaId = UUID.randomUUID();
        Archivo archivo = archivo(UUID.randomUUID());
        Normativa normativa = normativa(normativaId, archivo);
        Path path = Path.of("/tmp/normativa.pdf");

        when(normativaRepository.findByIdAndDeletedFalse(normativaId)).thenReturn(Optional.of(normativa));
        when(archivoService.resolve(archivo)).thenReturn(path);
        when(ocrService.extractText(path)).thenReturn(" \n ");

        service.process(new NormativaOcrRequested(normativaId, archivo.getId()));

        verify(normativaRepository, never()).updateText(any(), any(), any());
    }

    private Normativa normativa(UUID id, Archivo archivo) {
        return Normativa.builder()
                .id(id)
                .archivo(archivo)
                .build();
    }

    private Archivo archivo(UUID id) {
        return Archivo.builder()
                .id(id)
                .path(id + ".pdf")
                .name("normativa.pdf")
                .size(1024)
                .mime("application/pdf")
                .build();
    }
}
