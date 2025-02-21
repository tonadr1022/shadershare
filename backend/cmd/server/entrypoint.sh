# echo "[$(date)] Running DB migrations..."
# migrate -database "${DATABASE_URL}" -path /db/migrations up

echo "[$(date "+%Y-%m-%d %H:%M:%S")]" Starting server...
server
