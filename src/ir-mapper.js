import "./device-editor.js";
import messages from "./translations/en.json";
import { localize, haContext } from "@ha-plus/ui";
const t = (key, values) => localize(haContext(), messages, key, values);

import { appFooter, controlStyles, el as node, colorSwatch, button, icon, notice, panelHeader, iconButton, overflowMenu, integrationUrl, navigate, showMoreInfo, showToast, applyPreferences, formatNumber, loadNativeSlider, loadNativeComponents, collectionLayoutStyles, collectionCreateButton, nativeSlider } from "@ha-plus/ui";

/* HA+ IR: one theme-aware control surface shared by the panel and dashboard. */
const manageUrl = "/config/integrations/integration/broadlink_ir_mapper";
const addUrl = "/ha-plus-ir?setup=1";
const devices = (hass) =>
	Object.values(hass?.states || {}).filter((s) => s.attributes?.ir_mapper);

class IRCard extends HTMLElement {
  _t(key, values) { return localize(this._hass, messages, key, values); }

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		this._busy = false;
		this._editing = false;
	}
	setConfig(config) {
		this._config = { ...config };
		this.render();
	}
	set hass(value) {
		this._hass = value;
        applyPreferences(this, value);
        if (value.connection && !this._nativeLoading && !this._nativeReady) {
          this._nativeLoading = true;
          loadNativeSlider(this).then(() => { this._nativeReady = true; this._uiError = undefined; this.render(); })
            .catch(error => { this._uiError = error.message; this.render(); })
            .finally(() => { this._nativeLoading = false; });
        }
		const entity =
			value.states[this._config?.entity || devices(value)[0]?.entity_id];
		const signature = JSON.stringify([
			entity,
			value.states[entity?.attributes.ir_remote]?.state,
			value.user?.is_admin,
            value.locale,
		]);
		if (!this._editing && signature !== this._signature) {
			this._signature = signature;
			this.render();
		}
	}
	getCardSize() {
		return 5;
	}
	static getStubConfig(hass) {
		return { entity: devices(hass)[0]?.entity_id || "" };
	}
	static getConfigElement() {
		return document.createElement("ha-plus-ir-card-editor");
	}
	_button(text, action, cls) {
        const control = button(text, action, this._busy, cls);
        control.dataset.focus = cls || text;

		return control;
	}
	async _run(domain, service, data = {}) {
		if (this._busy) return;
		const focus = this.shadowRoot.activeElement?.dataset.focus;
		this._error = null;
		this._busy = true;
		this.render();
		try {
			await this._hass.callService(domain, service, {
				entity_id: this._entityId,
				...data,
			});
            this._retry = undefined;
            showToast(this, this._t("command_sent"));
		} catch (err) {
            this._retry = () => this._run(domain, service, data);
			this._error =
				err?.message || this._t("command_failed_check_the_broadlink_remote_and_retry");
		} finally {
			this._busy = false;
			this.render();
			if (focus)
				[...this.shadowRoot.querySelectorAll("[data-focus]")]
					.find((el) => el.dataset.focus === focus)
					?.focus();
		}
	}
	render() {
		if (!this._hass || !this._config) return;
		const entityId = this._config.entity || devices(this._hass)[0]?.entity_id;
		this._entityId = entityId;
		const state = this._hass.states[entityId];
		this.shadowRoot.replaceChildren(node("style", controlStyles));
		const surface = node("ha-card", undefined, "surface");
		this.shadowRoot.append(surface);
		if (!state || !state.attributes.ir_mapper) {
			const empty = node("div", undefined, "empty");
			empty.append(
				node("h2", this._t("choose_an_ir_light")),
				node(
					"p",
					this._t("select_a_ha_ir_entity_in_the_card_editor_or_add_your_first_device"),
				),
			);
			const link = node("a", this._t("set_up_an_ir_light"));
			link.href = addUrl;
			empty.append(link);
			surface.append(empty);
			return;
		}
		const attr = state.attributes,
			on = state.state === "on";
		const remote = this._hass.states[attr.ir_remote];
		const unavailable =
			["unavailable", "unknown"].includes(state.state) ||
			!remote ||
			["off", "unavailable", "unknown"].includes(remote.state);
		const top = node("div", undefined, "top"),
			heading = node("div", undefined, "heading");
		const status = node("div", undefined, "status");
		status.append(
			node("span", undefined, `dot ${on && !unavailable ? "on" : ""}`),
			node(
				"span",
				unavailable
					? this._t("remote_unavailable")
					: this._busy
						? this._t("sending_command")
						: on
							? this._t("on_assumed_state")
							: this._t("off_assumed_state"),
			),
		);
		heading.append(
			node("h2", this._config.title || attr.friendly_name || entityId),
			status,
		);
		const powerLabel = on ? this._t("turn_off") : this._t("turn_on");
        const togglePower = () => this._run("light", on ? "turn_off" : "turn_on");
        const nativePower = Boolean(customElements.get("ha-icon-button"));
        const power = nativePower
          ? iconButton(powerLabel, "mdi:power", togglePower, this._busy || unavailable)
          : this._button(undefined, togglePower, `power ${on ? "on" : ""}`);
        power.dataset.focus = "power";
        power.setAttribute("aria-label", powerLabel);
        power.setAttribute("aria-pressed", String(on));
        power.disabled ||= unavailable;
        if (!nativePower) {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 24 24");
		svg.setAttribute("aria-hidden", "true");
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("fill", "currentColor");
		path.setAttribute(
			"d",
			"M11 2h2v10h-2zM6.3 4.9l1.4 1.4A7 7 0 1 0 16.3 6.3l1.4-1.4a9 9 0 1 1-11.4 0",
		);
		svg.append(path);
		power.append(svg);
        }
        const actions = [{ label: this._t("entity_details"), run: () => showMoreInfo(this, entityId) }];
        if (this._hass.user?.is_admin) actions.push({ label: this._t("integration_settings"), run: () => navigate(this, integrationUrl("broadlink_ir_mapper")) });
        top.append(heading, power, overflowMenu(actions));
		surface.append(top);
		if (attr.ir_dimmable) {
			const section = node("section", undefined, "controls"),
				label = node("label", undefined, "label");
			label.htmlFor = "brightness";
			label.append(
				node("span", this._t("brightness")),
				node(
					"span",
					this._t("estimated", { value1: Math.round(((attr.brightness || 0) / 255) * 100) }),
				),
			);
            const input = nativeSlider({
              label: this._t("brightness"), min: 1, max: 255, value: Number(attr.brightness || 255),
              disabled: this._busy || unavailable, hass: this._hass,
              preview: value => {
                this._editing = true;
                label.lastChild.textContent = this._t("release_to_send", { value1: formatNumber(this._hass, Math.round(value / 255 * 100)) });
              },
              change: value => {
                this._editing = false;
                this._run("light", "turn_on", { brightness: value });
              },
            });
            input.dataset.focus = "brightness";
            input.id = "brightness";
            input.addEventListener("blur", () => { this._editing = false; });
			section.append(
				label,
				input,
				node(
					"div",
					this._t("steps_ir_brightness_is_approximate", { value1: attr.ir_brightness_steps ?? "—" }),
					"hint",
				),
			);
			surface.append(section);
		}
		if (attr.ir_colors?.length) {
			const section = node("section", undefined, "controls"),
				swatches = node("div", undefined, "swatches");
			section.append(node("div", this._t("colors"), "label"), swatches);
			for (const color of attr.ir_colors) {
				const button = this._button(
					undefined,
					() => this._run("light", "turn_on", { rgb_color: color.rgb }),
					"swatch",
				);
				colorSwatch(button, color.rgb);
				button.dataset.focus = "color:" + color.name;
				button.title = color.name;
				button.setAttribute("aria-label", color.name);
				button.setAttribute(
					"aria-pressed",
					String(
						on &&
							!attr.effect &&
							JSON.stringify(color.rgb) === JSON.stringify(attr.rgb_color),
					),
				);
				button.disabled ||= unavailable;
				swatches.append(button);
			}
			surface.append(section);
		}
		if (attr.effect_list?.length) {
			const section = node("section", undefined, "controls"),
				effects = node("div", undefined, "effects");
			section.append(node("div", this._t("effects"), "label"), effects);
			for (const effect of attr.effect_list) {
				const button = this._button(
					effect,
					() => this._run("light", "turn_on", { effect }),
					"effect",
				);
				button.dataset.focus = "effect:" + effect;
				button.setAttribute(
					"aria-pressed",
					String(on && attr.effect === effect),
				);
				button.disabled ||= unavailable;
				effects.append(button);
			}
			surface.append(section);
		}
        const error = this._uiError || this._error || attr.ir_last_error;
		if (error) {
			const message = notice(error, "error");
            if (this._retry && !unavailable) message.append(button(this._t("common.retry"), this._retry, this._busy));
			surface.append(message);
		}
		const footer = node("div", undefined, "footer");
		if (attr.ir_can_resynchronize) {
			const sync = this._button(this._t("resync_to_full_brightness"), () =>
				this._run("broadlink_ir_mapper", "resynchronize"),
			);
			sync.disabled ||= unavailable;
			footer.append(sync);
		}
		if (this._hass.user?.is_admin) {
			const link = node("a", this._t("device_settings"));
			link.href = attr.ir_device_id ? `/ha-plus-ir?device=${encodeURIComponent(attr.ir_device_id)}` : manageUrl;
			footer.append(link);
		}
		surface.append(footer);
	}
}

