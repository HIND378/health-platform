import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
import joblib

df = pd.read_csv('data/heart.csv')
X = df.drop('target', axis=1)
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', GradientBoostingClassifier(n_estimators=150, random_state=42))
])

model.fit(X_train, y_train)
acc = accuracy_score(y_test, model.predict(X_test))
print(f"Accuracy cardio: {acc:.2%}")

joblib.dump(model, 'cardio_model.pkl')
print("Fichier cardio_model.pkl cree !")
model2 = joblib.load("cardio_model.pkl")
print(model2)