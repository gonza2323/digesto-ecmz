package ar.edu.uncuyo.mzapata.digesto.backup;

import ar.edu.uncuyo.mzapata.digesto.auth.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/backups")
@PreAuthorize("hasRole('SUPERADMIN')")
public class BackupController {

    private final BackupService backupService;

    @GetMapping("/estado")
    public BackupStatusDto estado() {
        return backupService.status();
    }

    @GetMapping
    public ResponseEntity<Resource> descargar() {
        Path zip = backupService.createBackup();

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename("digesto-backup-" + LocalDate.now() + ".zip")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new FileSystemResource(zip));
    }

    @PostMapping("/restaurar")
    public void restaurar(@RequestPart MultipartFile archivo,
                          @RequestParam String password,
                          @AuthenticationPrincipal CustomUserDetails user) {
        backupService.restore(archivo, password, user.getId());
    }
}
