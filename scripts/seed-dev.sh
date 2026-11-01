#!/usr/bin/env bash
#
# Carga datos de ejemplo en el entorno de desarrollo.
#
# Uso:
#   ./scripts/seed-dev.sh --reset
#
# --reset borra TODOS los datos de la base y los PDF almacenados antes de
# volver a cargar los ejemplos. Usar únicamente en desarrollo.
#
# Requiere el backend en ejecución y los comandos curl, jq y psql.

set -euo pipefail

API_URL="${API_URL:-http://localhost:8080/api}"
PDF_DIR="${PDF_DIR:-./data/pdfsamples}"
STORAGE_DIR="${STORAGE_DIR:-./backend/data/archivos}"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-digesto}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"

SUPERADMIN_EMAIL="${SUPERADMIN_EMAIL:-superadmin@mzapata.uncuyo.edu.ar}"
SUPERADMIN_PASSWORD="${SUPERADMIN_PASSWORD:-superadmin}"

RESET=false

usage() {
    cat <<EOF
Uso: $0 [--reset]

  --reset   Borra todos los datos de la base y los PDF almacenados antes de
            cargar los ejemplos. Es destructivo.

Variables de entorno:
  API_URL              URL base de la API (default: $API_URL)
  PDF_DIR              Carpeta con los PDF de ejemplo (default: $PDF_DIR)
  STORAGE_DIR          Carpeta de PDF del backend (default: $STORAGE_DIR)
  DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD
  SUPERADMIN_EMAIL     Cuenta usada para autenticarse
  SUPERADMIN_PASSWORD  Contraseña de esa cuenta
EOF
}

for arg in "$@"; do
    case "$arg" in
        --reset) RESET=true ;;
        -h|--help) usage; exit 0 ;;
        *) echo "Opción desconocida: $arg" >&2; usage >&2; exit 1 ;;
    esac
done

log()  { printf '\033[1;34m[seed]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[seed]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[seed]\033[0m %s\n' "$*" >&2; exit 1; }

need() {
    command -v "$1" >/dev/null 2>&1 || die "Falta el comando '$1'"
}

need curl
need jq
need psql

[[ -d "$PDF_DIR" ]] || die "No existe la carpeta de PDF: $PDF_DIR"
[[ -f "$PDF_DIR/sample1.pdf" ]] || die "No se encontraron los PDF de ejemplo en $PDF_DIR"

COOKIE="$(mktemp)"
TMP_JSON="$(mktemp)"
cleanup() { rm -f "$COOKIE" "$TMP_JSON"; }
trap cleanup EXIT

psql_exec() {
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -v ON_ERROR_STOP=1 -At "$@"
}

psql_pretty() {
    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        -v ON_ERROR_STOP=1 -P pager=off "$@"
}

request() {
    local method="$1" url="$2"
    shift 2

    local out code
    out="$(mktemp)"
    code="$(curl -sS -b "$COOKIE" -c "$COOKIE" -X "$method" \
        -o "$out" -w '%{http_code}' "$url" "$@")"

    if [[ "$code" -ge 400 ]]; then
        warn "HTTP $code en $method $url"
        cat "$out" >&2 || true
        rm -f "$out"
        exit 1
    fi

    cat "$out"
    rm -f "$out"
}

login() {
    local response body code
    response="$(curl -sS -c "$COOKIE" \
        -H 'Content-Type: application/json' \
        -d "$(jq -n --arg email "$SUPERADMIN_EMAIL" --arg password "$SUPERADMIN_PASSWORD" \
            '{email:$email,password:$password}')" \
        -w $'\n%{http_code}' "$API_URL/auth/login")"

    code="${response##*$'\n'}"
    body="${response%$'\n'*}"

    if [[ "$code" != "200" ]]; then
        warn "No se pudo iniciar sesión como $SUPERADMIN_EMAIL (HTTP $code)"
        echo "$body" >&2
        exit 1
    fi

    log "Sesión iniciada como $SUPERADMIN_EMAIL"
}

