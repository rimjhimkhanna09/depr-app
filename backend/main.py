from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, schemas, crud, auth, ml
from typing import List
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Import and mount chatbot routes
from routes_chatbot import router as chatbot_router
app.include_router(chatbot_router)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from database import get_db

@app.get("/")
def root():
    return {"message": "Depression/Anxiety Prediction API"}

@app.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user.username) or crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Username or email already registered")
    return crud.create_user(db, user)

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi import Security
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

from auth import get_current_user

@app.post("/predict", response_model=schemas.PredictionResponse)
def predict(request: schemas.PredictionRequest, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    result = ml.predict_text(request.text)
    if not result:
        raise HTTPException(status_code=500, detail="Model not trained yet.")
    crud.create_prediction(db, user.id, request.text, result['result'], result['probability'], result['severity'])
    return result

@app.post("/predict-csv", response_model=List[schemas.PredictionResponse])
def predict_csv(file: UploadFile = File(...), db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    df = pd.read_csv(file.file)
    responses = []
    for _, row in df.iterrows():
        text = row['text']
        result = ml.predict_text(text)
        if result:
            crud.create_prediction(db, user.id, text, result['result'], result['probability'], result['severity'])
            responses.append(result)
    return responses

@app.get("/history", response_model=List[schemas.PredictionResponse])
def get_history(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    preds = crud.get_predictions_by_user(db, user.id)
    return [schemas.PredictionResponse(result=p.result, probability=p.probability, severity=p.severity) for p in preds]

@app.post("/train-model")
def train_model(request: schemas.TrainModelRequest):
    metrics = ml.train_model_from_csv(request.csv_data)
    return {"metrics": metrics}
