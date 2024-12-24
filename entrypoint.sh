#!/bin/bash

# Wait for the database to be ready
while ! nc -z db 5432; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

# Apply database migrations
python manage.py migrate

# Start the Gunicorn server
exec "$@"
