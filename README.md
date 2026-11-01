# ConfirmBeforeCall

A Vencord plugin that asks before you start a voice or video call in a DM or group DM. Click **Start Call** to call, or **Cancel** if you clicked by accident.

## Install

You'll need a [Vencord source build](https://docs.vencord.dev/installing/).

1. Copy `confirmBeforeCall` into your Vencord folder under `src/userplugins/`.
2. Run these commands from the Vencord folder:

   ```sh
   pnpm build
   pnpm inject
   ```

3. Restart Discord and enable **ConfirmBeforeCall** in Settings → Vencord → Plugins.

Only covers the voice and video call buttons. Context-menu calls, keyboard shortcuts, and server voice channels aren't covered.
