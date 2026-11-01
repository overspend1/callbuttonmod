#!/usr/bin/env python3
"""Package an already-built Vencord checkout with ConfirmBeforeCall."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tarfile
import zipfile

root = Path(__file__).resolve().parents[1]
vencord = Path(sys.argv[1]).resolve()
out = root / "release"
out.mkdir(exist_ok=True)
upstream = subprocess.check_output(["git", "-C", str(vencord), "rev-parse", "HEAD"], text=True).strip()
plugin = subprocess.check_output(["git", "-C", str(root), "rev-parse", "HEAD"], text=True).strip()
required = ["patcher.js", "preload.js", "renderer.js", "renderer.css",
            "vencordDesktopMain.js", "vencordDesktopPreload.js", "vencordDesktopRenderer.js",
            "vencordDesktopRenderer.css"]
for name in required:
    if not (vencord / "dist" / name).is_file():
        raise SystemExit(f"Missing build output: {name}")
for path in (root / "confirmBeforeCall").iterdir():
    if path.read_bytes() != (vencord / "src/userplugins/confirmBeforeCall" / path.name).read_bytes():
        raise SystemExit("The built checkout must contain the current plugin source.")
for name in ["renderer.js", "vencordDesktopRenderer.js"]:
    if "ConfirmBeforeCall" not in (vencord / "dist" / name).read_text():
        raise SystemExit(f"Plugin missing from {name}")

prefix = "ConfirmBeforeCall"
with zipfile.ZipFile(out / "ConfirmBeforeCall-desktop.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for path in sorted((vencord / "dist").iterdir()):
        if path.is_file() and (path.suffix in [".js", ".css", ".map"] or path.name.endswith(".LEGAL.txt")):
            archive.write(path, f"{prefix}/dist/{path.name}")
    for path in sorted((root / "scripts/installers").iterdir()):
        archive.write(path, f"{prefix}/{path.name}")
    for name in ["README.md", "LICENSE"]:
        archive.write(root / name, f"{prefix}/{name}")
    archive.writestr(f"{prefix}/BUILD.json", json.dumps({
        "vencordCommit": upstream, "pluginCommit": plugin,
        "buildCommand": "pnpm build --dev --standalone --disable-updater",
        "sourceArchive": "ConfirmBeforeCall-source.tar.gz",
        "upstream": "https://github.com/Vendicated/Vencord"
    }, indent=2) + "\n")

# Full corresponding source, including upstream build scripts and lockfile.
tracked = subprocess.check_output(["git", "-C", str(vencord), "ls-files", "-z"]).decode().split("\0")
with tarfile.open(out / "ConfirmBeforeCall-source.tar.gz", "w:gz") as archive:
    for name in sorted(filter(None, tracked)):
        archive.add(vencord / name, arcname=f"Vencord/{name}", recursive=False)
    for path in sorted((root / "confirmBeforeCall").iterdir()):
        archive.add(path, arcname=f"Vencord/src/userplugins/confirmBeforeCall/{path.name}")
    archive.add(root / "README.md", arcname="Vencord/CONFIRM-BEFORE-CALL.md")
    info = out / "BUILD-SOURCE.txt"
    info.write_text(f"Vencord commit: {upstream}\nPlugin commit: {plugin}\n"
                    "Modified by callbuttonmod: added src/userplugins/confirmBeforeCall.\n"
                    "Install dependencies: pnpm install --frozen-lockfile\n"
                    f"Build: VENCORD_HASH={upstream} VENCORD_REMOTE=Vendicated/Vencord pnpm build --dev --standalone --disable-updater\n")
    archive.add(info, arcname="Vencord/BUILD-SOURCE.txt")
    info.unlink()
assets = [out / "ConfirmBeforeCall-desktop.zip", out / "ConfirmBeforeCall-source.tar.gz"]
(out / "SHA256SUMS.txt").write_text("".join(f"{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n" for p in assets))
for path in assets:
    print(f"{path} ({path.stat().st_size:,} bytes)")
