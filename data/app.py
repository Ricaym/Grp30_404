import streamlit as st
import pandas as pd
import joblib

st.set_page_config(
    page_title="Video Analytics AI",
    layout="wide"
)

st.title("🎥 Video Analytics Dashboard")

df = pd.read_csv("data/video_logs.csv")

model = joblib.load(
    "models/retention_model.pkl"
)

# -----------------------------
# KPIs
# -----------------------------

col1,col2,col3 = st.columns(3)

col1.metric(
    "Users",
    df["user_id"].nunique()
)

col2.metric(
    "Videos",
    df["video_id"].nunique()
)

col3.metric(
    "Events",
    len(df)
)

# -----------------------------
# Completion
# -----------------------------

st.subheader("Completion Rate")

final_events = df[
    df["event"].isin(
        ["complete","stop"]
    )
]

rate = (
    final_events["event"]
    .eq("complete")
    .mean()*100
)

st.metric(
    "Completion %",
    round(rate,2)
)

# -----------------------------
# Prediction
# -----------------------------

st.subheader("Predict Retention")

video_id = st.number_input(
    "Video ID",
    1,
    20,
    1
)

duration = st.number_input(
    "Duration",
    300,
    1200,
    600
)

device = st.selectbox(
    "Device",
    ["Desktop","Mobile","Tablet"]
)

country = st.selectbox(
    "Country",
    [
        "France",
        "Morocco",
        "Spain",
        "Germany",
        "Italy"
    ]
)

age = st.slider(
    "Age",
    18,
    60,
    25
)

if st.button("Predict"):

    sample = pd.DataFrame([{
        "video_id":video_id,
        "video_duration":duration,
        "device":device,
        "country":country,
        "age":age
    }])

    result = model.predict(sample)[0]

    if result == 1:
        st.success(
            "High retention predicted"
        )
    else:
        st.error(
            "Risk of abandonment"
        )