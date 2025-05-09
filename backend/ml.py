import pandas as pd
import joblib
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'vectorizer.pkl')

# Minimal preprocessing for demo; expand as needed
def preprocess_text(text):
    return text.lower()

def train_model_from_csv(csv_data: str):
    from io import StringIO
    df = pd.read_csv(StringIO(csv_data))
    df['text'] = df['text'].astype(str).apply(preprocess_text)
    X = df['text']
    y = df['label']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(stop_words='english')),
        ('clf', LogisticRegression(max_iter=200))
    ])
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_test, y_pred, average='weighted', zero_division=0),
        'f1': f1_score(y_test, y_pred, average='weighted', zero_division=0)
    }
    joblib.dump(pipeline, MODEL_PATH)
    return metrics

def load_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None

def predict_text(text: str):
    model = load_model()
    if not model:
        # Always return positive encouragement if model is not trained
        return {
            'result': 'You are valued! Stay positive and reach out for support if needed.',
            'probability': 1.0,
            'severity': 'Supportive'
        }
    text_proc = preprocess_text(text)
    pred = model.predict([text_proc])[0]
    prob = max(model.predict_proba([text_proc])[0])
    # Severity (demo):
    if prob > 0.8:
        severity = 'High'
    elif prob > 0.5:
        severity = 'Medium'
    else:
        severity = 'Low'
    return {'result': pred, 'probability': float(prob), 'severity': severity}
