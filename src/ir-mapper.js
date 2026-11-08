import messages from "./translations/en.json";
import { localize, haContext } from "@ha-plus/ui";
const t = (key, values) => localize(haContext(), messages, key, values);

import { controlStyles, el as node, colorSwatch, button, icon, notice, panelHeader, iconButton, overflowMenu, integrationUrl, navigate, showMoreInfo, showToast, applyPreferences, formatNumber, loadNativeSlider, nativeSlider } from "@ha-plus/ui";

/* HA+ IR: one theme-aware control surface shared by the panel and dashboard. */
const manageUrl = "/config/integrations/integration/broadlink_ir_mapper";
const addUrl = "/config/integrations/dashboard/add?domain=broadlink_ir_mapper";
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
			link.href = manageUrl;
			footer.append(link);
		}
		surface.append(footer);
	}
}

class IRPanel extends HTMLElement {
  _t(key, values) { return localize(this._hass, messages, key, values); }

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
        const menu = this.shadowRoot.querySelector("ha-menu-button");
        if (menu) menu.hass = value;
		if (!this._built) {
			this._built = true;
			this.build();
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
				this._grid.append(card);
			}
		}
		this._empty.hidden = states.length > 0;
		this._count.textContent = this._t("local_control", { value1: states.length, value2: states.length === 1 ? "device" : "devices" });
		for (const card of this._grid.children) card.hass = value;
		this._add.hidden = !value.user?.is_admin;
	}
	build() {
		this.shadowRoot.append(node("style", controlStyles));
        const add = node("a", this._t("add_device"), "primary action-link");
        add.href = integrationUrl("broadlink_ir_mapper", true);
        this._add = add;
        const header = panelHeader("HA+ IR", { hass: this._hass, narrow: this._narrow, actions: [add] });
        this._count = node("p", "", "ha-plus-muted");
        header.querySelector(".ha-plus-header-heading").append(this._count);
		const main = node("main");
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
		main.append(this._empty, this._grid);
		this.shadowRoot.append(header, main);
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

window.customIcons = window.customIcons || {};
window.customIcons["ha-plus-ir"] = {
	getIcon: async (name) =>
		name === "logo"
			? {
					path: "M486.983728,109.999628L486.983728,401.999167C486.983728,448.360304 449.344523,485.999328 402.983597,485.999328L110.983547,485.999328C64.622622,485.999328 26.983416,448.360304 26.983416,401.999167L26.983416,109.999628C26.983416,63.638491 64.622622,25.999467 110.983547,25.999467L402.983597,25.999467C449.344523,25.999467 486.983728,63.638491 486.983728,109.999628ZM203.646977,153.172678L85.650716,271.168815C55.389558,301.430480 55.389558,350.567689 85.650716,380.829354L132.153426,427.332080C162.415240,457.593745 211.552123,457.593745 241.813937,427.332080L359.810199,309.335943C390.072012,279.074278 390.072012,229.937069 359.810199,199.675404L313.307488,153.172678C283.046331,122.911013 233.908791,122.911013 203.646977,153.172678ZM319.921476,115.645046C317.786830,122.807673 321.868388,130.356146 329.030477,132.490709C339.847458,135.715703 350.562038,142.060339 359.741932,151.240768C368.922482,160.421198 375.267341,171.134943 378.492284,181.952698C380.626929,189.114655 388.175644,193.196561 395.337733,191.061327C402.500479,188.926094 406.582037,181.378292 404.446735,174.215665C400.031721,159.403909 391.463602,144.660599 378.892694,132.090101C366.322442,119.519602 351.578817,110.951156 336.767582,106.536417C329.604836,104.401183 322.056777,108.483089 319.921476,115.645046ZM332.780548,69.934142C330.645902,77.096769 334.727460,84.644571 341.890206,86.779804C359.894219,92.146742 377.747915,102.673939 393.028483,117.954748C408.309051,133.234886 418.836555,151.088444 424.203363,169.092984C426.338008,176.255611 433.886723,180.336846 441.048813,178.202284C448.211559,176.067050 452.293116,168.518578 450.157814,161.356621C443.600279,139.357410 430.849514,117.474287 412.179245,98.803409C393.508975,80.133203 371.625579,67.382867 349.626654,60.824842C342.463908,58.690279 334.915849,62.771514 332.780548,69.934142ZM271.081989,185.999715C271.081989,205.506160 274.111153,214.011755 287.344776,227.245167C294.480117,234.380545 300.389142,238.371353 306.332512,240.487868C311.542564,242.343239 317.364828,243.038403 326.983732,243.038403C345.781389,243.038403 345.781389,268.960973 326.983732,268.960973C317.343396,268.960973 311.528816,269.653718 306.327054,271.506293C300.393471,273.619503 294.489842,277.609258 287.344554,284.754431C274.125585,297.972850 271.081989,306.519798 271.081989,325.999661C271.081989,343.281375 242.885504,343.281375 242.885504,325.999661C242.885504,306.493216 239.856340,297.987621 226.622716,284.754209C219.487375,277.618831 213.578351,273.628024 207.634980,271.511508C202.424929,269.656137 196.602665,268.960973 186.983761,268.960973C168.186104,268.960973 168.186104,243.038403 186.983761,243.038403C196.624097,243.038403 202.438677,242.345658 207.640438,240.493083C213.574021,238.379873 219.477651,234.390118 226.622939,227.244945C239.841908,214.026526 242.885504,205.479578 242.885504,185.999715C242.885504,168.718001 271.081989,168.718001 271.081989,185.999715ZM203.386906,342.629770C203.386906,360.873489 188.597447,375.662945 170.353725,375.662945C152.110003,375.662945 137.320544,360.873489 137.320544,342.629770C137.320544,324.386051 152.110003,309.596595 170.353725,309.596595C188.597447,309.596595 203.386906,324.386051 203.386906,342.629770Z",
					viewBox: "0 0 513 512",
				}
			: undefined,
};
