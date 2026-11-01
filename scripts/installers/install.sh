#!/usr/bin/env bash
set -euo pipefail
bundle_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
case "$(uname -s)" in
    Darwin) installer_name=VencordInstallerCli-darwin ;;
    Linux) installer_name=VencordInstallerCli-linux ;;
    *) echo 'Use install-windows.cmd on Windows.' >&2; exit 1 ;;
esac
if [ ! -f "$bundle_dir/dist/patcher.js" ]; then
    echo 'Extract the entire ZIP before installing.' >&2
    exit 1
fi
mkdir -p "$bundle_dir/installer"
installer_path="$bundle_dir/installer/$installer_name"
curl --fail --location --show-error --output "$installer_path" "https://github.com/Vencord/Installer/releases/latest/download/$installer_name"
chmod +x "$installer_path"
if [ "$#" -eq 0 ]; then set -- --install; fi
VENCORD_USER_DATA_DIR="$bundle_dir" VENCORD_DEV_INSTALL=1 "$installer_path" "$@"
echo 'Done. Restart Discord and enable ConfirmBeforeCall in Vencord settings.'
