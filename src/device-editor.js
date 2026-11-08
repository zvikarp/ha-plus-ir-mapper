import {
  el, button, icon, notice, nativeForm, loadNativeComponents, nativeTextField,
  remoteEditorStyles, tabStyles, tabs, showToast,
} from "@ha-plus/ui";

export const defaultColors = [
  ["Red", "#ff0000"], ["Green", "#00ff00"], ["Blue", "#0000ff"], ["White", "#ffffff"],
  ["Orange", "#ff8000"], ["Lime", "#80ff00"], ["Sky blue", "#0080ff"], ["Warm white", "#ffddaa"],
  ["Amber", "#ffbf00"], ["Cyan", "#00ffff"], ["Purple", "#8000ff"], ["Cool white", "#ddeeff"],
  ["Yellow", "#ffff00"], ["Teal", "#008080"], ["Pink", "#ff0080"], ["Magenta", "#ff00ff"],
];
const standardCommands = [
  ["power_on", "Power on", "mdi:power"], ["power_off", "Power off", "mdi:power-off"],
  ["brightness_up", "Brightness up", "mdi:brightness-7"], ["brightness_down", "Brightness down", "mdi:brightness-5"],
];
export const hexToRgb = hex => /^#[0-9a-f]{6}$/i.test(hex)
  ? hex.slice(1).match(/../g).map(value => parseInt(value, 16)) : undefined;
const rgbToHex = rgb => "#" + rgb.map(value => value.toString(16).padStart(2, "0")).join("");
const emptyDevice = () => ({ name: "", broadlink_remote: "", brightness_steps: 10, ir_codes: {}, colors: [], effects: [] });

