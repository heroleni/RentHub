#!/usr/bin/env bash
# ============================================================
# restore.sh — Restaura la base de datos de RentHub desde un backup
# ============================================================
# Toma un archivo .sql.gz generado por backup.sh y lo restaura sobre
# la base. ATENCIÓN: esto SOBRESCRIBE los datos actuales.
#
# Uso:
#   ./restore.sh ../backups/renthub-2026-06-26_03-00-00.sql.gz
# ------------------------------------------------------------

set -euo pipefail

CONTAINER="renthub-db"
DB_NAME="renthub"
DB_USER="renthub"

if [ $# -ne 1 ]; then
  echo "Uso: $0 <archivo-de-backup.sql.gz>" >&2
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: no existe el archivo '${BACKUP_FILE}'." >&2
  exit 1
fi

echo "⚠️  Vas a SOBRESCRIBIR la base '${DB_NAME}' con: ${BACKUP_FILE}"
read -rp "¿Continuar? Escribe 'si' para confirmar: " CONFIRM
if [ "$CONFIRM" != "si" ]; then
  echo "Cancelado."
  exit 0
fi

echo "[$(date)] Restaurando..."

# Descomprimimos y enviamos el SQL al contenedor vía psql.
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"

echo "[$(date)] Restauración completada."
