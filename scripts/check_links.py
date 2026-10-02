"""Fail if any HTML page links to a local file that doesn't exist."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
missing = []
for page in ROOT.glob("*.html"):
    for ref in re.findall(r'(?:href|src)="([^"#:$]+)"', page.read_text()):
        if not (ROOT / ref).exists():
            missing.append(f"{page.name}: {ref}")
if missing:
    sys.exit("Broken local links:\n  " + "\n  ".join(missing))
print("links: all local links resolve")
