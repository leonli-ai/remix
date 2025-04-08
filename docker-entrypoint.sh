#!/bin/sh
set -e

if [ -f /app/build/client/env.js ]; then
  API_ENDPOINT=${VITE_PUBLIC_API_V1_ENDPOINT:-"https://b2b-rds.aaxis.io/api/v1"}
  
  sed -i "s|%%API_ENDPOINT%%|$API_ENDPOINT|g" /app/build/client/env.js
  
  echo "Runtime environment configured with API_ENDPOINT=$API_ENDPOINT"
fi

exec "$@" 