package ar.edu.uncuyo.mzapata.digesto.tipodocumento;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record TipoDocumentoDto(UUID id, @NotBlank(message = "Ingrese el nombre") String name) {

    public static TipoDocumentoDto of(TipoDocumento tipo) {
        return new TipoDocumentoDto(tipo.getId(), tipo.getName());
    }
}
