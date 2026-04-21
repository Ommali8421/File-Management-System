# File Management System

A full-stack file management application built with React (Frontend) and Node.js/Express (Backend).

## Features
- User Authentication (Login/Register)
- File Uploads
- File Management (View, Download, Delete)
- Secure storage using SQLite

## Tech Stack
- **Frontend**: React, Vite, Axios, React Router
- **Backend**: Node.js, Express, Multer, SQLite3, JWT, Bcrypt

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ommali8421/File-Management-System.git
   cd File-Management-System
   ```

2. **Install All Dependencies**
   Run the following command in the root directory to install dependencies for the root, backend, and frontend:
   ```bash
   npm run install-all
   ```

### Running the Application

#### Easy Start (Both Servers)
Run the following command in the root directory:
```bash
npm run dev
```
This will start:
- **Backend**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`

#### Individual Starts
If you prefer to start them separately:
- **Backend only**: `npm run start-backend`
- **Frontend only**: `npm run start-frontend`

**Note**: You can seed a demo user by running `npm run seed` in the root directory.
- **Username**: `Om Mali`
- **Password**: `password123`

## Folder Structure
- `/backend`: Express server, database configuration, and file upload logic.
- `/frontend`: React application with components and pages.
- `/backend/uploads`: Directory where uploaded files are stored.
