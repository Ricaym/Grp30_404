import pandas as pd
import numpy as np
import random
from faker import Faker
import os

fake = Faker()

random.seed(42)
np.random.seed(42)

N_USERS = 1000
N_VIDEOS = 20

video_lengths = {
    video: random.randint(300, 1200)
    for video in range(1, N_VIDEOS + 1)
}

events = []

for user in range(1, N_USERS + 1):

    video = random.randint(1, N_VIDEOS)

    duration = video_lengths[video]

    device = random.choice([
        "Desktop",
        "Mobile",
        "Tablet"
    ])

    country = random.choice([
        "France",
        "Morocco",
        "Spain",
        "Germany",
        "Italy"
    ])

    age = random.randint(18,60)

    watch_ratio = np.clip(
        np.random.normal(0.75,0.20),
        0.05,
        1
    )

    watch_time = int(duration * watch_ratio)

    events.append({
        "user_id":user,
        "video_id":video,
        "event":"play",
        "timestamp":0,
        "video_duration":duration,
        "device":device,
        "country":country,
        "age":age
    })

    current = 0

    while current < watch_time:

        step = random.randint(20,80)

        current += step

        if current >= watch_time:
            break

        r = random.random()

        if r < 0.15:

            events.append({
                "user_id":user,
                "video_id":video,
                "event":"pause",
                "timestamp":current,
                "video_duration":duration,
                "device":device,
                "country":country,
                "age":age
            })

        elif r < 0.22:

            events.append({
                "user_id":user,
                "video_id":video,
                "event":"seek",
                "timestamp":current,
                "video_duration":duration,
                "device":device,
                "country":country,
                "age":age
            })

    if watch_ratio > 0.95:

        last_event = "complete"

    else:

        last_event = "stop"

    events.append({
        "user_id":user,
        "video_id":video,
        "event":last_event,
        "timestamp":watch_time,
        "video_duration":duration,
        "device":device,
        "country":country,
        "age":age
    })

df = pd.DataFrame(events)

os.makedirs("data", exist_ok=True)

df.to_csv("data/video_logs.csv", index=False)

print(df.head())

print()

print("Rows :",len(df))

print("Dataset saved in data/video_logs.csv")
