#!/bin/bash
set -e

mongosh --host mongodb --port "$DB_PORT" -u "$DB_USER" -p "$DB_PASSWORD" <<EOF2
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongodb:$DB_PORT' }
  ]
});
EOF2

