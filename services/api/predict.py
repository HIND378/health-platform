from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import os

router = APIRouter()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(BASE_DIR, "diabetes_model.pkl")
model_path2 = os.path.join(BASE_DIR, "cardio_model.pkl")

diabetes_model = joblib.load(model_path)
cardio_model = joblib.load(model_path2)

class DiabetesInput(BaseModel):
    pregnancies: float
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: int

class CardioInput(BaseModel):
    age: int
    sex: int
    cp: int
    trestbps: float
    chol: float
    fbs: int
    restecg: int
    thalach: float
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int

@router.post("/diabetes")
async def predict_diabetes(data: DiabetesInput):
    features = [[data.pregnancies, data.glucose, data.blood_pressure,
                 data.skin_thickness, data.insulin, data.bmi,
                 data.diabetes_pedigree, data.age]]
    proba = float(diabetes_model.predict_proba(features)[0][1])
    return {
        "prediction": int(proba >= 0.5),
        "probability": round(proba, 3),
        "risk_level": "high" if proba > 0.7 else "medium" if proba > 0.4 else "low"
    }

@router.post("/cardio")
async def predict_cardio(data: CardioInput):
    features = [[data.age, data.sex, data.cp, data.trestbps, data.chol,
                 data.fbs, data.restecg, data.thalach, data.exang,
                 data.oldpeak, data.slope, data.ca, data.thal]]
    proba = float(cardio_model.predict_proba(features)[0][1])
    return {
        "prediction": int(proba >= 0.5),
        "probability": round(proba, 3),
        "risk_level": "high" if proba > 0.7 else "medium" if proba > 0.4 else "low"
    }