#!/usr/bin/env bash
# ============================================================
# backup.sh — Respaldo de la base de datos PostgreSQL de RentHub
# ============================================================
# Genera un dump comprimido de la base usando pg_dump dentro del
# contenedor de Docker. Aplica una política de retención: borra los
# backups con más de RETENTION_DAYS días para no llenar el disco.
#
# Uso:
#   ./backup.sh
#
# Programar a diario (ver SETUP): crontab -e
#   0 3 * * * /ruta/al/Back/scripts/backup.sh >> /var/log/renthub-backup.log 2>&1
# ------------------------------------------------------------

set -euo pipefail   # falla rápido: corta si algo sale mal

# --- Configuración (ajusta si cambian) ---
CONTAINER="renthub-db"
DB_NAME="renthub"
DB_USER="renthub"
BACKUP_DIR="$(dirname "$0")/../backups"
RETENTION_DAYS=7

# Nombre con fecha y hora: renthub-2026-06-26_03-00-00.sql.gz
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
OUTFILE="${BACKUP_DIR}/renthub-${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Iniciando backup de '${DB_NAME}'..."

# pg_dump genera un volcado lógico (todas las sentencias SQL para
# reconstruir la base). Lo comprimimos al vuelo con gzip.
docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$OUTFILE"

# Verificamos que el archivo no quedó vacío (un backup de 0 bytes es un backup fallido)
if [ ! -s "$OUTFILE" ]; then
  echo "[$(date)] ERROR: el backup quedó vacío. Abortando." >&2
  rm -f "$OUTFILE"
  exit 1
fi

SIZE="$(du -h "$OUTFILE" | cut -f1)"
echo "[$(date)] Backup OK -> ${OUTFILE} (${SIZE})"

# --- Retención: borrar backups antiguos ---
echo "[$(date)] Limpiando backups con más de ${RETENTION_DAYS} días..."
find "$BACKUP_DIR" -name "renthub-*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -delete

echo "[$(date)] Listo."
