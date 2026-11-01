/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { runtimeHashMessageKey } from "@utils/intlHash";
import definePlugin from "@utils/types";
import { closeModal, ConfirmModal, i18n, openModal, SelectedChannelStore } from "@webpack/common";

import { createCallGuard } from "./guard";

function callLabels(): string[] {
    // Resolve on each click so changing Discord's language needs no restart.
    const labels = ["Start Voice Call", "Start Video Call"];
    for (const key of ["START_VOICE_CALL", "START_VIDEO_CALL"]) {
        try {
            const label = i18n.t[runtimeHashMessageKey(key)]();
            if (typeof label === "string") labels.push(label);
        } catch {
            // Keep English labels available if Discord changes its intl module.
        }
    }
    return labels;
}

const guard = createCallGuard({
    labels: callLabels,
    context: () => SelectedChannelStore.getChannelId(),
    confirm: decide => {
        const key = openModal(props => (
            <ErrorBoundary>
                <ConfirmModal
                    {...props}
                    title="Start a call?"
                    subtitle="Are you sure you want to start this call?"
                    confirmText="Start Call"
                    cancelText="Cancel"
                    variant="primary"
                    onConfirm={() => decide(true)}
                    onCancel={() => decide(false)}
                    onCloseCallback={() => decide(false)}
                />
            </ErrorBoundary>
        ));
        return () => closeModal(key);
    }
});

export default definePlugin({
    name: "ConfirmBeforeCall",
    description: "Asks for confirmation before starting a DM or group DM voice or video call.",
    authors: [{ name: "callbuttonmod", id: 0n }],
    tags: ["Voice", "Utility"],

    start() {
        window.addEventListener("click", guard.click, true);
    },

    stop() {
        window.removeEventListener("click", guard.click, true);
        guard.reset();
    },

    flux: {
        CHANNEL_SELECT: guard.reset
    }
});
