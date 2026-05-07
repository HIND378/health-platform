from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
from typing import List
import os, json
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY manquante dans le .env")

client = Groq(api_key=api_key, timeout=15.0)

class PatientData(BaseModel):
    patient_name: str
    age: int
    medical_history: List[str] = []
    medications: List[str] = []
    recent_results: dict = {}
    symptoms: List[str] = []

class ChatRequest(BaseModel):
    question: str
    history: list = []

@router.post("/patient")
async def summarize_patient(data: PatientData):
    prompt = f"""
Tu es un assistant médical. Génère un résumé clinique structuré.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans backticks.

Données du patient:
Nom: {data.patient_name}, Age: {data.age}
Antécédents: {', '.join(data.medical_history) if data.medical_history else 'aucun'}
Médicaments: {', '.join(data.medications) if data.medications else 'aucun'}
Résultats: {json.dumps(data.recent_results, ensure_ascii=False)}
Symptômes: {', '.join(data.symptoms) if data.symptoms else 'aucun'}

Format de réponse (JSON pur uniquement):
{{
  "resume": "résumé clinique en 2-3 phrases",
  "points_attention": ["point 1", "point 2"],
  "examens_suggeres": ["examen 1", "examen 2"],
  "priorite": "routine"
}}
"""
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=600,
        )

        text = response.choices[0].message.content.strip()

        # Nettoyage au cas où le modèle ajoute des backticks
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        return json.loads(text)

    except json.JSONDecodeError:
        return {
            "resume": text,
            "points_attention": [],
            "examens_suggeres": [],
            "priorite": "routine"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/medical")
async def medical_chat(req: ChatRequest):
    messages = [
        {
            "role": "system",
            "content": "Tu es un assistant médical pour médecins uniquement. Réponds en français, sois concis et précis. Le diagnostic final appartient toujours au médecin."
        }
    ]

    for msg in req.history[-10:]:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

    messages.append({"role": "user", "content": req.question})

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=500
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))