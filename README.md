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

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

You will need two terminal windows open: one for the backend and one for the frontend.

#### 1. Start the Backend
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:3000`.

#### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`.

## Folder Structure
- `/backend`: Express server, database configuration, and file upload logic.
- `/frontend`: React application with components and pages.
- `/backend/uploads`: Directory where uploaded files are stored.
