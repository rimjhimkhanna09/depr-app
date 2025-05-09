from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_user
import crud
import datetime

router = APIRouter()

import random

SUPPORTIVE_RESPONSES = [
    "Thank you for sharing. Remember, it's okay to feel this way.",
    "I'm here for you. Would you like to talk more about it?",
    "You are not alone. Is there something specific on your mind?",
    "It's brave of you to open up. How can I support you today?",
    "Your feelings are valid. Take your time and share as much as you want.",
    "If things feel tough, remember that reaching out is a sign of strength.",
    "You matter, and your feelings matter. I'm here to listen.",
    "Would you like some tips for self-care or just to chat more?",
    "Sometimes talking helps. I'm here whenever you need to share.",
    "You are doing your best. Let me know how I can help."
]

@router.post('/chatbot')
async def chatbot_endpoint(request: Request, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    data = await request.json()
    message = data.get('message', '').lower().strip()
    response = None
    # Empathetic keyword checks
    if not message:
        response = "I'm here to listen. Please tell me more."
    elif any(word in message for word in ['alone', 'lonely', 'isolated']):
        response = "Feeling alone can be really tough. Remember, you are not alone and support is available."
    elif any(word in message for word in ['sad', 'unhappy', 'down', 'blue']):
        response = "I'm sorry you're feeling sad. It's okay to have these feelings. Would you like to talk more about it?"
    elif any(word in message for word in ['hopeless', 'helpless', 'worthless']):
        response = "Those feelings can be overwhelming. Please know that you have value and things can improve."
    elif any(word in message for word in ['depressed', 'depression']):
        response = "Depression is hard, but you are not alone. Talking can help. Would you like some resources or to share more?"
    elif any(word in message for word in ['anxious', 'anxiety', 'worried', 'nervous', 'panic']):
        response = "Anxiety can be difficult to manage. Would you like some calming tips or to talk about what's worrying you?"
    elif any(word in message for word in ['happy', 'good', 'great', 'excited', 'joy', 'hopeful']):
        response = "That's wonderful to hear! Celebrate those positive moments. What made you feel this way today?"
    elif any(word in message for word in ['angry', 'mad', 'frustrated', 'irritated']):
        response = "Anger is a natural emotion. Want to talk about what's making you feel this way?"
    elif any(word in message for word in ['tired', 'exhausted', 'fatigued']):
        response = "It's important to rest. Make sure to take care of yourself. Would you like some self-care tips?"
    # Add more patterns as needed
    if not response:
        response = random.choice(SUPPORTIVE_RESPONSES)
    crud.log_chat(user.id, message, response, datetime.datetime.utcnow())
    return {"response": response}