class IRPanel extends HTMLElement {
  _t(key, values) { return localize(this._hass, messages, key, values); }

  set panel(value) {
    this._panel = value;
    const version = this.shadowRoot.querySelector("[data-version]");
    if (version) version.textContent = value?.config?.version ? `v${value.config.version}` : "";
  }
  set narrow(value) {
    this._narrow = value;
    const menu = this.shadowRoot?.querySelector("ha-menu-button");
    if (menu) menu.narrow = value;
  }

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}
	set hass(value) {
        this._hass = value;
        applyPreferences(this, value);
        if (this._editor) { this._editor._hass = value; return; }
        const menu = this.shadowRoot.querySelector("ha-menu-button");
        if (menu) menu.hass = value;
		if (!this._built) {
			this._built = true;
			this.build();
            const params = new URLSearchParams(window.location?.search || "");
            if (value.user?.is_admin && (params.has("setup") || params.has("device"))) {
              this._openEditor(params.get("device") || undefined);
            }
		}
		const states = devices(value),
			ids = states
				.map((s) => s.entity_id)
				.sort()
				.join(",");
		if (ids !== this._ids) {
			this._ids = ids;
			this._grid.replaceChildren();
			for (const state of states) {
				const card = document.createElement("ha-plus-ir-card");
				card.setConfig({ entity: state.entity_id });
                const item = node("section");
                item.append(card);
                if (value.user?.is_admin) item.append(button("Edit commands", () => this._openEditor(state.attributes.ir_device_id)));
				this._grid.append(item);
			}
		}
		this._empty.hidden = states.length > 0;
		this._count.textContent = this._t("local_control", { value1: states.length, value2: states.length === 1 ? "device" : "devices" });
		for (const card of this._grid.querySelectorAll("ha-plus-ir-card")) card.hass = value;
		this._add.hidden = !value.user?.is_admin;
	}
    async _openEditor(deviceId) {
      if (!this._hass.user?.is_admin) return;
      try {
        await loadNativeComponents(this);
        const helpers = await this._hass.callWS({ type: "broadlink_ir_mapper/devices" });
        const entry = helpers.find(entry => entry.devices.some(device => device.unique_id === deviceId));
        const device = entry?.devices.find(device => device.unique_id === deviceId);
        if (deviceId && !device) throw new Error("This light is managed in YAML. Edit its YAML configuration to change commands.");
        const editor = document.createElement("ha-plus-ir-device-editor");
        this._editor = editor;
        this._main.replaceChildren(editor);
        await editor.configure(this._hass, helpers, device ? { entry, device } : undefined, () => {
          this._editor = undefined;
          if (window.location?.search) window.history.replaceState(null, "", window.location.pathname);
          this._ids = undefined;
          this.shadowRoot.replaceChildren();
          this.build();
          this.hass = this._hass;
        });
      } catch (error) {
        this._main.prepend(notice(error.message || "Could not open device setup", "error"));
      }
    }
	build() {
		this.shadowRoot.append(node("style", controlStyles + collectionLayoutStyles));
        const add = collectionCreateButton("Add Device", () => this._openEditor());
        this._add = add;
        const header = panelHeader("HA+ IR Mapper", { hass: this._hass, narrow: this._narrow,
          domain: "broadlink_ir_mapper", iconUrl: "/broadlink_ir_mapper/icon.png",
          onRefresh: () => { this._ids = undefined; this.hass = this._hass; } });
        this._count = node("p", "", "ha-plus-muted");
		const main = node("main");
        this._main = main;
		main.append(
			node("p", this._t("your_remotes_made_simple"), "eyebrow"),
			node(
				"p",
				this._t("power_colors_and_effects_without_reaching_for_the_remote_ir_devices_report_assumed_st"),
				"intro",
			),
		);
		this._empty = node("section", undefined, "surface empty");
		this._empty.append(
			node("h2", this._t("bring_your_ir_lights_into_ha")),
			node(
				"p",
				this._t("add_a_device_choose_your_broadlink_remote_and_learn_its_buttons_no_yaml_or_copied_cod"),
			),
		);
		this._grid = node("div", undefined, "grid");
		main.append(this._count, add, this._empty, this._grid);
		const body = node("div", undefined, "ha-plus-page-body");
        body.append(main, appFooter({
          githubUrl: "https://github.com/zvikarp/ha-plus-ir-mapper",
          documentationUrl: "https://github.com/zvikarp/ha-plus-ir-mapper#readme",
          version: this._panel?.config?.version,
        }));
        this.shadowRoot.append(header, body);
	}
}
class IREditor extends HTMLElement {
  _t(key, values) { return localize(this._hass, messages, key, values); }

