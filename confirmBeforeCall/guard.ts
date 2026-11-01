/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

interface GuardOptions {
    labels(): readonly string[];
    context(): string | undefined;
    confirm(decide: (confirmed: boolean) => void): () => void;
}

export function createCallGuard(options: GuardOptions) {
    let pending: object | undefined;
    let closeModal: (() => void) | undefined;
    let allowedButton: Element | undefined;

    const reset = () => {
        pending = undefined;
        const close = closeModal;
        closeModal = undefined;
        close?.();
    };

    const click = (event: MouseEvent) => {
        const { target } = event;
        const button = target instanceof Element ? target.closest<HTMLElement>('button, [role="button"]') : null;
        const label = button?.getAttribute("aria-label") ?? "";

        if (button && allowedButton === button) {
            allowedButton = undefined;
            return;
        }
        if (!button || !options.labels().includes(label)) return;
        if (event.button !== 0 || button.matches(':disabled, [aria-disabled="true"]')) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        if (pending) return;

        const context = options.context();
        const request = pending = {};
        closeModal = options.confirm(confirmed => {
            if (pending !== request) return;
            reset();
            if (!confirmed || !button.isConnected || options.context() !== context
                || button.getAttribute("aria-label") !== label
                || button.matches(':disabled, [aria-disabled="true"]')) return;

            // Permit only the synchronous replay of this confirmed button click.
            allowedButton = button;
            try {
                button.click();
            } finally {
                allowedButton = undefined;
            }
        });
    };

    return { click, reset };
}
