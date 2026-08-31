package ar.edu.uncuyo.mzapata.digesto.config;

import org.springframework.http.HttpStatus;

/** Error de negocio esperable: se traduce a una respuesta con mensaje para el usuario. */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(String message) {
        this(HttpStatus.BAD_REQUEST, message);
    }

    public BusinessException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static BusinessException notFound(String message) {
        return new BusinessException(HttpStatus.NOT_FOUND, message);
    }
}
