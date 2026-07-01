import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from sklearn.preprocessing import OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

df = pd.read_csv("data/model_dataset.csv")

X = df[
    [
        "video_id",
        "video_duration",
        "device",
        "country",
        "age"
    ]
]

y = df["completed"]

categorical = [
    "device",
    "country"
]

numerical = [
    "video_id",
    "video_duration",
    "age"
]

preprocessor = ColumnTransformer([
    (
        "cat",
        OneHotEncoder(handle_unknown="ignore"),
        categorical
    )
], remainder="passthrough")

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

pipeline = Pipeline([
    ("prep", preprocessor),
    ("model", model)
])

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

pipeline.fit(X_train, y_train)

pred = pipeline.predict(X_test)

print(classification_report(
    y_test,
    pred
))

joblib.dump(
    pipeline,
    "models/retention_model.pkl"
)

print("Model saved")