	setConfig(config) {
		this._config = config;
		this.render();
	}
	set hass(value) {
		this._hass = value;
		this.render();
	}
	render() {
		if (!this._hass || !this._config) return;
		this.replaceChildren();
		const picker = document.createElement("ha-entity-picker");
		picker.hass = this._hass;
		picker.label = "HA+ IR light";
		picker.value = this._config.entity || "";
		picker.includeDomains = ["light"];
		picker.entityFilter = (e) =>
			Boolean(this._hass.states[e.entity_id]?.attributes.ir_mapper);
		picker.addEventListener("value-changed", (e) => {
			if (!e.detail.value) return;
			this._config = { ...this._config, entity: e.detail.value };
			this.dispatchEvent(
				new CustomEvent("config-changed", {
					detail: { config: this._config },
					bubbles: true,
					composed: true,
				}),
			);
		});
		this.append(picker);
	}
}
customElements.define("ha-plus-ir-card", IRCard);
customElements.define("ha-plus-ir-panel", IRPanel);
customElements.define("ha-plus-ir-card-editor", IREditor);
window.customCards = window.customCards || [];
window.customCards.push({
	type: "ha-plus-ir-card",
	name: "HA+ IR",
	description:
		t("automatic_ir_presets_effects_brightness_and_resynchronization"),
	preview: true,
});
