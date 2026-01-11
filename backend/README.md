# Troh Immo Backend API

REST API for the Troh Immo platform.

## Prerequisites
- Node.js
- MySQL Server running locally or remotely

## Setup
1.  **Database**: Create a MySQL database (e.g., `troh_immo_db`).
2.  **Environment**: Update `.env` with your DB credentials:
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=yourpassword
    DB_NAME=troh_immo_db
    ```
3.  **Install**:
    ```bash
    npm install
    ```
4.  **Run**:
    ```bash
    npm run dev
    ```
    The server will start on port 5000 and automatically create/update database tables.

## API Endpoints

### Auth
- `POST /api/auth/login`: Login
- `POST /api/auth/register`: Create account

### Projects
- `GET /api/projects`: List projects (All for admin, Own for client)
- `POST /api/projects`: Create project (Admin)
- `GET /api/projects/:id`: Get details
- `PATCH /api/projects/:id`: Update details

### Documents
- `POST /api/documents/upload`: Upload file (multipart/form-data)
- `GET /api/documents/:projectId`: List documents

### Finances
- `GET /api/finances/:projectId`: Get finance info
- `PATCH /api/finances/:id`: Update finance info
