#!/bin/bash

set -e

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Start server
echo "Starting server..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3 --log-config /app/logging.conf

while inotifywait -r -e modify,create,delete,move .; do
    git add .
    git commit -m "in the mist of doing hard things by ingchrist: file/folder change detected"
    git push
    echo "Changes pushed to GitHub."

    echo "Pausing for 10 seconds..."
    for i in {10..1}; do
        echo -ne "Resuming in $i seconds...\r" # -ne for no newline and enable backspace
        sleep 1
    done
    echo "Resuming in 0 seconds.                                  " # Clear the line after countdown
    echo "Resuming watch."

done