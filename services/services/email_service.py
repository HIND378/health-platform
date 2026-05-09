import resend, os
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

def send_appointment_reminder(to_email, patient_name, doctor_name, rdv_time):
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": [to_email],
            "subject": f"Rappel RDV avec Dr. {doctor_name}",
            "html": f"""
            <h2>Rappel de rendez-vous</h2>
            <p>Bonjour <b>{patient_name}</b>,</p>
            <p>Votre rendez-vous avec le <b>Dr. {doctor_name}</b>
               est demain à <b>{rdv_time}</b>.</p>
            <p>Cordialement, Health Platform</p>
            """
        })
        return {"sent": True}
    except Exception as e:
        return {"sent": False, "error": str(e)}

def send_medication_reminder(to_email, patient_name, medication, dosage):
    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": [to_email],
            "subject": f"Rappel medicament : {medication}",
            "html": f"""
            <p>Bonjour {patient_name},</p>
            <p>N'oubliez pas de prendre <b>{medication}</b> ({dosage}).</p>
            """
        })
        return {"sent": True}
    except Exception as e:
        return {"sent": False, "error": str(e)}