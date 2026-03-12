# Care Cronus

Welcome to the Care Cronus project! This repository contains both the frontend and backend components for the application.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18 or higher recommended) and `npm`
- [Python](https://www.python.org/) (v3.8 or higher recommended)

---

## 🏗️ Backend Setup

The backend is built with Python and FastAPI. It uses SQLite for the database.

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create and activate a Virtual Environment (Recommended)

**On Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the development server

```bash
uvicorn main:app --reload
```

The backend API will be accessible at [http://127.0.0.1:8000](http://127.0.0.1:8000).
You can also view the interactive API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 🎨 Frontend Setup

The frontend is a React application built with TypeScript, Vite, and Tailwind CSS (shadcn-ui).

### 1. Navigate to the frontend directory

Open a **new terminal window** so both frontend and backend can run simultaneously:

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The application will be accessible at [http://localhost:5173](http://localhost:5173).

---

## 🚀 Running Both Simultaneously

To run the application locally, you must have both the backend and frontend servers running at the same time. Open two separate command-line tabs/windows:

- **Terminal 1**: `cd backend` -> activate virtual env -> `uvicorn main:app --reload`
- **Terminal 2**: `cd frontend` -> `npm run dev`
