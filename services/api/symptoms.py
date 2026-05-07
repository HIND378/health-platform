from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

SYMPTOM_MAP = {
    "fatigue": ["diabete", "anemie", "thyroide"],
    "soif": ["diabete", "diabete insipide"],
    "douleur thoracique": ["cardiovasculaire", "angine"],
    "essoufflement": ["cardiovasculaire", "asthme"],
    "vision floue": ["diabete", "hypertension"],
    "maux de tete": ["hypertension", "migraine"],
    "palpitations": ["cardiovasculaire", "anxiete"],
    "urination frequente": ["diabete", "infection urinaire"],
    "transpiration": ["diabete", "cardiovasculaire"],
    "douleur bras": ["cardiovasculaire", "infarctus"],
}

class SymptomsInput(BaseModel):
    symptoms: List[str]
    age: int = 30

@router.post("/analyze")
async def analyze_symptoms(data: SymptomsInput):
    scores = {}
    for symptom in data.symptoms:
        s = symptom.lower()
        for key, diseases in SYMPTOM_MAP.items():
            if key in s:
                for d in diseases:
                    scores[d] = scores.get(d, 0) + 1

    results = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]

    return {
        "possible_conditions": [
            {"condition": d, "matches": c,
             "urgency": "urgent" if c >= 2 else "normal"}
            for d, c in results
        ],
        "disclaimer": "Suggestion IA uniquement. Le diagnostic final appartient au medecin."
    }