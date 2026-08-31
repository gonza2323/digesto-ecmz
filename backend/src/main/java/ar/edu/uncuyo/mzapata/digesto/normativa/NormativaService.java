package ar.edu.uncuyo.mzapata.digesto.normativa;

import ar.edu.uncuyo.mzapata.digesto.archivo.Archivo;
import ar.edu.uncuyo.mzapata.digesto.archivo.ArchivoRepository;
import ar.edu.uncuyo.mzapata.digesto.archivo.ArchivoService;
import ar.edu.uncuyo.mzapata.digesto.autoridad.AutoridadService;
import ar.edu.uncuyo.mzapata.digesto.config.AppProperties;
import ar.edu.uncuyo.mzapata.digesto.config.BusinessException;
import ar.edu.uncuyo.mzapata.digesto.expediente.Expediente;
import ar.edu.uncuyo.mzapata.digesto.expediente.ExpedienteRepository;
import ar.edu.uncuyo.mzapata.digesto.mail.MailService;
import ar.edu.uncuyo.mzapata.digesto.setting.AppSettingService;
import ar.edu.uncuyo.mzapata.digesto.tipodocumento.TipoDocumentoService;
import ar.edu.uncuyo.mzapata.digesto.user.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NormativaService {

    private final NormativaRepository normativaRepository;
    private final ExpedienteRepository expedienteRepository;
    private final ArchivoRepository archivoRepository;
    private final ArchivoService archivoService;
    private final AutoridadService autoridadService;
    private final TipoDocumentoService tipoDocumentoService;
    private final UsuarioRepository usuarioRepository;
    private final AppSettingService appSettingService;
    private final MailService mailService;
    private final AppProperties properties;
    private final ObjectMapper objectMapper;

    // ---------- Consulta ----------

    /** Búsqueda del sitio público: sólo normativas aprobadas y visibles. */
    @Transactional(readOnly = true)
    public Page<NormativaSummaryDto> search(NormativaFilterDto filtro, Pageable pageable) {
        return query(filtro, true, false, pageable);
    }

    /** Búsqueda de administración: incluye borradores y pendientes. */
    @Transactional(readOnly = true)
    public Page<NormativaSummaryDto> searchAdmin(NormativaFilterDto filtro, boolean soloPendientes, Pageable pageable) {
        return query(filtro, false, soloPendientes, pageable);
    }

    private Page<NormativaSummaryDto> query(NormativaFilterDto filtro, boolean soloPublicas,
                                            boolean soloPendientes, Pageable pageable) {
        return normativaRepository.search(
                soloPublicas,
                soloPendientes,
                filtro.tipoDocumentoId(),
                filtro.autoridadId(),
                filtro.anio(),
                filtro.number(),
                filtro.recordNumber(),
                filtro.desde(),
                filtro.hasta(),
                filtro.texto(),
                pageable
        ).map(NormativaSummaryDto::of);
    }

    @Transactional(readOnly = true)
    public NormativaDetailDto findPublic(UUID id) {
        return NormativaDetailDto.of(requirePublic(id));
    }

    @Transactional(readOnly = true)
    public NormativaDetailDto findAdmin(UUID id) {
        return NormativaDetailDto.ofAdmin(require(id));
    }

    /** Archivo de una normativa publicada. */
    @Transactional(readOnly = true)
    public Archivo archivoPublic(UUID id) {
        return requirePublic(id).getArchivo();
    }

    /** Archivo de cualquier normativa, para que el superadmin pueda revisarla antes de aprobar. */
    @Transactional(readOnly = true)
    public Archivo archivoAdmin(UUID id) {
        return require(id).getArchivo();
    }

    /** Informa si el número de expediente ya se usó, para advertir sin bloquear la carga. */
    @Transactional(readOnly = true)
    public boolean expedienteEnUso(Integer recordNumber) {
        return normativaRepository.existsByExpedienteRecordNumberAndDeletedFalse(recordNumber);
    }

    // ---------- Alta, modificación y baja ----------

    @Transactional
    public NormativaDetailDto create(NormativaFormDto dto, MultipartFile file) {
        validarUnicidad(dto, null);

        Archivo archivo = archivoService.store(file);
        archivoRepository.save(archivo);

        Normativa normativa = Normativa.builder()
                .number(dto.number())
                .title(dto.title().trim())
                .description(dto.description().trim())
                .releaseDate(dto.releaseDate())
                .loadDate(LocalDate.now())
                .visible(false)
                .accepted(false)
                .pendingApproval(dto.enviarAAprobacion())
                .autoridad(autoridadService.find(dto.autoridadId()))
                .tipoDocumento(tipoDocumentoService.find(dto.tipoDocumentoId()))
                .expediente(resolveExpediente(dto))
                .archivo(archivo)
                .text(archivoService.extractText(archivo))
                .build();

        normativa.replaceNotificaciones(dto.notificaciones());

        return NormativaDetailDto.ofAdmin(normativaRepository.save(normativa));
    }

    @Transactional
    public NormativaDetailDto update(UUID id, NormativaFormDto dto, MultipartFile file) {
        Normativa normativa = require(id);
        validarUnicidad(dto, id);

        // Si estaba publicada, se conserva la versión anterior para poder restaurarla si se rechaza.
        if (normativa.isAccepted() && normativa.isVisible() && normativa.getPreviousVersion() == null)
            normativa.setPreviousVersion(writeSnapshot(NormativaSnapshot.of(normativa)));

        normativa.setNumber(dto.number());
        normativa.setTitle(dto.title().trim());
        normativa.setDescription(dto.description().trim());
        normativa.setReleaseDate(dto.releaseDate());
        normativa.setAutoridad(autoridadService.find(dto.autoridadId()));
        normativa.setTipoDocumento(tipoDocumentoService.find(dto.tipoDocumentoId()));
        normativa.setExpediente(resolveExpediente(dto));
        normativa.replaceNotificaciones(dto.notificaciones());

        if (file != null && !file.isEmpty()) {
            Archivo archivo = archivoRepository.save(archivoService.store(file));
            normativa.setArchivo(archivo);
            normativa.setText(archivoService.extractText(archivo));
        }

        // La modificación queda oculta hasta que un superadmin la apruebe.
        normativa.setVisible(false);
        normativa.setAccepted(false);
        normativa.setPendingApproval(dto.enviarAAprobacion());

        return NormativaDetailDto.ofAdmin(normativa);
    }

    /** Baja lógica: no se borra el archivo ni los registros asociados. */
    @Transactional
    public void delete(UUID id) {
        Normativa normativa = require(id);
        normativa.setDeleted(true);
        normativa.setVisible(false);
        normativa.setPendingApproval(false);
    }

    // ---------- Aprobación ----------

    @Transactional
    public AprobacionResultDto approve(UUID id) {
        Normativa normativa = require(id);
        if (!normativa.isPendingApproval())
            throw new BusinessException("La normativa no está esperando aprobación");

        normativa.setAccepted(true);
        normativa.setVisible(true);
        normativa.setPendingApproval(false);
        normativa.setPreviousVersion(null);

        return new AprobacionResultDto(NormativaDetailDto.ofAdmin(normativa), notificar(normativa));
    }

    /**
     * Rechaza la carga o la modificación. Si había una versión publicada previa se restaura;
     * si era una normativa nueva, vuelve a estado borrador.
     */
    @Transactional
    public NormativaDetailDto reject(UUID id, String motivo) {
        Normativa normativa = require(id);
        if (!normativa.isPendingApproval())
            throw new BusinessException("La normativa no está esperando aprobación");

        normativa.setPendingApproval(false);

        if (normativa.getPreviousVersion() != null) {
            restoreSnapshot(normativa, readSnapshot(normativa.getPreviousVersion()));
            normativa.setPreviousVersion(null);
            normativa.setAccepted(true);
            normativa.setVisible(true);
        }

        avisarRechazo(normativa, motivo);

        return NormativaDetailDto.ofAdmin(normativa);
    }

    // ---------- Auxiliares ----------

    private Normativa require(UUID id) {
        return normativaRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> BusinessException.notFound("La normativa no existe"));
    }

    private Normativa requirePublic(UUID id) {
        Normativa normativa = require(id);
        if (!normativa.isVisible() || !normativa.isAccepted())
            throw BusinessException.notFound("La normativa no existe");
        return normativa;
    }

    private void validarUnicidad(NormativaFormDto dto, UUID excludeId) {
        boolean duplicada = normativaRepository.existsDuplicate(
                dto.releaseDate().getYear(), dto.number(), dto.tipoDocumentoId(), excludeId);

        if (duplicada)
            throw new BusinessException(
                    "Ya existe una normativa con ese número, tipo y año de publicación");
    }

    private Expediente resolveExpediente(NormativaFormDto dto) {
        return expedienteRepository.findByRecordNumber(dto.recordNumber())
                .orElseGet(() -> expedienteRepository.save(Expediente.builder()
                        .recordNumber(dto.recordNumber())
                        .recordTitle(dto.recordTitle().trim())
                        .build()));
    }

    /** Envía los correos asociados y devuelve las direcciones que fallaron. */
    private List<String> notificar(Normativa normativa) {
        String asunto = appSettingService.get(AppSettingService.MAIL_SUBJECT, AppSettingService.DEFAULT_MAIL_SUBJECT);
        String cuerpo = appSettingService.get(AppSettingService.MAIL_BODY, AppSettingService.DEFAULT_MAIL_BODY)
                .replace("{titulo}", normativa.getTitle())
                .replace("{enlace}", properties.frontendUrl() + "/normativas/" + normativa.getId());

        List<String> fallidas = new ArrayList<>();
        for (Notificacion notificacion : normativa.getNotificaciones()) {
            if (!mailService.send(notificacion.getEmail(), asunto, cuerpo))
                fallidas.add(notificacion.getEmail());
        }
        return fallidas;
    }

    private void avisarRechazo(Normativa normativa, String motivo) {
        if (normativa.getCreatedBy() == null) return;

        usuarioRepository.findByIdAndDeletedFalse(normativa.getCreatedBy()).ifPresent(usuario ->
                mailService.send(usuario.getEmail(),
                        "Digesto - Normativa rechazada",
                        "La normativa \"" + normativa.getTitle() + "\" fue rechazada.\n\nMotivo: "
                                + (motivo == null || motivo.isBlank() ? "no indicado" : motivo)));
    }

    private String writeSnapshot(NormativaSnapshot snapshot) {
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (Exception e) {
            throw new BusinessException("No se pudo guardar la versión anterior: " + e.getMessage());
        }
    }

    private NormativaSnapshot readSnapshot(String json) {
        try {
            return objectMapper.readValue(json, NormativaSnapshot.class);
        } catch (Exception e) {
            throw new BusinessException("No se pudo restaurar la versión anterior: " + e.getMessage());
        }
    }

    private void restoreSnapshot(Normativa normativa, NormativaSnapshot snapshot) {
        normativa.setNumber(snapshot.number());
        normativa.setTitle(snapshot.title());
        normativa.setDescription(snapshot.description());
        normativa.setText(snapshot.text());
        normativa.setReleaseDate(snapshot.releaseDate());
        normativa.setAutoridad(autoridadService.find(snapshot.autoridadId()));
        normativa.setTipoDocumento(tipoDocumentoService.find(snapshot.tipoDocumentoId()));
        normativa.setExpediente(expedienteRepository.findById(snapshot.expedienteId())
                .orElseThrow(() -> new BusinessException("No se encontró el expediente anterior")));
        normativa.setArchivo(archivoRepository.findById(snapshot.archivoId())
                .orElseThrow(() -> new BusinessException("No se encontró el archivo anterior")));
        normativa.replaceNotificaciones(snapshot.notificaciones());
    }
}