ensure_catalog() {
    local endpoint="$1" name="$2" current="$3"
    if ! printf '%s' "$current" | jq -e --arg n "$name" '.[] | select(.name == $n)' >/dev/null; then
        request POST "$API_URL/$endpoint" \
            -H 'Content-Type: application/json' \
            -d "$(jq -n --arg n "$name" '{name:$n}')" >/dev/null
        log "Creado $endpoint: $name"
    fi
}

ensure_user() {
    local firstname="$1" lastname="$2" email="$3" password="$4" role="$5"
    local exists
    exists="$(psql_exec -c "SELECT count(*) FROM usuario WHERE email = '$email' AND deleted = false;")"

    if [[ "$exists" == "0" ]]; then
        psql_exec -c "INSERT INTO usuario
            (id, deleted, email, firstname, lastname, must_change_password, password_hash, role)
            VALUES (gen_random_uuid(), false, '$email', '$firstname', '$lastname', false,
                    crypt('$password', gen_salt('bf', 10)), '$role');" >/dev/null
        log "Usuario creado: $email ($role)"
    else
        psql_exec -c "UPDATE usuario
            SET password_hash = crypt('$password', gen_salt('bf', 10)),
                must_change_password = false
            WHERE email = '$email' AND deleted = false;" >/dev/null
        log "Usuario existente actualizado: $email ($role)"
    fi
}

create_normativa() {
    local pdf="$1"
    local number="$2"
    local title="$3"
    local description="$4"
    local release_date="$5"
    local tipo_name="$6"
    local autoridad_name="$7"
    local record_number="$8"
    local record_title="$9"
    local state="${10}"
    local notifications="${11:-}"

    local tipo_id autoridad_id notif_json response id
    local -a emails

    tipo_id="$(printf '%s' "$TIPOS_JSON" | jq -r --arg n "$tipo_name" \
        '.[] | select(.name == $n) | .id' | head -n1)"
    autoridad_id="$(printf '%s' "$AUTORIDADES_JSON" | jq -r --arg n "$autoridad_name" \
        '.[] | select(.name == $n) | .id' | head -n1)"

    [[ -n "$tipo_id" && "$tipo_id" != "null" ]] \
        || die "No se encontró el tipo de normativa '$tipo_name'"
    [[ -n "$autoridad_id" && "$autoridad_id" != "null" ]] \
        || die "No se encontró la autoridad '$autoridad_name'"

    # Sin --reset, no volver a crear una normativa que ya existe. Se comprueba
    # por expediente porque también incluye las dadas de baja lógicamente.
    local existing
    existing="$(psql_exec -c "SELECT count(*)
        FROM normativa n
        JOIN expediente e ON e.id = n.expediente_id
        WHERE e.record_number = $record_number;")"
    if [[ "$existing" != "0" ]]; then
        log "Normativa ya existente (expediente $record_number), se omite: $title"
        return 0
    fi

    # Las publicadas se crean sin destinatarios para que aprobar no envíe
    # correos reales. Las notificaciones se insertan después por SQL.
    if [[ "$state" == "published" ]]; then
        notif_json='[]'
    elif [[ -n "$notifications" ]]; then
        notif_json="$(printf '%s' "$notifications" | tr ',' '\n' | jq -R . | jq -s .)"
    else
        notif_json='[]'
    fi

    jq -n \
        --argjson number "$number" \
        --arg title "$title" \
        --arg description "$description" \
        --arg releaseDate "$release_date" \
        --arg autoridadId "$autoridad_id" \
        --arg tipoDocumentoId "$tipo_id" \
        --argjson recordNumber "$record_number" \
        --arg recordTitle "$record_title" \
        --argjson notificaciones "$notif_json" \
        '{number:$number, title:$title, description:$description,
          releaseDate:$releaseDate, autoridadId:$autoridadId,
          tipoDocumentoId:$tipoDocumentoId, recordNumber:$recordNumber,
          recordTitle:$recordTitle, notificaciones:$notificaciones}' >"$TMP_JSON"

    response="$(request POST "$API_URL/admin/normativas" \
        -F "normativa=@$TMP_JSON;type=application/json" \
        -F "archivo=@$PDF_DIR/$pdf;type=application/pdf")"
    id="$(printf '%s' "$response" | jq -r '.id')"

    [[ -n "$id" && "$id" != "null" ]] \
        || die "No se pudo crear la normativa $number/$release_date ($pdf)"

    case "$state" in
        pending)
            request POST "$API_URL/admin/normativas/$id/enviar-aprobacion" >/dev/null
            ;;
        published)
            request POST "$API_URL/admin/normativas/$id/enviar-aprobacion" >/dev/null
            request POST "$API_URL/admin/normativas/$id/aprobar" >/dev/null

            if [[ -n "$notifications" ]]; then
                IFS=',' read -ra emails <<<"$notifications"
                local email
                for email in "${emails[@]}"; do
                    [[ -n "$email" ]] || continue
                    psql_exec -c "INSERT INTO notificacion
                        (id, deleted, email, normativa_id)
                        VALUES (gen_random_uuid(), false, '$email', '$id');" >/dev/null
                done
            fi
            ;;
        deleted)
            request DELETE "$API_URL/admin/normativas/$id" >/dev/null
            ;;
        draft)
            ;;
        *)
            die "Estado desconocido: $state"
            ;;
    esac

    log "Normativa $number/$release_date [$state]: $title ($pdf)"
}

