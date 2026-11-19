import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { webcrypto } from "node:crypto";
import { parseHTML } from "linkedom";
const tick = () => new Promise((resolve) => setImmediate(resolve));
async function setup({ fail = false, admin = true, secureContext = true } = {}) {
	const { window } = parseHTML("<html><body></body></html>");
	const context = vm.createContext({
		window,
		document: window.document,
		HTMLElement: window.HTMLElement,
		customElements: window.customElements,
		CustomEvent: window.CustomEvent,
		console,
        URLSearchParams,
        structuredClone,
        crypto: secureContext ? webcrypto : { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) },
	});
	vm.runInContext(
		await readFile(
			new URL(
				"../../custom_components/broadlink_ir_mapper/frontend/ir-mapper.js",
				import.meta.url,
			),
			"utf8",
		),
		context,
	);
	const calls = [];
	const hass = {
		user: { is_admin: admin },
		states: {
			"remote.test": { state: "on" },
			"light.ir": {
				entity_id: "light.ir",
				state: "on",
				attributes: {
					friendly_name: "Desk lamp",
					ir_mapper: true,
					ir_remote: "remote.test",
					ir_colors: [{ name: "Coral", rgb: [255, 90, 80] }],
					effect_list: ["Gentle Fade"],
					rgb_color: [255, 90, 80],
					ir_dimmable: true,
					brightness: 230,
					ir_brightness_steps: 10,
					ir_can_resynchronize: true,
				},
			},
		},
		callService: async (...args) => {
			calls.push(args);
			if (fail) throw new Error("Remote offline");
		},
	};
	const card = window.document.createElement("ha-plus-ir-card");
	card.setConfig({ entity: "light.ir" });
	card.hass = hass;
	window.document.body.append(card);
	return { window, hass, card, calls };
}
test("presets and exact effect names come from entity metadata", async () => {
	const { card, calls } = await setup();
	assert.equal(card.shadowRoot.querySelectorAll(".swatch").length, 1);
	assert.equal(
		card.shadowRoot.querySelector(".swatch").getAttribute("aria-pressed"),
		"true",
	);
	card.shadowRoot.querySelector(".effect").click();
	await tick();
	assert.equal(calls[0][2].effect, "Gentle Fade");
});
test("dragging changes display; only release sends brightness", async () => {
	const { window, card, calls } = await setup();
	const slider = card.shadowRoot.querySelector("input");
	for (const value of [200, 180, 150]) {
		slider.value = value;
		slider.dispatchEvent(new window.Event("input"));
	}
	assert.equal(calls.length, 0);
	slider.dispatchEvent(new window.Event("change"));
	await tick();
	assert.equal(calls.length, 1);
	assert.equal(calls[0][2].brightness, 150);
});
test("errors remain visible and pending commands cannot be doubled", async () => {
	const { card, calls } = await setup({ fail: true });
	card.shadowRoot.querySelector(".power").click();
	card.shadowRoot.querySelector(".power").click();
	await tick();
	assert.equal(calls.length, 1);
	assert.match(
		card.shadowRoot.querySelector('[role="alert"]').textContent,
		/Remote offline/,
	);
	assert.equal(card.shadowRoot.querySelector(".power").disabled, false);
});
test("unavailable remotes disable controls and non-admins have no settings link", async () => {
	const { card, hass } = await setup({ admin: false });
	hass.states["remote.test"].state = "unavailable";
	card.hass = hass;
	assert.equal(card.shadowRoot.querySelector(".power").disabled, true);
	assert.equal(card.shadowRoot.querySelector("a"), null);
});
test("names are rendered as text and resync is an explicit service", async () => {
	const { card, hass, calls } = await setup();
	hass.states["light.ir"].attributes.friendly_name =
		'<img src=x onerror="attack()">';
	card.hass = hass;
	assert.equal(card.shadowRoot.querySelector("img"), null);
	assert.match(card.shadowRoot.querySelector("h2").textContent, /<img/);
	card.shadowRoot.querySelector(".footer button").click();
	await tick();
	assert.equal(calls[0][0], "broadlink_ir_mapper");
	assert.equal(calls[0][1], "resynchronize");
});
test("panel reuses cards and shows native setup and empty states", async () => {
	const { window, hass } = await setup();
	const panel = window.document.createElement("ha-plus-ir-panel");
	panel.hass = hass;
	const card = panel.shadowRoot.querySelector("ha-plus-ir-card");
	panel.hass = hass;
	assert.equal(panel.shadowRoot.querySelector("ha-plus-ir-card"), card);
	assert.match(
		panel._add.textContent,
		/Add Device/,
	);
	delete hass.states["light.ir"];
	panel.hass = hass;
	assert.equal(panel.shadowRoot.querySelector(".empty").hidden, false);
});

test("unrelated HA updates preserve the current slider element", async () => {
	const { card, hass } = await setup();
	const slider = card.shadowRoot.querySelector("input");
	card.hass = {
		...hass,
		states: {
			...hass.states,
			"sensor.unrelated": { state: "new", attributes: {} },
		},
	};
	assert.equal(card.shadowRoot.querySelector("input"), slider);
});

