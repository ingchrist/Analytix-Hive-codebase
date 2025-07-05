# Full-Stack Application with Docker, Next.js, and Django

This project is a full-stack web application featuring a Next.js frontend and a Django backend. The entire application is containerized using Docker for a consistent and easy-to-manage development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Docker Desktop**: Required to build and run the Docker containers.
- **WSL (Windows Subsystem for Linux)**: The application is configured to run within a WSL environment on Windows. Make sure your Docker Desktop is integrated with your WSL distribution.
- **Git**: For version control and contributing to the project.

## Getting Started

Follow these steps to get the application up and running on your local machine.

### 1. Ensure Docker is Running

Start Docker Desktop on your Windows machine. Then, open your WSL terminal and ensure the Docker daemon is running. You can typically start it with:

```bash
sudo service docker start
```

*Note: If your WSL distribution uses systemd (like Ubuntu 22.04+), you might need to use *`sudo systemctl start docker`*.*

### 2. Build and Run the Application

From the root of the project directory inside your WSL terminal, run the following command. This single command will build the Docker images, create the database, and start all services.

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

## How to Contribute

We welcome contributions to this project! Follow this step-by-step guide to set up your development environment and contribute.

### 1. Fork and Clone the Repository

First, fork the repository on GitHub, then clone your fork:

```bash
# Clone your forked repository
git clone https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
cd REPOSITORY_NAME

# Add the original repository as upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/REPOSITORY_NAME.git
```

### 2. Create a Development Branch

Always create a new branch for your contributions:

```bash
# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b bugfix/issue-description
```

### 3. Set Up the Development Environment

Start the application in development mode:

```bash
# Build and start all services
docker compose up --build

# Or run in detached mode (background)
docker compose up --build -d
```

### 4. Making Changes

#### Frontend Development (Next.js)

To work on the frontend with live reload:

```bash
# Access the frontend container
docker compose exec frontend bash

# Install dependencies if needed
npm install

# Start development server (if not already running)
npm run dev
```

#### Backend Development (Django)

To work on the backend:

```bash
# Access the backend container
docker compose exec backend bash

# Create new Django migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create a superuser for admin access
python manage.py createsuperuser

# Run tests
python manage.py test
```

#### Database Operations

To work with the database:

```bash
# Access the PostgreSQL database
docker compose exec db psql -U postgres -d your_database_name

# View database logs
docker compose logs db

# Reset the database (WARNING: This will delete all data)
docker compose down -v
docker compose up --build
```

### 5. Code Quality and Testing

Before submitting your changes, ensure code quality:

```bash
# Run frontend tests
docker compose exec frontend npm test

# Run backend tests
docker compose exec backend python manage.py test

# Check frontend linting
docker compose exec frontend npm run lint

# Format code (if applicable)
docker compose exec frontend npm run format
docker compose exec backend black .
```

### 6. Commit Your Changes

Follow conventional commit messages:

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add user authentication feature"

# Or for bug fixes
git commit -m "fix: resolve API endpoint error handling"

# Or for documentation
git commit -m "docs: update API documentation"
```

### 7. Keep Your Branch Updated

Regularly sync with the main repository:

```bash
# Fetch the latest changes from upstream
git fetch upstream

# Merge upstream changes into your branch
git merge upstream/main

# Or rebase your changes on top of the latest main
git rebase upstream/main
```

### 8. Push Changes and Create Pull Request

```bash
# Push your branch to your fork
git push origin feature/your-feature-name

# If you rebased, you might need to force push
git push -f origin feature/your-feature-name
```

Then, create a pull request on GitHub with:
- Clear title and description
- Reference any related issues
- Screenshots for UI changes
- Test results if applicable

### 9. Development Workflow Commands

Here are some useful commands for daily development:

```bash
# View running containers
docker compose ps

# View logs for all services
docker compose logs

# View logs for specific service
docker compose logs frontend
docker compose logs backend
docker compose logs db

# Restart a specific service
docker compose restart backend

# Rebuild a specific service
docker compose up --build backend

# Stop all services but keep data
docker compose stop

# Remove containers and networks (keeps volumes)
docker compose down

# Remove everything including volumes (DANGER: deletes database data)
docker compose down -v
```

### 10. Troubleshooting

Common issues and solutions:

```bash
# If port is already in use
docker compose down
sudo lsof -i :3000  # Check what's using port 3000
sudo lsof -i :8000  # Check what's using port 8000

# If containers won't start
docker compose down -v
docker system prune -f
docker compose up --build

# If you need to access container shell
docker compose exec frontend sh
docker compose exec backend bash
docker compose exec db psql -U postgres

# View container resource usage
docker stats
```

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, concise commit messages
- Add tests for new features
- Update documentation when necessary
- Ensure your code works in the Docker environment
- Test your changes thoroughly before submitting
- Be responsive to code review feedback

### Getting Help

If you encounter issues:
1. Check the existing issues on GitHub
2. Review this README and project documentation
3. Ask questions in discussions or create a new issue
4. Make sure your Docker setup is correct

Thank you for contributing to this project!
