from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database
from routers import users, medicines, logs, vitals

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8080",
    "https://medi-reminder.vercel.app",  # Production Vercel URL
    "https://medi-reminder-sem1-project.vercel.app", # Potential Vercel URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(medicines.router)
app.include_router(logs.router)
app.include_router(vitals.router)

@app.get("/")
def read_root():
    return {"message": "Medi Reminder API is running"}
