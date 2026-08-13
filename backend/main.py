from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import os

# Local imports
from database import engine, Base
from models import User, Chat, Message
from auth import (
    get_db,
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

load_dotenv()

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load AI client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# =========================
# SERVE FRONTEND
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_path = os.path.join(BASE_DIR, "frontend")

app.mount("/frontend", StaticFiles(directory=frontend_path), name="frontend")

@app.get("/")
def home():
    return FileResponse(os.path.join(frontend_path, "index.html"))

# =========================
# REQUEST SCHEMAS
# =========================

class RegisterRequest(BaseModel):
    email: str
    password: str

class AskRequest(BaseModel):
    message: str

class RenameRequest(BaseModel):
    title: str


# =========================
# AUTH ROUTES
# =========================

@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == request.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        email=request.email,
        password=hash_password(request.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}


@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================
# CHAT ROUTES
# =========================

@app.post("/create-chat")
def create_chat(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_chat = Chat(
        user_id=current_user.id,
        title="New Chat"
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return {"chat_id": new_chat.id}


@app.get("/my-chats")
def get_my_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return db.query(Chat).filter(Chat.user_id == current_user.id).all()


# =========================
# AI CHAT (NO LOGIN REQUIRED FOR DEMO)
# =========================

@app.post("/ask/{chat_id}")
def ask(chat_id: int, request: AskRequest):

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a helpful AI tutor."},
            {"role": "user", "content": request.message}
        ]
    )

    ai_response = completion.choices[0].message.content

    return {"answer": ai_response}


# =========================
# DELETE CHAT
# =========================

@app.delete("/delete-chat/{chat_id}")
def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db.delete(chat)
    db.commit()

    return {"message": "Chat deleted successfully"}


# =========================
# RENAME CHAT
# =========================

@app.put("/rename-chat/{chat_id}")
def rename_chat(
    chat_id: int,
    request: RenameRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat.title = request.title
    db.commit()

    return {"message": "Chat renamed successfully"}