test('panel and card share control styles and color presets use the package helper', async () => {
  const { controlStyles } = await import('@ha-plus/ui');
  const { card, hass, window } = await setup();
  const panel = window.document.createElement('ha-plus-ir-panel');
  panel.hass = hass;
  for (const view of [card, panel]) {
    assert.ok(view.shadowRoot.querySelector('style').textContent.startsWith(controlStyles));
    assert.equal([...view.shadowRoot.children].filter(node => node.localName === 'style').length, 1);
  }
  assert.equal(card.shadowRoot.querySelector('.swatch').style.backgroundColor, 'rgb(255,90,80)');
});


test("IR editor keeps settings together and learns a default grid with confirmation", async () => {
  const { window, hass } = await setup();
  for (const name of ["ha-form", "ha-checkbox", "ha-dialog", "ha-icon-button"]) window.customElements.define(name, class extends window.HTMLElement {});
  const calls = [];
  hass.callWS = async data => { calls.push(data); return { device: "capture", command: "on" }; };
  const editor = window.document.createElement("ha-plus-ir-device-editor");
  window.document.body.append(editor);
  await editor.configure(hass, [], undefined, () => {});
  const settings = editor.shadowRoot.querySelector("ha-form");
  assert.deepEqual(Array.from(settings.schema, field => field.name), ["name", "broadlink_remote", "brightness_steps", "helper"]);
  settings.dispatchEvent(new window.CustomEvent("value-changed", { detail: { value: { name: "Desk", broadlink_remote: "remote.test", brightness_steps: 8, helper: "new" } } }));
  const find = text => Array.from(editor.shadowRoot.querySelectorAll("button")).find(button => button.textContent === text);
  find("Learn commands").click();
  assert.equal(editor.shadowRoot.querySelectorAll(".remote-command").length, 24);
  assert.equal(editor.shadowRoot.querySelectorAll('[data-required="true"]').length, 2);
  editor.shadowRoot.querySelector(".remote-command").click();
  await tick();
  assert.equal(calls[0].type, "broadlink_ir_mapper/learn");
  assert.equal(editor._data.ir_codes.power_on, undefined);
  find("Yes, keep command").click();
  assert.equal(editor._data.ir_codes.power_on.command, "on");
  find("Save").click();
  assert.match(editor.shadowRoot.innerHTML, /Learn Power on and Power off before saving/);
  assert.equal(calls.length, 1);
});

test("IR editing preserves commands until confirmed and accepts custom hex colors", async () => {
  const { window, hass } = await setup();
  for (const name of ["ha-form", "ha-checkbox", "ha-dialog", "ha-icon-button"]) window.customElements.define(name, class extends window.HTMLElement {});
  const device = { name: "Desk", broadlink_remote: "remote.test", brightness_steps: 10, unique_id: "original", ir_codes: { power_on: { device: "old", command: "old" }, power_off: { device: "old", command: "off" } }, colors: [{ name: "Red", rgb: [255,0,0], ir_code: { device: "old", command: "red" } }], effects: [] };
  const entry = { entry_id: "existing", revision: "before", devices: [device] };
  const calls = [];
  hass.callWS = async data => { calls.push(data); return { device: "new", command: "new" }; };
  const editor = window.document.createElement("ha-plus-ir-device-editor");
  await editor.configure(hass, [entry], { entry, device }, () => {});
  editor._tab = "commands";
  editor.render();
  editor.shadowRoot.querySelector(".remote-command").click();
  const find = text => Array.from(editor.shadowRoot.querySelectorAll("button")).find(button => button.textContent === text);
  find("Replace command").click();
  await tick();
  find("Discard").click();
  assert.equal(editor._data.ir_codes.power_on.command, "old");
  assert.equal(device.ir_codes.power_on.command, "old");
  Array.from(editor.shadowRoot.querySelectorAll(".remote-command")).find(button => button.textContent.startsWith("Red")).click();
  const hex = editor.shadowRoot.querySelector("ha-textfield");
  hex.value = "#1234ab";
  hex.dispatchEvent(new window.Event("input"));
  assert.deepEqual(Array.from(editor._data.colors[0].rgb), [18,52,171]);
  find("Save").click();
  await tick();
  assert.equal(calls.at(-1).entry_id, "existing");
  assert.equal(calls.at(-1).device_id, "original");
  assert.equal(calls.at(-1).revision, "before");
  assert.deepEqual(Array.from(calls.at(-1).definition.colors[0].rgb), [18,52,171]);
});

async function setupDeviceEditor(options) {
  const { window, hass } = await setup(options);
  for (const name of ["ha-form", "ha-checkbox", "ha-dialog", "ha-icon-button"]) {
    window.customElements.define(name, class extends window.HTMLElement {});
  }
  const editor = window.document.createElement("ha-plus-ir-device-editor");
  window.document.body.append(editor);
  await editor.configure(hass, [], undefined, () => {});
  const click = text => {
    const control = [...editor.shadowRoot.querySelectorAll("button")].find(button => button.textContent === text);
    assert.ok(control, `Missing button: ${text}`);
    control.click();
  };
  const settings = (remote = "remote.test") => editor.shadowRoot.querySelector("ha-form")
    .dispatchEvent(new window.CustomEvent("value-changed", {
      detail: { value: { name: "Desk", broadlink_remote: remote, brightness_steps: 8, helper: "new" } },
    }));
  return { window, hass, editor, click, settings };
}

