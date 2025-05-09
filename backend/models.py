from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    predictions = relationship('Prediction', back_populates='user')

class Prediction(Base):
    __tablename__ = 'predictions'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    text = Column(Text, nullable=False)
    result = Column(String, nullable=False)  # depression/anxiety/none
    probability = Column(Float, nullable=False)
    severity = Column(String, nullable=True)  # Low/Medium/High
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='predictions')

class ChatLog(Base):
    __tablename__ = 'chatlogs'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
