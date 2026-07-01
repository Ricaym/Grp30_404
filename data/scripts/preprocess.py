import pandas as pd

df = pd.read_csv("data/video_logs.csv")

final_events = df[df["event"].isin(["complete","stop"])].copy()

final_events["retention_ratio"] = (
    final_events["timestamp"]
    / final_events["video_duration"]
)

final_events["completed"] = (
    final_events["event"] == "complete"
).astype(int)

final_events.to_csv(
    "data/model_dataset.csv",
    index=False
)

print(final_events.head())