from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PredictionRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    result: str
    probability: float
    severity: Optional[str] = None

class TrainModelRequest(BaseModel):
    csv_data: str  # base64 or raw CSV string
