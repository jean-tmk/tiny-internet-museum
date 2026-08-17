"""Validate the museum catalog and generate a client-side search index."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "artifacts.json"
OUTPUT = ROOT / "public" / "generated" / "search-index.json"
REQUIRED = {"id", "year", "title", "type", "symbol", "accent", "story", "interaction", "tags"}

def main() -> None:
    artifacts = json.loads(SOURCE.read_text(encoding="utf-8"))
    seen: set[str] = set()
    index = []
    for position, artifact in enumerate(artifacts):
        missing = REQUIRED - artifact.keys()
        if missing:
            raise ValueError(f"artifact {position} is missing {sorted(missing)}")
        if artifact["id"] in seen:
            raise ValueError(f"duplicate artifact id: {artifact['id']}")
        if not artifact["accent"].startswith("#") or len(artifact["accent"]) != 7:
            raise ValueError(f"invalid accent for {artifact['id']}")
        seen.add(artifact["id"])
        index.append({
            "id": artifact["id"],
            "tokens": sorted(set(" ".join([artifact["title"], artifact["type"], *artifact["tags"]]).lower().replace(".", "").split())),
            "weight": len(artifacts) - position,
        })
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({"count": len(index), "index": index}, indent=2) + "\n", encoding="utf-8")
    print(f"curated {len(index)} artifacts -> {OUTPUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
