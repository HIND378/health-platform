import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score
import joblib

df = pd.read_csv('data/diabetes.csv')

cols = ['Glucose','BloodPressure','SkinThickness','Insulin','BMI']
for col in cols:
    df[col] = df[col].replace(0, df[col].median())

X = df.drop('Outcome', axis=1)
y = df['Outcome']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', RandomForestClassifier(n_estimators=200, random_state=42))
])

model.fit(X_train, y_train)
acc = accuracy_score(y_test, model.predict(X_test))
print(f"Accuracy diabete: {acc:.2%}")

joblib.dump(model, 'diabetes_model.pkl')
print("Fichier diabetes_model.pkl cree !")
model1 = joblib.load("diabetes_model.pkl")
print(model1)