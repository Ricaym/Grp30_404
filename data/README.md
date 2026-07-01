# Pôle 3 — IA & Données

Dossier dédié à l'analyse des comportements de visionnage et à la prédiction de rétention des utilisateurs.

## Objectifs

À partir des logs de visionnage vidéo (play, pause, seek, stop, complete), le système permet de :

* Analyser les comportements utilisateurs ;
* Calculer le taux de complétion des vidéos ;
* Identifier les zones d'ennui grâce aux événements de navigation (seek) ;
* Détecter les vidéos les plus performantes ;
* Prédire le risque d'abandon d'une vidéo grâce à un modèle de Machine Learning.

## Pipeline IA

Le pipeline se compose des étapes suivantes :

1. Génération et collecte des logs de visionnage ;
2. Prétraitement et nettoyage des données ;
3. Analyse exploratoire et visualisations ;
4. Feature Engineering ;
5. Entraînement d'un modèle Random Forest ;
6. Évaluation et sauvegarde du modèle ;
7. Restitution des résultats dans un dashboard Streamlit.

## Structure

```text
data/
├── video_logs.csv
├── model_dataset.csv

models/
└── retention_model.pkl

scripts/
├── generate_logs.py
├── preprocess.py
├── train_model.py
└── analysis.py

app.py
```

## Fonctionnalités

* Analyse statistique des comportements de visionnage ;
* Visualisation des indicateurs clés ;
* Détection des zones d'abandon ;
* Calcul du score de rétention ;
* Prédiction de complétion ou d'abandon ;
* Dashboard interactif Streamlit.

## Modèle utilisé

Le modèle de prédiction repose sur un Random Forest Classifier entraîné à partir des caractéristiques suivantes :

* Âge de l'utilisateur ;
* Pays ;
* Appareil utilisé ;
* Identifiant de la vidéo ;
* Durée de la vidéo.

Le modèle prédit la probabilité qu'un utilisateur termine ou abandonne une vidéo.

## Dashboard

L'application Streamlit permet :

* d'afficher les statistiques globales ;
* d'explorer les données de visionnage ;
* de visualiser les indicateurs de rétention ;
* d'effectuer des prédictions en temps réel à l'aide du modèle entraîné.

## Lancement

```bash
pip install -r requirements.txt

python scripts/preprocess.py
python scripts/train_model.py

streamlit run app.py
```