export class IRDeviceEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._tab = "settings";
  }
  async configure(hass, helpers, selected, close) {
    this._hass = hass;
    this._helpers = helpers;
    this._entry = selected?.entry;
    this._deviceId = selected?.device.unique_id;
    this._data = selected ? structuredClone(selected.device) : emptyDevice();
    this._requestId = crypto.randomUUID();
    this._close = close;
    this.render();
    try {
      await loadNativeComponents(this);
      this._ready = true;
    } catch (error) {
      this._error = error.message;
    }
    this.render();
  }
  _call(action, data = {}) {
    return this._hass.callWS({ type: `broadlink_ir_mapper/${action}`, ...data });
  }
  async _run(action) {
    if (this._busy) return;
    this._busy = true;
    this._error = undefined;
    this.render();
    try { await action(); }
    catch (error) { this._error = error.message || "The operation failed. Please retry."; }
    finally { this._busy = false; this.render(); }
  }
  _validSettings() {
    if (!this._data.name.trim() || !this._data.broadlink_remote) {
      this._error = "Enter a device name and choose a BroadLink remote on the Settings tab.";
      return false;
    }
    return true;
  }
  _commands() {
    const commands = standardCommands.map(([key, name, symbol]) => ({
      key, name, symbol, kind: "ir_codes", ref: this._data.ir_codes[key],
      required: key === "power_on" || key === "power_off",
    }));
    const colors = defaultColors.map(([name, hex]) => ({ name, rgb: hexToRgb(hex) }));
    for (const saved of this._data.colors) {
      const preset = colors.find(color => color.name === saved.name);
      if (preset) Object.assign(preset, saved);
      else colors.push(saved);
    }
    commands.push(...colors.map(color => ({ ...color, key: `color:${color.name}`, kind: "colors", ref: color.ir_code })));
    const effects = ["Flash", "Strobe", "Fade", "Smooth"].map(name => ({ name }));
    for (const saved of this._data.effects) {
      const preset = effects.find(effect => effect.name === saved.name);
      if (preset) Object.assign(preset, saved);
      else effects.push(saved);
    }
    commands.push(...effects.map(effect => ({ ...effect, key: `effect:${effect.name}`, kind: "effects", ref: effect.ir_code, symbol: "mdi:lightbulb-auto" })));
    return commands;
  }
  _commit(command, ref) {
    if (command.kind === "ir_codes") this._data.ir_codes[command.key] = ref;
    else {
      this._data[command.kind] = this._data[command.kind].filter(item => item.name !== command.name);
      const item = { name: command.name, ir_code: ref };
      if (command.kind === "colors") item.rgb = command.rgb;
      this._data[command.kind].push(item);
    }
    command.ref = ref;
    this._pending = undefined;
    this.render();
  }
  _learn(command) {
    if (!this._validSettings()) { this.render(); return; }
    this._selected = command;
    this._pending = undefined;
    this._run(async () => {
      const ref = await this._call("learn", { remote: this._data.broadlink_remote });
      this._pending = { command, ref };
    });
  }
  _save(another) {
    if (this._invalidHex) {
      this._error = "Enter a six-digit color hex value, such as #ff8000.";
      this._tab = "commands";
      this.render();
      return;
    }
    if (!this._validSettings()) { this._tab = "settings"; this.render(); return; }
    if (!this._data.ir_codes.power_on || !this._data.ir_codes.power_off) {
      this._error = "Learn Power on and Power off before saving. Other commands are optional.";
      this._tab = "commands";
      this.render();
      return;
    }
    this._run(async () => {
      const result = await this._call("save_device", {
        definition: this._data, request_id: this._requestId,
        ...(this._entry ? { entry_id: this._entry.entry_id, revision: this._entry.revision } : {}),
        ...(this._deviceId ? { device_id: this._deviceId } : {}),
      });
      showToast(this, "IR light saved");
      if (!another) { this._close(); return; }
      this._helpers = await this._call("devices");
      this._entry = this._helpers.find(entry => entry.entry_id === result.entry_id);
      const remote = this._data.broadlink_remote;
      this._data = { ...emptyDevice(), broadlink_remote: remote };
      this._requestId = crypto.randomUUID();
      this._deviceId = undefined;
      this._selected = this._pending = undefined;
      this._tab = "settings";
    });
  }
  _settings() {
    const form = nativeForm(this._hass, [
      { name: "name", label: "Device name", required: true, selector: { text: {} } },
      { name: "broadlink_remote", label: "BroadLink remote", required: true, disabled: Boolean(this._deviceId), selector: { entity: { domain: "remote", integration: "broadlink" } } },
      { name: "brightness_steps", label: "Brightness steps", helper: "Number of brightness button presses from minimum to maximum.", required: true, selector: { number: { min: 1, max: 100, step: 1, mode: "box" } } },
      ...(!this._deviceId ? [{ name: "helper", label: "Save in helper", selector: { select: { options: [
        { value: "new", label: "Create a new helper" },
        ...this._helpers.map(entry => ({ value: entry.entry_id, label: `${entry.title} (${entry.devices.length} ${entry.devices.length === 1 ? "light" : "lights"})` })),
      ] } } }] : []),
    ], { ...this._data, helper: this._entry?.entry_id || "new" }, values => {
      const { helper, ...fields } = values;
      Object.assign(this._data, fields);
      if (!this._deviceId) this._entry = this._helpers.find(entry => entry.entry_id === helper);
    });
    form.disabled = this._busy;
    return form;
  }
  _setColor(command, rgb) {
    command.rgb = rgb;
    const saved = this._data.colors.find(color => color.name === command.name);
    if (saved) saved.rgb = rgb;
  }
  _details() {
    const command = this._selected;
    const details = el("section", undefined, "remote-command-details");
    details.append(el("h3", command.name));
    if (command.kind === "colors") {
      const currentHex = rgbToHex(command.rgb);
      const palette = nativeForm(this._hass, [{
        name: "preset", label: "Default color", selector: { select: { options: [
          ...defaultColors.map(([name, hex]) => ({ label: name, value: hex })),
          { label: "Custom color", value: "custom" },
        ] } },
      }], { preset: defaultColors.some(([, hex]) => hex === currentHex) ? currentHex : "custom" }, values => {
        if (values.preset === "custom") return;
        this._setColor(command, hexToRgb(values.preset));
        command.hex = values.preset;
        this._hex.value = values.preset;
        this._invalidHex = false;
        this._hex.invalid = false;
        learn.disabled = this._busy;
      });
      const hex = nativeTextField("Custom color hex (#RRGGBB)", command.hex ?? rgbToHex(command.rgb), value => {
        const rgb = hexToRgb(value);
        hex.invalid = !rgb;
        command.hex = value;
        if (rgb) this._setColor(command, rgb);
        this._invalidHex = !rgb;
        palette.data = { preset: defaultColors.some(([, hex]) => hex.toLowerCase() === value.toLowerCase()) ? value.toLowerCase() : "custom" };
        learn.disabled = this._busy || !rgb;
      });
      this._hex = hex;
      hex.disabled = this._busy;
      hex.invalid = Boolean(this._invalidHex);
      palette.disabled = this._busy;
      details.append(palette, hex);
    }
    const actions = el("div", undefined, "remote-editor-actions");
    const learn = button(command.ref ? "Replace command" : "Learn command", () => this._learn(command), this._busy, "primary");
    actions.append(learn);
    if (command.ref) {
      actions.append(button("Test command", () => this._run(() => this._hass.callService("remote", "send_command", {
        entity_id: this._data.broadlink_remote,
        ...(typeof command.ref === "string" ? { command: "b64:" + command.ref.replace(/^b64:/, "") } : command.ref),
      })), this._busy));
      actions.append(button("Remove command", () => {
        if (command.kind === "ir_codes") delete this._data.ir_codes[command.key];
        else this._data[command.kind] = this._data[command.kind].filter(item => item.name !== command.name);
        this._selected = undefined;
        this.render();
      }, this._busy));
    }
    details.append(actions);
    return details;
  }
  _addOptional(kind) {
    this._adding = kind;
    this._optionalName = "";
    this.render();
  }
  _commandPage() {
    const page = el("div", undefined, "remote-editor");
    page.append(el("p", "Click a command to learn it. Power on and Power off are required. Learn only the optional buttons your remote has."));
    if (this._busy) page.append(notice("Point the physical remote at your BroadLink and press the selected button. Learning and testing can take up to 65 seconds.", "status"));
    if (this._pending) {
      const confirmation = notice(`Did ${this._pending.command.name} work when the test command was sent?`, "status");
      confirmation.append(button("Yes, keep command", () => this._commit(this._pending.command, this._pending.ref)), button("Retry", () => this._learn(this._pending.command)), button("Discard", () => { this._pending = undefined; this.render(); }));
      page.append(confirmation);
    }
    if (this._selected && !this._pending) page.append(this._details());
    const grid = el("div", undefined, "remote-command-grid");
    grid.setAttribute("aria-label", "Remote commands");
    for (const command of this._commands()) {
      const tile = el("button", undefined, "remote-command");
      tile.type = "button";
      tile.disabled = this._busy || Boolean(this._pending);
      tile.dataset.required = String(Boolean(command.required));
      tile.dataset.learned = String(Boolean(command.ref));
      tile.setAttribute("aria-pressed", String(command.key === this._selected?.key));
      if (command.rgb) {
        const swatch = el("span", undefined, "remote-command-color");
        swatch.style.backgroundColor = rgbToHex(command.rgb);
        tile.append(swatch);
      } else tile.append(icon(command.symbol));
      tile.append(el("span", command.name), el("small", `${command.required ? "Required" : "Optional"} · ${command.ref ? "Learned" : "Not learned"}`));
      tile.addEventListener("click", () => {
        this._invalidHex = false;
        this._selected = command;
        if (command.ref) this.render();
        else this._learn(command);
      });
      grid.append(tile);
    }
    page.append(grid);
    if (this._adding) {
      const kind = this._adding;
      const name = nativeTextField("Command name", this._optionalName, value => { this._optionalName = value; });
      page.append(name, button("Add command", () => {
        const name = this._optionalName.trim();
        if (!name) { this._error = "Enter a command name."; this.render(); return; }
        const key = `${kind === "colors" ? "color" : "effect"}:${name}`;
        if (this._commands().some(command => command.key === key)) { this._error = "Choose a different command name."; this.render(); return; }
        this._selected = { kind, key, name, ...(kind === "colors" ? { rgb: [255, 0, 0] } : {}) };
        this._adding = undefined;
        this.render();
      }, this._busy));
    } else {
      const actions = el("div", undefined, "remote-editor-actions");
      actions.append(button("Add custom color", () => this._addOptional("colors"), this._busy || Boolean(this._pending)), button("Add effect", () => this._addOptional("effects"), this._busy || Boolean(this._pending)));
      page.append(actions);
    }
    return page;
  }
  render() {
    if (!this._data) return;
    const page = el("section", undefined, "remote-editor");
    page.append(el("h2", this._deviceId ? `Edit ${this._data.name}` : "Add IR light"));
    const tabBar = tabs([
      { value: "settings", label: "Settings" }, { value: "commands", label: "Commands" },
    ], this._tab, value => {
      if (this._busy || this._pending) return;
      this._tab = value;
      this.render();
    }, "IR light setup");
    for (const tab of tabBar.querySelectorAll("[role=tab]")) tab.disabled = this._busy || Boolean(this._pending);
    page.append(tabBar);
    if (this._error) page.append(notice(this._error, "error"));
    if (this._ready) page.append(this._tab === "settings" ? this._settings() : this._commandPage());
    else page.append(el("p", "Loading Home Assistant controls…"));
    const actions = el("div", undefined, "remote-editor-actions");
    actions.append(button("Cancel", () => this._close(), this._busy));
    if (this._tab === "settings") actions.append(button("Learn commands", () => {
      if (this._validSettings()) this._tab = "commands";
      this.render();
    }, this._busy, "primary"));
    actions.append(button("Save and add another", () => this._save(true), this._busy || Boolean(this._pending)), button("Save", () => this._save(false), this._busy || Boolean(this._pending), "primary"));
    page.append(actions);
    this.shadowRoot.replaceChildren(el("style", remoteEditorStyles + tabStyles), page);
  }
}
customElements.define("ha-plus-ir-device-editor", IRDeviceEditor);