# ---------------------------------------------------------------------------
# 1. Comprobar backend
# ---------------------------------------------------------------------------
curl -fsS "$API_URL/tipos-documento" >/dev/null \
    || die "El backend no responde en $API_URL. Iniciarlo antes de ejecutar el script."

# ---------------------------------------------------------------------------
# 2. Reset opcional
# ---------------------------------------------------------------------------
if $RESET; then
    log "Reset completo: se eliminarán todos los datos y PDF almacenados."
    psql_exec -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" >/dev/null
    psql_exec -c "TRUNCATE TABLE
        notificacion, normativa, archivo, expediente,
        tipo_documento, autoridad, password_reset_token,
        usuario, app_setting CASCADE;" >/dev/null

    mkdir -p "$STORAGE_DIR"
    find "$STORAGE_DIR" -maxdepth 1 -type f -name '*.pdf' -delete

    psql_exec -c "INSERT INTO usuario
        (id, deleted, email, firstname, lastname, must_change_password, password_hash, role)
        VALUES
        (gen_random_uuid(), false, 'admin@mzapata.uncuyo.edu.ar',
         'Admin', 'Digesto', false, crypt('admin', gen_salt('bf', 10)), 'ADMIN'),
        (gen_random_uuid(), false, 'superadmin@mzapata.uncuyo.edu.ar',
         'Super', 'Admin', false, crypt('superadmin', gen_salt('bf', 10)), 'SUPERADMIN');" >/dev/null

    log "Base reiniciada y usuarios base recreados."
fi

# ---------------------------------------------------------------------------
# 3. Usuarios de ejemplo
# ---------------------------------------------------------------------------
ensure_user "Secretaría" "Académica" "secretaria@mzapata.uncuyo.edu.ar" "secretaria" "ADMIN"
ensure_user "Consejo" "Directivo" "consejo@mzapata.uncuyo.edu.ar" "consejo" "ADMIN"
ensure_user "Supervisor" "Digesto" "supervisor@mzapata.uncuyo.edu.ar" "supervisor" "SUPERADMIN"

# ---------------------------------------------------------------------------
# 4. Iniciar sesión
# ---------------------------------------------------------------------------
login

# ---------------------------------------------------------------------------
# 5. Catálogos
# ---------------------------------------------------------------------------
TIPOS_JSON="$(request GET "$API_URL/tipos-documento")"
for name in "Disposición" "Resolución" "Circular" "Acta" "Ordenanza"; do
    ensure_catalog "tipos-documento" "$name" "$TIPOS_JSON"
    TIPOS_JSON="$(request GET "$API_URL/tipos-documento")"
done

