package ar.edu.uncuyo.mzapata.digesto.tipodocumento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record TipoDocumentoDto(UUID id,
                               @NotBlank(message = "Ingrese el nombre")
                               @Size(max = 255, message = "El nombre no puede superar los 255 caracteres")
                               String name) {

    public static TipoDocumentoDto of(TipoDocumento tipo) {
        return new TipoDocumentoDto(tipo.getId(), tipo.getName());
    }
}
