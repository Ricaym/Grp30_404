import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv("data/video_logs.csv")

print("Nombre total d'événements :", len(df))
print("Nombre d'utilisateurs :", df["user_id"].nunique())
print("Nombre de vidéos :", df["video_id"].nunique())

# -----------------------------------
# Taux de complétion
# -----------------------------------

last_events = df[df["event"].isin(["complete", "stop"])]

completion_rate = (
    last_events["event"]
    .value_counts(normalize=True)
    * 100
)

print("\nTaux de complétion :")
print(completion_rate)

# -----------------------------------
# Appareils utilisés
# -----------------------------------

plt.figure(figsize=(8,5))
sns.countplot(data=df, x="device")
plt.title("Répartition des appareils")
plt.savefig("device_distribution.png")

# -----------------------------------
# Pays
# -----------------------------------

plt.figure(figsize=(8,5))
sns.countplot(data=df, x="country")
plt.title("Répartition des pays")
plt.savefig("country_distribution.png")

# -----------------------------------
# Zones d'ennui
# -----------------------------------

seeks = df[df["event"]=="seek"]

plt.figure(figsize=(10,5))
sns.histplot(seeks["timestamp"], bins=30)
plt.title("Zones d'ennui (seek)")
plt.savefig("boring_zones.png")

print("\nAnalyse terminée")