# ConfirmBeforeCall for Vencord

Clicking Discord's **Start Voice Call** or **Start Video Call** button opens a
confirmation popup with **Start Call** and **Cancel**. The call starts only after
you choose Start Call. Cancel, Escape, or dismissing the popup does nothing.

Works with labeled call buttons in DMs and group DMs, including keyboard
activation. Switching conversations or disabling the plugin closes any pending
confirmation. Repeated clicks cannot bypass confirmation or open duplicate
popups. Discord's localized labels are resolved using Vencord's intl helpers.

## Install

Custom plugins require a **Vencord source build**. Follow the official
[source installation guide](https://docs.vencord.dev/installing/), then the
[custom plugin instructions](https://docs.vencord.dev/installing/custom-plugins/).

1. Copy this repository's **confirmBeforeCall** folder into your Vencord checkout
   as `src/userplugins/confirmBeforeCall`. Include `index.tsx` and `guard.ts`.
   If you copied the earlier `doubleClickToCall` plugin, remove that folder first.
2. From that Vencord checkout, run:

   ```sh
   pnpm build
   pnpm inject
   ```

3. Fully quit and reopen Discord. In **Settings → Vencord → Plugins**, enable
   **ConfirmBeforeCall**.

This is a Vencord userplugin, not a BetterDiscord `.plugin.js` file. QuickCSS and
the standard Vencord plugin list cannot install custom plugins.
The author ID in `index.tsx` is a placeholder (`0n`); replace it if you publish it.

## Scope and verification

The guard recognizes buttons by their accessible Start Voice Call and Start
Video Call labels. It does not cover context-menu calls, call shortcuts,
incoming-call answers, or server voice-channel joins.

If Discord changes those labels or starts calls on another event, this plugin
will need updating. After installation, verify in a safe test DM: clicking the
call button must open confirmation without starting a call; Cancel and Escape
must leave it unstarted; Start Call must start exactly one call. Repeat for video
and group DMs. Live calling has not been tested here; this project has no
authenticated Discord session.

Run the DOM event tests with Node.js 22.18+:

```sh
npm ci
npm test
```

Tests cover confirmation, cancellation, duplicate clicks, stale confirmations,
keyboard activation, nested icons, localized labels, and disabling the guard.
Development dependencies are only for these tests; Vencord builds the plugin.
