import assert from "node:assert/strict";
import { test } from "node:test";
import { Window } from "happy-dom";
import { createCallGuard } from "../confirmBeforeCall/guard.ts";

function setup() {
    const window = new Window();
    globalThis.Element = window.Element as unknown as typeof Element;
    window.document.body.innerHTML = `
        <button aria-label="Start Voice Call"><svg><path /></svg></button>
        <div role="button" aria-label="Start Video Call"></div>
        <button aria-label="Mute"></button>`;
    const [voice, video, mute] = window.document.body.children;
    let context = "dm-1", calls = 0, closed = 0;
    const decisions: Array<(value: boolean) => void> = [];
    const guard = createCallGuard({
        labels: () => ["Start Voice Call", "Start Video Call", "Sprachanruf starten"],
        context: () => context,
        confirm: decide => {
            decisions.push(decide);
            return () => { closed++; decide(false); };
        }
    });
    window.document.addEventListener("click", () => { calls++; });
    window.addEventListener("click", guard.click as never, true);
    const click = (target = voice, detail = 1) => {
        const event = new window.MouseEvent("click", { bubbles: true, cancelable: true, button: 0, detail });
        target.dispatchEvent(event);
        return event;
    };
    return { window, voice, video, mute, guard, click, decisions,
        calls: () => calls, closed: () => closed,
        switchDM: () => { context = "dm-2"; } };
}

test("call is blocked until confirmed, then starts exactly once", () => {
    const s = setup();
    assert.equal(s.click().defaultPrevented, true);
    assert.equal(s.calls(), 0);
    s.decisions[0](true);
    assert.equal(s.calls(), 1);
    assert.equal(s.closed(), 1);
    s.decisions[0](true);
    assert.equal(s.calls(), 1);
    s.click();
    assert.equal(s.calls(), 1);
    assert.equal(s.decisions.length, 2);
});

test("cancel, Escape, or dismissal never starts a call", () => {
    const s = setup();
    s.click();
    s.decisions[0](false);
    assert.equal(s.calls(), 0);
    s.click();
    assert.equal(s.decisions.length, 2);
});

test("rapid repeat clicks cannot confirm or open duplicate popups", () => {
    const s = setup();
    s.click();
    s.click(s.voice, 2);
    s.click(s.video);
    assert.equal(s.calls(), 0);
    assert.equal(s.decisions.length, 1);
});

test("nested icons, video buttons and keyboard activation require confirmation", () => {
    for (const kind of ["icon", "video", "keyboard"]) {
        const s = setup();
        s.click(kind === "icon" ? s.voice.querySelector("path")! : kind === "video" ? s.video : s.voice, 0);
        assert.equal(s.calls(), 0);
        s.decisions[0](true);
        assert.equal(s.calls(), 1);
    }
});

test("changing conversation, detaching, disabling or relabeling the button prevents stale confirmation", () => {
    for (const change of ["channel", "detach", "disable", "label"]) {
        const s = setup();
        s.click();
        if (change === "channel") s.switchDM();
        if (change === "detach") s.voice.remove();
        if (change === "disable") s.voice.setAttribute("disabled", "");
        if (change === "label") s.voice.setAttribute("aria-label", "Disconnect");
        s.decisions[0](true);
        assert.equal(s.calls(), 0);
    }
});

test("reset closes popup and invalidates its callbacks", () => {
    const s = setup();
    s.click();
    s.guard.reset();
    assert.equal(s.closed(), 1);
    s.decisions[0](true);
    assert.equal(s.calls(), 0);
});

test("unrelated controls work while a popup is pending", () => {
    const s = setup();
    s.click();
    s.click(s.mute);
    assert.equal(s.calls(), 1);
    s.decisions[0](false);
    assert.equal(s.calls(), 1);
});

test("localized labels require confirmation", () => {
    const s = setup();
    s.voice.setAttribute("aria-label", "Sprachanruf starten");
    s.click();
    assert.equal(s.calls(), 0);
    s.decisions[0](true);
    assert.equal(s.calls(), 1);
});

test("disabling closes pending popup and restores normal clicks", () => {
    const s = setup();
    s.click();
    s.window.removeEventListener("click", s.guard.click as never, true);
    s.guard.reset();
    s.decisions[0](true);
    assert.equal(s.calls(), 0);
    s.click();
    assert.equal(s.calls(), 1);
});