test("guided setup allocates request IDs on local HTTP", async () => {
  const { editor, settings, click } = await setupDeviceEditor({ secureContext: false });
  settings();
  click("Learn commands");
  assert.equal(editor._tab, "commands");
  assert.match(editor._requestId, /^[0-9a-f]{32}$/);
});

test("save and add another uses the committed helper without a second request", async () => {
  const { editor, hass, settings, click } = await setupDeviceEditor();
  settings();
  const previousRequest = editor._requestId;
  editor._data.ir_codes = { power_on: "JgBQAA==", power_off: "JgBQAQ==" };
  const helper = { entry_id: "helper", title: "Desk", revision: "after", devices: [{ ...editor._data }] };
  const calls = [];
  hass.callWS = async msg => {
    calls.push(msg);
    if (msg.type !== "broadlink_ir_mapper/save_device") throw new Error("List is offline");
    return { entry_id: helper.entry_id, revision: helper.revision, helper };
  };
  click("Save and add another");
  await tick();
  assert.deepEqual(calls.map(call => call.type), ["broadlink_ir_mapper/save_device"]);
  assert.equal(editor._entry.revision, "after");
  assert.equal(editor._data.name, "");
  assert.equal(editor._data.broadlink_remote, "remote.test");
  assert.notEqual(editor._requestId, previousRequest);
});

test("changing the remote in a new draft cannot strand confirmed learned commands", async () => {
  const { editor, hass, settings, click } = await setupDeviceEditor();
  hass.callWS = async () => ({ device: "captured", command: "on" });
  settings();
  click("Learn commands");
  editor.shadowRoot.querySelector(".remote-command").click();
  await tick();
  click("Yes, keep command");
  click("Settings");
  const picker = editor.shadowRoot.querySelector("ha-form").schema
    .find(field => field.name === "broadlink_remote");
  assert.equal(picker.disabled, true);
  settings("remote.replacement");
  assert.equal(editor._data.broadlink_remote, "remote.test");
});

test("rerendering an invalid custom color does not re-enable learning", async () => {
  const { editor, window, hass, settings, click } = await setupDeviceEditor();
  const calls = [];
  hass.callWS = async msg => { calls.push(msg); };
  settings();
  click("Learn commands");
  click("Add custom color");
  const name = editor.shadowRoot.querySelector("ha-textfield");
  name.value = "Custom";
  name.dispatchEvent(new window.Event("input"));
  click("Add command");
  const hex = editor.shadowRoot.querySelector("ha-textfield");
  hex.value = "#invalid";
  hex.dispatchEvent(new window.Event("input"));
  editor.render();
  assert.equal(editor.shadowRoot.querySelector("ha-textfield").invalid, true);
  click("Learn command");
  await tick();
  assert.deepEqual(calls, []);
});

test("cancelling an IR brightness draft applies deferred state and never sends a command", async () => {
  const { card, hass, window, calls } = await setup();
  const slider = card.shadowRoot.querySelector("input");
  slider.value = 160;
  slider.dispatchEvent(new window.Event("input"));
  hass.states["light.ir"].attributes.brightness = 200;
  card.hass = hass;
  assert.equal(card.shadowRoot.querySelector("input"), slider);
  slider.dispatchEvent(new window.Event("pointercancel"));
  assert.equal(Number(card.shadowRoot.querySelector("input").value), 200);
  assert.deepEqual(calls, []);
});

test("an unavailable remote interrupts brightness editing immediately", async () => {
  const { card, hass, window, calls } = await setup();
  const slider = card.shadowRoot.querySelector("input");
  slider.value = 160;
  slider.dispatchEvent(new window.Event("input"));
  hass.states["remote.test"].state = "unavailable";
  card.hass = hass;
  assert.equal(card.shadowRoot.querySelector("input").disabled, true);
  slider.dispatchEvent(new window.Event("change"));
  await tick();
  assert.equal(calls.length, 0);
});

test("changing a card target prevents a retry from sending to a different light", async () => {
  const { card, hass, calls } = await setup({ fail: true });
  card.shadowRoot.querySelector(".effect").click();
  await tick();
  const retry = card.shadowRoot.querySelector('[role="alert"] button');
  assert.ok(retry);
  hass.states["light.other"] = { ...hass.states["light.ir"], entity_id: "light.other" };
  card.setConfig({ entity: "light.other" });
  const hasError = Boolean(card.shadowRoot.querySelector('[role="alert"]'));
  retry.click();
  await tick();
  assert.equal(hasError, false);
  assert.deepEqual(calls.map(call => call[2].entity_id), ["light.ir"]);
});