AUTORIDADES_JSON="$(request GET "$API_URL/autoridades")"
for name in "Dirección" "Vicedirección" "Consejo Directivo" "Secretaría Académica" \
    "Rectorado" "Secretaría General"; do
    ensure_catalog "autoridades" "$name" "$AUTORIDADES_JSON"
    AUTORIDADES_JSON="$(request GET "$API_URL/autoridades")"
done

# ---------------------------------------------------------------------------
# 6. Plantilla de correo
# ---------------------------------------------------------------------------
MAIL_BODY=$'Usted ha sido notificado de la publicación de la siguiente normativa:\n\n{titulo}\n\nPuede consultarla en: {enlace}\n'
request PUT "$API_URL/admin/plantilla-correo" \
    -H 'Content-Type: application/json' \
    -d "$(jq -n \
        --arg asunto "Digesto Escuela de Comercio Martín Zapata - Nueva normativa publicada" \
        --arg cuerpo "$MAIL_BODY" \
        '{asunto:$asunto,cuerpo:$cuerpo}')" >/dev/null
log "Plantilla de correo configurada."

# ---------------------------------------------------------------------------
# 7. Normativas
# ---------------------------------------------------------------------------
create_normativa "sample1.pdf" 12 \
    "Designación de autoridades del Consejo Directivo" \
    "Designación de las autoridades del Consejo Directivo para el período lectivo 2024." \
    "2024-03-15" "Disposición" "Dirección" 2024001 \
    "Designación de autoridades del Consejo Directivo" "published" \
    "secretaria@mzapata.uncuyo.edu.ar,consejo@mzapata.uncuyo.edu.ar"

create_normativa "sample5.pdf" 45 \
    "Calendario académico 2025" \
    "Aprueba el calendario académico correspondiente al ciclo lectivo 2025." \
    "2025-02-10" "Resolución" "Secretaría Académica" 2025001 \
    "Calendario académico 2025" "published" \
    "secretaria@mzapata.uncuyo.edu.ar"

create_normativa "sample10.pdf" 3 \
    "Inscripción a mesas de examen" \
    "Establece el cronograma de inscripción a las mesas de examen de febrero y marzo." \
    "2025-01-20" "Circular" "Vicedirección" 2025002 \
    "Inscripción a mesas de examen" "published" \
    "consejo@mzapata.uncuyo.edu.ar"

create_normativa "sample-table.pdf" 7 \
    "Aprobación de planilla de horarios" \
    "Aprueba la planilla de horarios del personal docente para el primer cuatrimestre." \
    "2024-04-05" "Disposición" "Dirección" 2024002 \
    "Aprobación de planilla de horarios" "published" ""

create_normativa "sample-landscape.pdf" 88 \
    "Convenio de prácticas profesionalizantes" \
    "Aprueba el convenio marco para el desarrollo de prácticas profesionalizantes." \
    "2024-08-22" "Ordenanza" "Consejo Directivo" 2024003 \
    "Convenio de prácticas profesionalizantes" "published" \
    "consejo@mzapata.uncuyo.edu.ar"

create_normativa "sample-form.pdf" 9 \
    "Actualización de datos de estudiantes" \
    "Solicita la actualización de los datos personales y de contacto de los estudiantes." \
    "2025-03-03" "Circular" "Secretaría Académica" 2025003 \
    "Actualización de datos de estudiantes" "published" ""

create_normativa "sample-heavy.pdf" 102 \
    "Reglamento de biblioteca" \
    "Actualiza el reglamento de uso y préstamo de materiales de la biblioteca escolar." \
    "2025-09-12" "Acta" "Consejo Directivo" 2025004 \
    "Reglamento de biblioteca" "pending" \
    "biblioteca@mzapata.uncuyo.edu.ar,consejo@mzapata.uncuyo.edu.ar"

create_normativa "sample-scanned.pdf" 15 \
    "Designación de tribunal examinador" \
    "Designa el tribunal examinador para las mesas de examen extraordinarias." \
    "2026-02-18" "Disposición" "Dirección" 2026001 \
    "Designación de tribunal examinador" "pending" \
    "secretaria@mzapata.uncuyo.edu.ar"

