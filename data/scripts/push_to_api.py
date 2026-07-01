#!/usr/bin/env python3
"""
Pôle 3 → Pôle 1 : pousse l'analyse audience vers Video Learning Hub.

Usage (depuis le dossier data/) :
  python scripts/push_to_api.py --video 1
  python scripts/push_to_api.py --video vid-1
  python scripts/push_to_api.py --video 1 --api http://localhost:3001 --key change-me-integration-key
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path

import pandas as pd

DATA_DIR = Path(__file__).resolve().parent.parent
LOGS_CSV = DATA_DIR / "data" / "video_logs.csv"


def normalize_video_id(raw: str) -> tuple[str, int]:
    """Retourne (hub_id ex. vid-1, numeric_id pour les logs Pôle 3)."""
    raw = raw.strip()
    match = re.fullmatch(r"vid-(\d+)", raw, re.IGNORECASE)
    if match:
        num = int(match.group(1))
        return f"vid-{num}", num
    if raw.isdigit():
        num = int(raw)
        return f"vid-{num}", num
    raise ValueError(f"video_id invalide: {raw} (attendu: 1 ou vid-1)")


def sec_to_time(seconds: int) -> str:
    seconds = max(0, int(seconds))
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def build_analysis(df: pd.DataFrame, numeric_id: int) -> dict:
    video_df = df[df["video_id"] == numeric_id]
    if video_df.empty:
        raise ValueError(f"Aucun log pour video_id={numeric_id}")

    users = video_df["user_id"].nunique()
    duration = int(video_df["video_duration"].iloc[0])

    finals = video_df[video_df["event"].isin(["complete", "stop"])]
    completion_pct = 0.0
    if len(finals) > 0:
        completion_pct = finals["event"].eq("complete").mean() * 100

    top_devices = video_df["device"].value_counts().head(3).index.tolist()
    top_countries = video_df["country"].value_counts().head(3).index.tolist()

    seeks = video_df[video_df["event"] == "seek"]
    boring_bins = Counter((int(ts) // 60) for ts in seeks["timestamp"])
    chapters: list[dict[str, str]] = [
        {"time": "00:00", "title": "Introduction"}
    ]
    for minute, count in boring_bins.most_common(5):
        if count >= 2:
            chapters.append({
                "time": sec_to_time(minute * 60),
                "title": f"Zone d'ennui détectée ({count} seeks)",
            })
    chapters.append({
        "time": sec_to_time(max(duration - 30, 0)),
        "title": "Fin de vidéo",
    })

    summary = (
        f"Analyse audience (Pôle 3) — {users} spectateurs, "
        f"taux de complétion {completion_pct:.1f}%. "
        f"Appareils dominants : {', '.join(top_devices)}. "
        f"Pays principaux : {', '.join(top_countries)}. "
        f"{len(seeks)} événements seek (zones d'ennui potentielles)."
    )

    keywords = list(dict.fromkeys(
        top_devices + top_countries + ["rétention", "engagement", "analytics"]
    ))[:8]

    return {
        "summary": summary,
        "keywords": keywords,
        "chapters": chapters,
    }


def push_to_hub(
    hub_video_id: str,
    payload: dict,
    api_base: str,
    integration_key: str,
) -> dict:
    url = f"{api_base.rstrip('/')}/api/integration/videos/{hub_video_id}/ai"
    body = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-Integration-Key": integration_key,
        },
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Pousse l'analyse Pôle 3 vers Grp30_404")
    parser.add_argument("--video", required=True, help="ID vidéo: 1, 2, ou vid-1")
    parser.add_argument("--api", default=os.getenv("API_URL", "http://localhost:3001"))
    parser.add_argument(
        "--key",
        default=os.getenv("INTEGRATION_API_KEY", "change-me-integration-key"),
    )
    parser.add_argument("--logs", default=str(LOGS_CSV))
    args = parser.parse_args()

    if not Path(args.logs).exists():
        print(f"Fichier introuvable: {args.logs}", file=sys.stderr)
        return 1

    try:
        hub_id, numeric_id = normalize_video_id(args.video)
        df = pd.read_csv(args.logs)
        payload = build_analysis(df, numeric_id)
        result = push_to_hub(hub_id, payload, args.api, args.key)
        print(json.dumps({"ok": True, "videoId": hub_id, "api": result}, indent=2, ensure_ascii=False))
        return 0
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        print(f"Erreur API {error.code}: {detail}", file=sys.stderr)
        return 1
    except Exception as error:  # noqa: BLE001
        print(f"Erreur: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
