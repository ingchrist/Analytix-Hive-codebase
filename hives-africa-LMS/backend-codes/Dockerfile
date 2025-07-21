# Stage 1: Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# Stage 2: Final stage
FROM python:3.11-slim

WORKDIR /app

# Create a non-root user for security
RUN useradd --create-home appuser
USER appuser

# Copy installed dependencies from the builder stage
COPY --from=builder /wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Run the application using Gunicorn
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code
COPY . /app/

# Expose the port the app runs on
EXPOSE 8000

# Make the script executable
RUN chmod +x /app/script.sh

# Run the entrypoint script
CMD ["/app/script.sh"]
