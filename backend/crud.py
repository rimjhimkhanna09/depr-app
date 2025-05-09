from sqlalchemy.orm import Session
from models import User, Prediction, ChatLog
from auth import get_password_hash
from schemas import UserCreate

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_prediction(db: Session, user_id: int, text: str, result: str, probability: float, severity: str = None):
    db_pred = Prediction(user_id=user_id, text=text, result=result, probability=probability, severity=severity)
    db.add(db_pred)
    db.commit()
    db.refresh(db_pred)
    return db_pred

def get_predictions_by_user(db: Session, user_id: int, limit: int = 20):
    return db.query(Prediction).filter(Prediction.user_id == user_id).order_by(Prediction.created_at.desc()).limit(limit).all()

def log_chat(user_id: int, user_message: str, bot_response: str, timestamp):
    from database import SessionLocal
    db = SessionLocal()
    chat = ChatLog(user_id=user_id, user_message=user_message, bot_response=bot_response, timestamp=timestamp)
    db.add(chat)
    db.commit()
    db.close()
