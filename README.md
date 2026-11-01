# ConfirmBeforeCall

A Vencord plugin that asks before you start a voice or video call in a DM or group DM. Click **Start Call** to call, or **Cancel** if you clicked by accident.

## Install

No Node or pnpm needed. This is a custom Vencord build with the plugin included.

1. Download **[ConfirmBeforeCall-desktop.zip](https://github.com/overspend1/callbuttonmod/releases/latest/download/ConfirmBeforeCall-desktop.zip)** and extract it somewhere you'll keep it.
2. Close Discord completely, then run the installer for your system:
   - **Windows:** double-click `install-windows.cmd`.
   - **macOS:** run `bash install.sh` in Terminal from the extracted folder.
   - **Linux:** run `bash install.sh` from the extracted folder.
3. Select your Discord installation. Restart Discord and enable **ConfirmBeforeCall** in Settings → Vencord → Plugins.

The scripts download the official Vencord installer and point it at the included build. Keep the extracted folder in place; Discord loads Vencord from it. This replaces the Vencord build used by that Discord installation. Automatic Vencord updates are disabled so they don't remove the plugin; get updates from this repo's releases.

Only covers the voice and video call buttons. Context-menu calls, keyboard shortcuts, and server voice channels aren't covered. Built and tested locally; installation and live calling haven't been tested on Windows, macOS, or Linux.

## Building from source

If you already build Vencord yourself, copy `confirmBeforeCall` into `src/userplugins/`, then build and inject as usual. Full Vencord source for the prebuilt bundle is included with each release.
