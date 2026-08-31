/*+ crearNormativa(normativaDTO): Normativa
+ buscarNormativa(String texto): Normativa
+ modificarNormativa(id, normativaDTO): Normativa
+ eliminarNormativa(id): Normativa*/

package ar.edu.uncuyo.mzapata.digesto.normativa;

import ar.edu.uncuyo.mzapata.digesto.bussinesException.BusinessException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class NormativaService {

    private final NormativaRepository normativaRepository;

    public NormativaService(NormativaRepository normativaRepository) {
        this.normativaRepository = normativaRepository;
    }

    @Transactional
    public void create(NormativaDto dto){
        List<Object> details ;
        details = List.of(
                dto.getNro(),
                dto.getEmisionDate(),
                dto.getTipoNormativa()
        );
        Optional<Normativa> normativa = normativaRepository.findByDetails(details);

        if (normativa.isPresent()) {
            throw new BusinessException("La normativa con el número, fecha y tipo ingresados ya existe.");
        }

        //TO DO 'visible' es según si es admin o superadmin
        Normativa nuevaNormativa = Normativa.builder()
                .nro(dto.getNro())
                .emisionDate(dto.getEmisionDate())
                .tipoNormativa(dto.getTipoNormativa())
                .description(dto.getDescription())
                .texto(dto.getTexto())
                .visible(false)
                .loadDate(LocalDate.now())
                .aceptado(false)
                .build();

        normativaRepository.save(nuevaNormativa);

    }

}
