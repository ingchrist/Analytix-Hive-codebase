# Full-Stack Application with Docker, Next.js, and Django

This project is a full-stack web application featuring a Next.js frontend and a Django backend. The entire application is containerized using Docker for a consistent and easy-to-manage development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker Desktop**: Required to build and run the Docker containers.
- **WSL (Windows Subsystem for Linux)**: The application is configured to run within a WSL environment on Windows. Make sure your Docker Desktop is integrated with your WSL distribution.

## Getting Started

Follow these steps to get the application up and running on your local machine.

### 1. Ensure Docker is Running

Start Docker Desktop on your Windows machine. Then, open your WSL terminal and ensure the Docker daemon is running. You can typically start it with:

```bash
sudo service docker start
```
*Note: If your WSL distribution uses systemd (like Ubuntu 22.04+), you might need to use `sudo systemctl start docker`.*

### 2. Build and Run the Application

From the root of the project directory  inside your WSL terminal, run the following command. This single command will build the Docker images, create the database, and start all services.

```bash
docker compose up --build
```

The first time you run this, it will download the base images and build the application, which may take several minutes. The backend service is configured to automatically run database migrations on startup, so no manual database setup is required.

To stop the application, press `Ctrl+C` in the terminal where the containers are running, and then run:

```bash
docker compose down
```

## Project Structure

The project is organized into two main directories:

- `frontend-codes/`: Contains the Next.js frontend application.
- `backend-codes/`: Contains the Django REST Framework backend application.
- `docker-compose.yml`: Defines the three services (`frontend`, `backend`, `db`), networks, and volumes for the Docker application.

## Accessing the Services

Once the containers are running, you can access the services at the following URLs:

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

The frontend is configured to proxy API requests to the backend service, so you can interact with the full application through the frontend URL.
