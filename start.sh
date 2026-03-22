#!/bin/sh
set -e

echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy 2>&1 || echo "Migration skipped or failed (may already be up to date)"

echo "Starting server..."
exec node server.js