create_normativa "sample-empty.pdf" 4 \
    "Comunicación interna" \
    "Comunicación interna pendiente de publicación." \
    "2026-03-01" "Circular" "Vicedirección" 2026002 \
    "Comunicación interna" "draft" \
    "secretaria@mzapata.uncuyo.edu.ar"

create_normativa "sample-protected.pdf" 5 \
    "Expediente reservado" \
    "Normativa de prueba con PDF protegido para verificar el manejo de errores." \
    "2026-03-10" "Resolución" "Rectorado" 2026003 \
    "Expediente reservado" "deleted" ""

# ---------------------------------------------------------------------------
# 8. Esperar el OCR del PDF escaneado (hasta 60 segundos)
# ---------------------------------------------------------------------------
log "Esperando el OCR de sample-scanned.pdf..."
for _ in $(seq 1 12); do
    text_len="$(psql_exec -c "SELECT coalesce(length(n.text), 0)
        FROM normativa n
        JOIN expediente e ON e.id = n.expediente_id
        WHERE e.record_number = 2026001;")"
    [[ "$text_len" -gt 0 ]] && break
    sleep 5
done
if [[ "$text_len" -gt 0 ]]; then
    log "OCR completado: $text_len caracteres extraídos."
else
    warn "El OCR de sample-scanned.pdf todavía no produjo texto (puede seguir en segundo plano)."
fi

# ---------------------------------------------------------------------------
# 9. Verificación
# ---------------------------------------------------------------------------
log "Conteos por tabla:"
psql_pretty -c "
SELECT 'usuario' AS tabla, count(*) FROM usuario
UNION ALL SELECT 'tipo_documento', count(*) FROM tipo_documento
UNION ALL SELECT 'autoridad', count(*) FROM autoridad
UNION ALL SELECT 'expediente', count(*) FROM expediente
UNION ALL SELECT 'archivo', count(*) FROM archivo
UNION ALL SELECT 'normativa', count(*) FROM normativa
UNION ALL SELECT 'notificacion', count(*) FROM notificacion
UNION ALL SELECT 'app_setting', count(*) FROM app_setting
ORDER BY tabla;"

log "Normativas cargadas:"
psql_pretty -c "
SELECT n.number AS numero,
       n.title AS titulo,
       t.name AS tipo,
       a.name AS autoridad,
       e.record_number AS expediente,
       CASE
           WHEN n.deleted THEN 'ELIMINADA'
           WHEN n.accepted AND n.visible THEN 'PUBLICADA'
           WHEN n.pending_approval THEN 'PENDIENTE'
           ELSE 'NO PUBLICADA'
       END AS estado,
       length(n.text) AS texto
FROM normativa n
JOIN tipo_documento t ON t.id = n.tipo_documento_id
JOIN autoridad a ON a.id = n.autoridad_id
JOIN expediente e ON e.id = n.expediente_id
ORDER BY n.number, n.release_date;"

mkdir -p "$STORAGE_DIR"
pdf_count="$(find "$STORAGE_DIR" -maxdepth 1 -type f -name '*.pdf' | wc -l | tr -d ' ')"
log "PDF almacenados en $STORAGE_DIR: $pdf_count (esperados: 10)"

public_count="$(request GET "$API_URL/normativas?q=lorem&size=100" | jq -r '.totalElements')"
log "Normativas públicas que contienen 'lorem': $public_count"

cat <<EOF

Datos de ejemplo cargados.

Cuentas:
  admin@mzapata.uncuyo.edu.ar       / admin
  superadmin@mzapata.uncuyo.edu.ar  / superadmin
  secretaria@mzapata.uncuyo.edu.ar  / secretaria
  consejo@mzapata.uncuyo.edu.ar     / consejo
  supervisor@mzapata.uncuyo.edu.ar  / supervisor

Frontend: http://localhost:5173
Backend:  http://localhost:8080
EOF
