(() => {
  // src/translations/en.json
  var en_default = {
    command_failed_check_the_broadlink_remote_and_retry: "Command failed. Check the BroadLink remote and retry.",
    choose_an_ir_light: "Choose an IR light",
    select_a_ha_ir_entity_in_the_card_editor_or_add_your_first_device: "Select a HA+ IR entity in the card editor, or add your first device.",
    set_up_an_ir_light: "Set up an IR light",
    remote_unavailable: "Remote unavailable",
    sending_command: "Sending command\u2026",
    on_assumed_state: "On \xB7 Assumed state",
    off_assumed_state: "Off \xB7 Assumed state",
    turn_off: "Turn off",
    turn_on: "Turn on",
    entity_details: "Entity details",
    integration_settings: "Integration settings",
    brightness: "Brightness",
    estimated: "{value1}% \xB7 Estimated",
    release_to_send: "{value1}% \xB7 Release to send",
    steps_ir_brightness_is_approximate: "{value1} steps \xB7 IR brightness is approximate",
    colors: "Colors",
    effects: "Effects",
    "common.retry": "Retry",
    resync_to_full_brightness: "Resync to full brightness",
    device_settings: "Device settings \u2197",
    local_control: "{value1} {value2} \xB7 Local control",
    add_device: "Add device",
    your_remotes_made_simple: "Your remotes, made simple",
    power_colors_and_effects_without_reaching_for_the_remote_ir_devices_report_assumed_st: "Power, colors, and effects \u2014 without reaching for the remote. IR devices report assumed state.",
    bring_your_ir_lights_into_ha: "Bring your IR lights into HA+",
    add_a_device_choose_your_broadlink_remote_and_learn_its_buttons_no_yaml_or_copied_cod: "Add a device, choose your BroadLink remote, and learn its buttons. No YAML or copied codes needed.",
    automatic_ir_presets_effects_brightness_and_resynchronization: "Automatic IR presets, effects, brightness, and resynchronization",
    command_sent: "Command sent"
  };

  // node_modules/@ha-plus/ui/src/dom.js
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== void 0) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function icon(name) {
    const node = el("ha-icon");
    node.setAttribute("icon", name);
    return node;
  }
  function button(text, handler, disabled = false, className) {
    const registry = document.defaultView?.customElements;
    const native = registry?.get("ha-button") ? "ha-button" : registry?.get("mwc-button") ? "mwc-button" : "button";
    const node = el(native, text, className);
    node.type = "button";
    node.disabled = disabled;
    if (native === "ha-button") node.appearance = className?.split(" ").includes("primary") ? "accent" : "plain";
    if (native === "mwc-button") node.raised = Boolean(className?.split(" ").includes("primary"));
    node.addEventListener("click", () => {
      if (!node.disabled) handler();
    });
    return node;
  }

  // node_modules/@ha-plus/ui/src/native.js
  function iconButton(label, name, handler, disabled = false) {
    const node = el("ha-icon-button");
    node.label = label;
    node.setAttribute("aria-label", label);
    node.disabled = disabled;
    node.append(icon(name));
    node.addEventListener("click", () => {
      if (!node.disabled) handler();
    });
    return node;
  }
  function nativeForm(hass, schema, data, change) {
    const form = el("ha-form");
    form.hass = hass;
    form.schema = schema;
    form.data = data;
    form.computeLabel = (field) => field.label;
    form.computeHelper = (field) => field.helper;
    form.addEventListener("value-changed", (event) => {
      event.stopPropagation();
      form.data = event.detail.value;
      change(event.detail.value);
    });
    return form;
  }
  function nativeSlider({ label, value, min = 0, max = 100, step = 1, disabled = false, hass, preview, change }) {
    const native = Boolean(document.defaultView?.customElements.get("ha-control-slider"));
    const tag = native ? "ha-control-slider" : document.defaultView?.customElements.get("ha-slider") ? "ha-slider" : "input";
    const control = el(tag);
    if (tag === "input") control.type = "range";
    Object.assign(control, { min, max, step, value, disabled });
    control.label = label;
    control.locale = hass?.locale;
    control.setAttribute("aria-label", label);
    let committed = Number(value);
    const read = (event) => Number(event.detail?.value ?? control.value);
    control.addEventListener(native ? "slider-moved" : "input", (event) => {
      if (native && event.detail?.value == null) return;
      const next = read(event);
      if (!control.disabled && Number.isFinite(next)) preview?.(next);
    });
    control.addEventListener(native ? "value-changed" : "change", (event) => {
      const next = read(event);
      if (control.disabled || !Number.isFinite(next) || next < min || next > max || next === committed) return;
      committed = next;
      change(next);
    });
    return control;
  }

  // node_modules/@ha-plus/ui/src/styles.js
  var panelHeaderStyles = `
  .ha-plus-header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--header-height, 56px);
    min-height: var(--header-height, 56px);
    padding: 0 12px;
    box-sizing: border-box;
    font-family: var(--ha-font-family-body, var(--primary-font-family, Roboto, sans-serif));
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    background: var(--app-header-background-color, var(--primary-background-color, #fafafa));
    color: var(--app-header-text-color, var(--primary-text-color, #212121));
  }
  .ha-plus-header-heading { flex: 1; min-width: 0; }
  .ha-plus-header h1 { margin: 0; font-size: 20px; font-weight: 400; line-height: 24px; overflow-wrap: anywhere; }
  .ha-plus-header-icon { width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; }
  .ha-plus-header :is(ha-menu-button, ha-icon-button) { flex-shrink: 0; }
  @media (max-width: 480px) {
    .ha-plus-header { gap: 4px; padding-inline: 4px; }
    .ha-plus-header h1 { font-size: 18px; line-height: 22px; }
  }
`;
  var themeStyles = `${panelHeaderStyles}
  :host { display:block; color:var(--primary-text-color,#212121); font-family:var(--primary-font-family,var(--paper-font-body1_-_font-family,Roboto,sans-serif)); }
  *, *::before, *::after { box-sizing:border-box; }
  [hidden] { display:none !important; }
  a { color:var(--primary-color,#03a9f4); }
  ha-icon { flex-shrink:0; }
  button, input, select, textarea { font:inherit; }
  button { min-height:44px; padding:10px 16px; border:0; border-radius:var(--ha-button-border-radius,999px); background:var(--secondary-background-color,#f5f5f5); color:var(--primary-color,#03a9f4); cursor:pointer; font-weight:500; }
  button:hover { filter:brightness(.96); }
  button.primary { background:var(--primary-color,#03a9f4); color:var(--text-primary-color,#fff); }
  button.danger { color:var(--error-color,#db4437); }
  button:disabled { opacity:.5; cursor:default; }
  :is(button,input,select,textarea,a,summary,[tabindex]):focus-visible { outline:2px solid var(--primary-color,#03a9f4); outline-offset:3px; }
  .icon-button { display:grid; place-items:center; width:44px; height:44px; min-width:44px; padding:0; border-radius:50%; color:inherit; background:transparent; }
  .icon-button:hover { background:var(--secondary-background-color,#f5f5f5); }
  input:not([type=checkbox]):not([type=radio]), textarea { min-height:48px; border:1px solid var(--divider-color,#e0e0e0); border-radius:var(--ha-input-border-radius,14px); padding:10px 14px; color:var(--primary-text-color,#212121); background:var(--secondary-background-color,#f5f5f5); max-width:100%; }
  ha-card { display:block; background:var(--ha-card-background,var(--card-background-color,#fff)); color:var(--primary-text-color,#212121); border-radius:var(--ha-card-border-radius,12px); box-shadow:var(--ha-card-box-shadow,none); border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--divider-color,#e0e0e0)); }
  .field { position:relative; min-width:0; }
  .field-label { display:block; margin-bottom:8px; color:var(--secondary-text-color,#727272); font-size:14px; }
  .combobox { display:flex; align-items:center; gap:8px; width:100%; justify-content:space-between; text-align:start; border:1px solid var(--divider-color,#e0e0e0); border-radius:14px; color:var(--primary-text-color,#212121); min-height:48px; padding:10px 14px; }
  .combobox span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .listbox { position:absolute; z-index:10; inset-inline:0; top:100%; margin-top:4px; max-height:300px; overflow:auto; padding:6px; background:var(--card-background-color,#fff); border:1px solid var(--divider-color,#e0e0e0); border-radius:14px; box-shadow:var(--ha-card-box-shadow,0 4px 16px #0003); }
  .option { display:block; width:100%; text-align:start; border-radius:10px; background:transparent; color:var(--primary-text-color,#212121); white-space:normal; overflow-wrap:anywhere; }
  .option[aria-selected=true] { color:var(--primary-color,#03a9f4); background:var(--secondary-background-color,#f5f5f5); }
  .ha-plus-content { max-width:1000px; margin:auto; padding:24px; }
  .notice { padding:12px 16px; margin-bottom:16px; background:var(--secondary-background-color,#f5f5f5); border-radius:14px; overflow-wrap:anywhere; }
  .error { color:var(--error-color,#db4437); white-space:pre-wrap; }
  dialog { font:inherit; background:var(--ha-card-background,var(--card-background-color,#fff)); color:var(--primary-text-color,#212121); border:1px solid var(--divider-color,#e0e0e0); border-radius:var(--ha-dialog-border-radius,20px); padding:24px; width:420px; max-width:calc(100% - 32px); max-height:calc(100% - 32px); overflow:auto; }
  dialog::backdrop { background:#0008; }
  dialog h2 { margin:0 0 16px; font-size:1.3rem; }
  dialog p { white-space:pre-line; overflow-wrap:anywhere; }
  dialog form { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:12px; margin-top:24px; }
  @media(max-width:700px) { .ha-plus-content { padding:16px; } .ha-plus-header h1 { font-size:18px; } }
`;
  var nativeStyles = `
  .ha-plus-header-heading { flex: 1; min-width: 0; }
  .ha-plus-header-heading h1 { overflow-wrap: anywhere; }
  .ha-plus-header-heading p { margin: 4px 0 0; font-size: 12px; }
  .ha-plus-dialog-message { white-space: pre-line; overflow-wrap: anywhere; padding: 8px 24px; }
  .ha-plus-dialog-actions { display: flex; flex-wrap: wrap; justify-content: end; gap: 8px; }
  ha-alert.notice { padding: 0; background: transparent; }
  ha-form.field { min-width: 0; }
  ha-dialog { --mdc-dialog-min-width: min(420px, calc(100vw - 32px)); --mdc-dialog-max-width: 560px; }
`;
  var appStyles = `${themeStyles}${nativeStyles}
  :host {
    container-type: inline-size;
  }

  h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0 0 16px;
  }

  h3 {
    font-size: 16px;
    margin: 0;
  }

  p {
    line-height: 1.5;
  }

  section {
    margin-bottom: 24px;
  }

  details {
    margin-top: 16px;
  }

  summary {
    cursor: pointer;
    padding: 8px 0;
  }

  .ha-plus-muted,
  .ha-plus-message {
    color: var(--secondary-text-color, #727272);
    font-size: 14px;
    overflow-wrap: anywhere;
  }

  .ha-plus-message {
    align-self: center;
  }

  .ha-plus-padded-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .ha-plus-row,
  .ha-plus-chips,
  .ha-plus-card-actions,
  .ha-plus-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ha-plus-row h3 {
    flex: 1;
  }

  .ha-plus-chips {
    margin-top: 12px;
  }

  .ha-plus-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    padding: 7px 12px;
    border-radius: 999px;
    background: var(--secondary-background-color, #f5f5f5);
    border: 1px solid var(--divider-color, #e0e0e0);
    font-size: 13px;
    overflow-wrap: anywhere;
  }

  .ha-plus-chip.active {
    color: var(--primary-color, #03a9f4);
    background: var(--primary-color-light, var(--secondary-background-color, #f5f5f5));
    border-color: var(--primary-color, #03a9f4);
  }

  .ha-plus-chip ha-icon {
    --mdc-icon-size: 18px;
  }

  .ha-plus-form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
    align-items: end;
    gap: 12px;
  }


  .ha-plus-value {
    margin: 12px 0 4px;
    font-size: 20px;
    font-weight: 500;
  }

  .ha-plus-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 16px;
  }

  .ha-plus-card-grid > ha-card {
    margin: 0;
  }

  .ha-plus-detail-row {
    padding: 12px 0;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    overflow-wrap: anywhere;
  }

  .ha-plus-detail-row:last-child {
    border: 0;
  }

  .ha-plus-create {
    margin: 16px 0;
  }

  .ha-plus-create form {
    display: flex;
    align-items: end;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .ha-plus-compact-content {
    padding: 16px;
  }

  .ha-plus-compact .ha-plus-form-grid {
    grid-template-columns: 1fr;
  }

  .ha-plus-compact .ha-plus-card-grid {
    display: block;
  }

  .ha-plus-compact .ha-plus-group {
    margin-bottom: 12px;
    padding: 12px;
  }

  .ha-plus-detail-card {
    overflow: hidden;
  }

  .ha-plus-card-header {
    display: grid;
    align-items: center;
    cursor: pointer;
    gap: 16px;
    grid-template-columns: 64px minmax(0, 1fr);
    padding: 20px 20px 12px;
  }

  .ha-plus-card-header h2 {
    line-height: 1.3;
    margin-bottom: 4px;
    overflow-wrap: anywhere;
  }

  .ha-plus-card-header:focus-visible {
    outline-offset: -2px;
  }

  .ha-plus-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 50%;
    height: 64px;
    width: 64px;
    overflow: hidden;
  }

  .ha-plus-avatar img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  .ha-plus-avatar ha-icon {
    color: var(--primary-color, #03a9f4);
    --mdc-icon-size: 34px;
  }

  .ha-plus-status {
    font-weight: 500;
    text-transform: capitalize;
    overflow-wrap: anywhere;
  }

  [data-tone=success] {
    color: var(--success-color, #43a047);
  }

  [data-tone=warning] {
    color: var(--warning-color, #ff9800);
  }

  [data-tone=error] {
    color: var(--error-color, #db4437);
  }

  .ha-plus-description {
    color: var(--secondary-text-color, #727272);
    margin: 0;
    padding: 0 20px 16px;
    overflow-wrap: anywhere;
  }

  .ha-plus-stats {
    display: grid;
    gap: 1px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    background: var(--divider-color, #e0e0e0);
    border-block: 1px solid var(--divider-color, #e0e0e0);
  }

  .ha-plus-stat {
    display: grid;
    align-items: center;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 10px;
    min-height: 64px;
    padding: 10px 14px;
    border: 0;
    border-radius: 0;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
    text-align: start;
  }

  .ha-plus-stat:hover {
    background: var(--secondary-background-color, #f5f5f5);
  }

  .ha-plus-stat ha-icon {
    color: var(--state-icon-color, #44739e);
  }

  .ha-plus-stat-label {
    color: var(--secondary-text-color, #727272);
    display: block;
    font-size: 0.78rem;
  }

  .ha-plus-stat-value {
    display: block;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ha-plus-card-actions {
    padding: 16px 20px 20px;
  }

  .ha-plus-feedback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    max-width: 100%;
    position: relative;
    overflow: hidden;
  }

  button.ha-plus-feedback.success {
    background: var(--success-color, #43a047);
    opacity: 1;
    cursor: default;
  }

  .ha-plus-feedback.success::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: #fff6;
    animation: ha-plus-splash 600ms ease-out forwards;
  }

  .ha-plus-feedback.success ha-icon {
    animation: ha-plus-check-in 350ms ease-out;
  }

  .ha-plus-toolbar {
    gap: 12px;
    margin-bottom: 16px;
  }

  .ha-plus-toolbar button[aria-pressed=true] {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }

  .ha-plus-table {
    overflow-x: auto;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .ha-plus-table table {
    border-collapse: collapse;
    width: 100%;
    white-space: nowrap;
  }

  .ha-plus-table th,
  .ha-plus-table td {
    text-align: start;
    padding: 12px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }

  .ha-plus-table input[type=checkbox] {
    width: 20px;
    height: 20px;
    accent-color: var(--primary-color, #03a9f4);
    cursor: pointer;
  }

  .ha-plus-text-button {
    background: transparent;
    border: 0;
    padding: 4px;
    text-align: start;
  }

  @keyframes ha-plus-splash {
    from { transform: scale(0); opacity: 1; }
    to { transform: scale(2); opacity: 0; }
  }

  @keyframes ha-plus-check-in {
    from { transform: scale(0.4); }
    to { transform: scale(1); }
  }

  @media (max-width: 700px) {
    .ha-plus-form-grid {
      grid-template-columns: 1fr 1fr;
    }

    .ha-plus-form-grid .field:first-child,
    .ha-plus-form-grid .primary {
      grid-column: 1 / -1;
    }
  }

  @container (max-width: 420px) {
    .ha-plus-stats {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ha-plus-feedback.success::after,
    .ha-plus-feedback.success ha-icon {
      animation: none;
    }

    .ha-plus-feedback.success::after {
      display: none;
    }
  }
`;

  // node_modules/@ha-plus/ui/src/preferences.js
  function haContext() {
    if (typeof window === "undefined") return void 0;
    try {
      return window.parent?.document.querySelector("home-assistant")?.hass || window.document.querySelector("home-assistant")?.hass;
    } catch {
      return void 0;
    }
  }
  function preferences(hass = haContext()) {
    const locale = hass?.locale || {};
    const language = locale.language || hass?.language || "en";
    const numberLocales = { comma_decimal: "en-US", decimal_comma: "de-DE", space_comma: "sv-SE" };
    const numberLanguage = numberLocales[locale.number_format] || (locale.number_format === "system" && typeof navigator !== "undefined" ? navigator.language : language);
    const direction = hass?.translationMetadata?.translations?.[language]?.isRTL || /^(ar|fa|he|ur)(-|$)/i.test(language) ? "rtl" : "ltr";
    const dateLocales = { DMY: "en-GB", MDY: "en-US", YMD: "sv-SE" };
    const dateLanguage = dateLocales[locale.date_format] || (locale.date_format === "system" && typeof navigator !== "undefined" ? navigator.language : language);
    const timeLanguage = locale.time_format === "system" && typeof navigator !== "undefined" ? navigator.language : language;
    const languageHour12 = new Intl.DateTimeFormat(timeLanguage, { hour: "numeric" }).resolvedOptions().hour12;
    return {
      dateLanguage,
      language,
      direction,
      numberLanguage,
      useGrouping: locale.number_format !== "none",
      timeZone: locale.time_zone === "local" ? Intl.DateTimeFormat().resolvedOptions().timeZone : hass?.config?.time_zone,
      hour12: ["12", "am_pm"].includes(locale.time_format) ? true : ["24", "twenty_four"].includes(locale.time_format) ? false : languageHour12,
      unitSystem: { ...hass?.config?.unit_system }
    };
  }
  function applyPreferences(host, hass) {
    const value = preferences(hass);
    if (host.getAttribute("dir") !== value.direction) host.setAttribute("dir", value.direction);
    if (host.getAttribute("lang") !== value.language) host.setAttribute("lang", value.language);
    return value;
  }
  function formatNumber(hass, value, options = {}) {
    const settings = preferences(hass);
    return new Intl.NumberFormat(settings.numberLanguage, { useGrouping: settings.useGrouping, ...options }).format(value);
  }

  // node_modules/@ha-plus/ui/src/translations/en.json
  var en_default2 = {
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    refresh: "Refresh",
    loading: "Loading\u2026",
    retry: "Retry",
    settings: "Settings",
    yes: "Yes",
    no: "No",
    apply: "Apply",
    confirm: "Confirm",
    more_actions: "More actions",
    dashboard_load_failed: "Home Assistant's dashboard controls could not load. Reload and try again.",
    controls_load_failed: "Home Assistant's to-do controls could not load. Reload and try again.",
    component_load_failed: "Home Assistant could not load {component}. Reload and try again."
  };

  // node_modules/@ha-plus/ui/src/localize.js
  var nativeKeys = {
    save: "ui.common.save",
    cancel: "ui.common.cancel",
    close: "ui.common.close",
    delete: "ui.common.delete",
    edit: "ui.common.edit",
    add: "ui.common.add",
    refresh: "ui.common.refresh",
    loading: "ui.common.loading",
    retry: "ui.common.retry",
    yes: "ui.common.yes",
    no: "ui.common.no",
    apply: "ui.common.apply"
  };
  function localize(hass, messages, key, values = {}) {
    const shortKey = key.replace(/^common\./, "");
    const nativeKey = nativeKeys[shortKey];
    const native = nativeKey && hass?.localize?.(nativeKey);
    const message = native && native !== nativeKey ? native : messages[key] || en_default2[shortKey] || key;
    return String(message).replace(/\{([\w]+)\}/g, (match, name) => {
      if (!Object.hasOwn(values, name)) return match;
      return typeof values[name] === "number" ? formatNumber(hass, values[name]) : String(values[name]);
    });
  }

  // node_modules/@ha-plus/ui/src/ha-actions.js
  function showMoreInfo(host, entityId) {
    if (!/^[a-z_]+\.[a-z0-9_]+$/.test(entityId || "")) return false;
    const root = host || (() => {
      try {
        return window.parent.document.querySelector("home-assistant");
      } catch {
        return void 0;
      }
    })();
    if (!root) return false;
    const Event = root.ownerDocument.defaultView.CustomEvent;
    root.dispatchEvent(new Event("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
    return true;
  }
  function integrationUrl(domain, add = false) {
    if (!/^[a-z0-9_]+$/.test(domain)) throw new TypeError("Invalid integration domain");
    return add ? `/config/integrations/dashboard/add?domain=${domain}` : `/config/integrations/integration/${domain}`;
  }
  function showToast(host, message) {
    if (!host) {
      try {
        host = window.parent.document.querySelector("home-assistant");
      } catch {
        return false;
      }
    }
    if (!host) return false;
    const Event = host.ownerDocument.defaultView.CustomEvent;
    host.dispatchEvent(new Event("hass-notification", { bubbles: true, composed: true, detail: { message } }));
    return true;
  }
  function overflowMenu(actions, label = localize(haContext(), {}, "more_actions")) {
    const registry = document.defaultView?.customElements;
    if (registry?.get("ha-dropdown")) {
      const menu2 = el("ha-dropdown");
      const trigger2 = iconButton(label, "mdi:dots-vertical", () => {
      });
      trigger2.slot = "trigger";
      menu2.append(trigger2);
      actions.forEach((action, index) => {
        const item = el("ha-dropdown-item", action.label);
        item.value = String(index);
        item.disabled = Boolean(action.disabled);
        menu2.append(item);
      });
      menu2.addEventListener("wa-select", (event) => {
        const action = actions[Number(event.detail?.item?.value)];
        if (action && !action.disabled) action.run();
      });
      return menu2;
    }
    if (registry?.get("ha-button-menu")) {
      const menu2 = el("ha-button-menu");
      const trigger2 = iconButton(label, "mdi:dots-vertical", () => {
      });
      trigger2.slot = "trigger";
      menu2.append(trigger2);
      for (const action of actions) {
        const item = el("mwc-list-item", action.label);
        item.disabled = Boolean(action.disabled);
        item.addEventListener("click", () => {
          if (!item.disabled) action.run();
        });
        menu2.append(item);
      }
      return menu2;
    }
    const menu = el("details", void 0, "ha-plus-overflow");
    const trigger = el("summary", label);
    menu.append(trigger);
    for (const action of actions) {
      const item = el("button", action.label);
      item.type = "button";
      item.disabled = Boolean(action.disabled);
      item.addEventListener("click", () => {
        if (!item.disabled) {
          menu.open = false;
          action.run();
        }
      });
      menu.append(item);
    }
    return menu;
  }
  function navigate(host, path) {
    if (!path.startsWith("/") || path.startsWith("//")) throw new TypeError("Navigation must stay within Home Assistant");
    const view = host?.ownerDocument.defaultView || window.parent;
    view.history.pushState(null, "", path);
    view.dispatchEvent(new view.CustomEvent("location-changed", { detail: { replace: false } }));
  }

  // node_modules/@ha-plus/ui/src/controls.js
  var controlStyles = `${appStyles}

  .surface {
    display: block;
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius,12px);
    background: var(--ha-card-background,var(--card-background-color));
    padding: 20px;
  }

  .top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .heading {
    flex: 1;
    min-width: 0;
  }

  h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0;
    overflow-wrap: anywhere;
  }

  p {
    margin: 6px 0;
    color: var(--secondary-text-color);
    line-height: 1.5;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    margin-top: 6px;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--disabled-text-color);
  }

  .dot.on {
    background: var(--primary-color);
  }

  .power {
    height: 48px;
    width: 48px;
    padding: 12px;
    flex-shrink: 0;
  }

  .power svg {
    width: 24px;
    height: 24px;
  }

  .primary,.power.on {
    background: var(--primary-color);
    color: var(--text-primary-color,#fff);
  }

  .controls {
    border-top: 1px solid var(--divider-color);
    margin-top: 20px;
    padding-top: 20px;
  }

  .label {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .hint {
    color: var(--secondary-text-color);
    font-size: 12px;
    line-height: 1.5;
  }

  input[type=range] {
    width: 100%;
    min-height: 44px;
    accent-color: var(--primary-color);
    margin: 0;
  }

  .swatches,.effects {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .swatch {
    width: 44px;
    height: 44px;
    min-width: 44px;
    border: 3px solid transparent;
    box-shadow: inset 0 0 0 1px #0003;
    padding: 0;
  }

  .swatch[aria-pressed=true] {
    outline: 2px solid var(--primary-text-color);
    outline-offset: 3px;
  }

  .effect[aria-pressed=true] {
    background: var(--primary-color);
    color: var(--text-primary-color,#fff);
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-top: 20px;
    justify-content: space-between;
  }

  .footer a {
    font-size: 13px;
    padding: 10px 0;
    min-height: 44px;
  }

  .error {
    margin-top: 16px;
    color: var(--error-color);
    font-size: 14px;
    overflow-wrap: anywhere;
  }

  .empty {
    text-align: center;
    padding: 32px 16px;
  }

  .empty h2 {
    margin-bottom: 8px;
  }

  @media (max-width:360px) {
    .surface {
      padding: 18px;
    }
    .swatches {
      gap: 8px;
    }
    h2 {
      font-size: 18px;
    }
  }

  main {
    max-width: 1000px;
    margin: auto;
    padding: 24px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit,minmax(min(100%,280px),1fr));
    gap: 16px;
    align-items: start;
  }

  .intro {
    margin: 0 0 24px;
  }

  .eyebrow {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .08em;
    margin: 0 0 8px;
    color: var(--secondary-text-color);
  }

  .action-link {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 10px 16px;
    border-radius: 999px;
    white-space: nowrap;
    text-decoration: none;
  }

  .action-link.primary {
    background: var(--primary-color);
    color: var(--text-primary-color,#fff);
  }

  @media (max-width:480px) {
    main {
      padding: 16px;
    }
  }
`;
  function colorSwatch(button2, rgb) {
    if (!Array.isArray(rgb) || rgb.length !== 3 || !rgb.every(
      (channel) => Number.isFinite(channel) && channel >= 0 && channel <= 255
    )) {
      throw new TypeError(
        "A color preset requires three RGB channels between 0 and 255"
      );
    }
    button2.style.backgroundColor = `rgb(${rgb.join(",")})`;
  }

  // node_modules/@ha-plus/ui/src/loader.js
  var nativeComponents;
  async function loadNativeComponents(host) {
    const required = ["ha-form", "ha-checkbox", "ha-dialog", "ha-icon-button"];
    if (required.every((name) => customElements.get(name))) return;
    if (!nativeComponents) {
      nativeComponents = (async () => {
        if (!window.loadCardHelpers) {
          let resolver = host;
          while (resolver && resolver.localName !== "partial-panel-resolver") {
            resolver = resolver.parentElement || resolver.getRootNode().host;
          }
          const dashboard = Object.values(resolver?.routerOptions?.routes || {}).find((route) => route.tag === "ha-panel-lovelace");
          if (!dashboard?.load) {
            throw new Error(localize(host._hass, en_default2, "dashboard_load_failed"));
          }
          await dashboard.load();
        }
        const helpers = await window.loadCardHelpers();
        const entities = helpers.createCardElement({ type: "entities", entities: [] });
        await entities.constructor.getConfigElement();
        helpers.createCardElement({ type: "todo-list", entity: "todo.ha_plus_ui" });
        let loadingTimeout;
        try {
          await Promise.race([
            customElements.whenDefined("hui-todo-list-card"),
            new Promise((_, reject) => {
              loadingTimeout = setTimeout(() => reject(new Error(localize(host._hass, en_default2, "controls_load_failed"))), 15e3);
            })
          ]);
        } finally {
          clearTimeout(loadingTimeout);
        }
        for (const name of required) {
          if (!customElements.get(name)) {
            throw new Error(localize(host._hass, en_default2, "component_load_failed", { component: name }));
          }
        }
      })().catch((error) => {
        nativeComponents = void 0;
        throw error;
      });
    }
    await nativeComponents;
  }
  async function loadNativeSlider(host) {
    await loadNativeComponents(host);
    if (customElements.get("ha-slider")) return;
    const bootstrap = nativeForm(host._hass, [{
      name: "value",
      label: "",
      selector: { number: { min: 0, max: 100, mode: "slider" } }
    }], { value: 0 }, () => {
    });
    bootstrap.hidden = true;
    host.shadowRoot.append(bootstrap);
    let timeout;
    try {
      await Promise.race([
        customElements.whenDefined("ha-slider"),
        new Promise((_, reject) => {
          timeout = setTimeout(() => reject(new Error(localize(host._hass, en_default2, "component_load_failed", { component: "ha-slider" }))), 15e3);
        })
      ]);
    } finally {
      clearTimeout(timeout);
      bootstrap.remove();
    }
  }

  // node_modules/@ha-plus/ui/src/index.js
  /*! @ha-plus/ui v0.3.2 | MIT | Copyright (c) 2026 HA+ contributors | https://github.com/zvikarp/ha-plus-packages/blob/main/LICENSE */
  function panelHeader(title, { hass, narrow, actions = [], subtitle, domain, iconUrl, onRefresh, refreshing = false } = {}) {
    const header = el("header", void 0, "ha-plus-header");
    const menu = el("ha-menu-button");
    menu.hass = hass;
    menu.narrow = narrow;
    const heading = el("div", void 0, "ha-plus-header-heading");
    heading.append(el("h1", title));
    if (subtitle) heading.append(el("p", subtitle, "ha-plus-muted"));
    header.append(menu);
    if (iconUrl) {
      const logo = el("img", void 0, "ha-plus-header-icon");
      logo.src = iconUrl;
      logo.alt = "";
      header.append(logo);
    }
    header.append(heading);
    if (onRefresh) header.append(iconButton(localize(hass, {}, "common.refresh"), "mdi:refresh", onRefresh, refreshing));
    header.append(...actions);
    if (domain && hass?.user?.is_admin) {
      const settings = iconButton(localize(hass, {}, "settings"), "mdi:cog", () => navigate(header, integrationUrl(domain)));
      settings.dataset.settings = "";
      header.append(settings);
    }
    return header;
  }
  function notice(message, kind = "status") {
    if (!["status", "loading", "empty", "error"].includes(kind)) {
      throw new TypeError("Unknown notice kind");
    }
    const native = Boolean(document.defaultView?.customElements.get("ha-alert"));
    const node = el(native ? "ha-alert" : "div", message, kind === "error" ? "notice error" : "notice");
    if (native) node.setAttribute("alert-type", kind === "error" ? "error" : "info");
    node.setAttribute("role", kind === "error" ? "alert" : "status");
    node.setAttribute("aria-live", kind === "error" ? "assertive" : "polite");
    if (kind === "loading") node.setAttribute("aria-busy", "true");
    return node;
  }

  // src/ir-mapper.js
  var t = (key, values) => localize(haContext(), en_default, key, values);
  var manageUrl = "/config/integrations/integration/broadlink_ir_mapper";
  var addUrl = "/config/integrations/dashboard/add?domain=broadlink_ir_mapper";
  var devices = (hass) => Object.values(hass?.states || {}).filter((s) => s.attributes?.ir_mapper);
  var IRCard = class extends HTMLElement {
    _t(key, values) {
      return localize(this._hass, en_default, key, values);
    }
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
        loadNativeSlider(this).then(() => {
          this._nativeReady = true;
          this._uiError = void 0;
          this.render();
        }).catch((error) => {
          this._uiError = error.message;
          this.render();
        }).finally(() => {
          this._nativeLoading = false;
        });
      }
      const entity = value.states[this._config?.entity || devices(value)[0]?.entity_id];
      const signature = JSON.stringify([
        entity,
        value.states[entity?.attributes.ir_remote]?.state,
        value.user?.is_admin,
        value.locale
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
          ...data
        });
        this._retry = void 0;
        showToast(this, this._t("command_sent"));
      } catch (err) {
        this._retry = () => this._run(domain, service, data);
        this._error = err?.message || this._t("command_failed_check_the_broadlink_remote_and_retry");
      } finally {
        this._busy = false;
        this.render();
        if (focus)
          [...this.shadowRoot.querySelectorAll("[data-focus]")].find((el2) => el2.dataset.focus === focus)?.focus();
      }
    }
    render() {
      if (!this._hass || !this._config) return;
      const entityId = this._config.entity || devices(this._hass)[0]?.entity_id;
      this._entityId = entityId;
      const state = this._hass.states[entityId];
      this.shadowRoot.replaceChildren(el("style", controlStyles));
      const surface = el("ha-card", void 0, "surface");
      this.shadowRoot.append(surface);
      if (!state || !state.attributes.ir_mapper) {
        const empty = el("div", void 0, "empty");
        empty.append(
          el("h2", this._t("choose_an_ir_light")),
          el(
            "p",
            this._t("select_a_ha_ir_entity_in_the_card_editor_or_add_your_first_device")
          )
        );
        const link = el("a", this._t("set_up_an_ir_light"));
        link.href = addUrl;
        empty.append(link);
        surface.append(empty);
        return;
      }
      const attr = state.attributes, on = state.state === "on";
      const remote = this._hass.states[attr.ir_remote];
      const unavailable = ["unavailable", "unknown"].includes(state.state) || !remote || ["off", "unavailable", "unknown"].includes(remote.state);
      const top = el("div", void 0, "top"), heading = el("div", void 0, "heading");
      const status = el("div", void 0, "status");
      status.append(
        el("span", void 0, `dot ${on && !unavailable ? "on" : ""}`),
        el(
          "span",
          unavailable ? this._t("remote_unavailable") : this._busy ? this._t("sending_command") : on ? this._t("on_assumed_state") : this._t("off_assumed_state")
        )
      );
      heading.append(
        el("h2", this._config.title || attr.friendly_name || entityId),
        status
      );
      const powerLabel = on ? this._t("turn_off") : this._t("turn_on");
      const togglePower = () => this._run("light", on ? "turn_off" : "turn_on");
      const nativePower = Boolean(customElements.get("ha-icon-button"));
      const power = nativePower ? iconButton(powerLabel, "mdi:power", togglePower, this._busy || unavailable) : this._button(void 0, togglePower, `power ${on ? "on" : ""}`);
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
          "M11 2h2v10h-2zM6.3 4.9l1.4 1.4A7 7 0 1 0 16.3 6.3l1.4-1.4a9 9 0 1 1-11.4 0"
        );
        svg.append(path);
        power.append(svg);
      }
      const actions = [{ label: this._t("entity_details"), run: () => showMoreInfo(this, entityId) }];
      if (this._hass.user?.is_admin) actions.push({ label: this._t("integration_settings"), run: () => navigate(this, integrationUrl("broadlink_ir_mapper")) });
      top.append(heading, power, overflowMenu(actions));
      surface.append(top);
      if (attr.ir_dimmable) {
        const section = el("section", void 0, "controls"), label = el("label", void 0, "label");
        label.htmlFor = "brightness";
        label.append(
          el("span", this._t("brightness")),
          el(
            "span",
            this._t("estimated", { value1: Math.round((attr.brightness || 0) / 255 * 100) })
          )
        );
        const input = nativeSlider({
          label: this._t("brightness"),
          min: 1,
          max: 255,
          value: Number(attr.brightness || 255),
          disabled: this._busy || unavailable,
          hass: this._hass,
          preview: (value) => {
            this._editing = true;
            label.lastChild.textContent = this._t("release_to_send", { value1: formatNumber(this._hass, Math.round(value / 255 * 100)) });
          },
          change: (value) => {
            this._editing = false;
            this._run("light", "turn_on", { brightness: value });
          }
        });
        input.dataset.focus = "brightness";
        input.id = "brightness";
        input.addEventListener("blur", () => {
          this._editing = false;
        });
        section.append(
          label,
          input,
          el(
            "div",
            this._t("steps_ir_brightness_is_approximate", { value1: attr.ir_brightness_steps ?? "\u2014" }),
            "hint"
          )
        );
        surface.append(section);
      }
      if (attr.ir_colors?.length) {
        const section = el("section", void 0, "controls"), swatches = el("div", void 0, "swatches");
        section.append(el("div", this._t("colors"), "label"), swatches);
        for (const color of attr.ir_colors) {
          const button2 = this._button(
            void 0,
            () => this._run("light", "turn_on", { rgb_color: color.rgb }),
            "swatch"
          );
          colorSwatch(button2, color.rgb);
          button2.dataset.focus = "color:" + color.name;
          button2.title = color.name;
          button2.setAttribute("aria-label", color.name);
          button2.setAttribute(
            "aria-pressed",
            String(
              on && !attr.effect && JSON.stringify(color.rgb) === JSON.stringify(attr.rgb_color)
            )
          );
          button2.disabled ||= unavailable;
          swatches.append(button2);
        }
        surface.append(section);
      }
      if (attr.effect_list?.length) {
        const section = el("section", void 0, "controls"), effects = el("div", void 0, "effects");
        section.append(el("div", this._t("effects"), "label"), effects);
        for (const effect of attr.effect_list) {
          const button2 = this._button(
            effect,
            () => this._run("light", "turn_on", { effect }),
            "effect"
          );
          button2.dataset.focus = "effect:" + effect;
          button2.setAttribute(
            "aria-pressed",
            String(on && attr.effect === effect)
          );
          button2.disabled ||= unavailable;
          effects.append(button2);
        }
        surface.append(section);
      }
      const error = this._uiError || this._error || attr.ir_last_error;
      if (error) {
        const message = notice(error, "error");
        if (this._retry && !unavailable) message.append(button(this._t("common.retry"), this._retry, this._busy));
        surface.append(message);
      }
      const footer = el("div", void 0, "footer");
      if (attr.ir_can_resynchronize) {
        const sync = this._button(
          this._t("resync_to_full_brightness"),
          () => this._run("broadlink_ir_mapper", "resynchronize")
        );
        sync.disabled ||= unavailable;
        footer.append(sync);
      }
      if (this._hass.user?.is_admin) {
        const link = el("a", this._t("device_settings"));
        link.href = manageUrl;
        footer.append(link);
      }
      surface.append(footer);
    }
  };
  var IRPanel = class extends HTMLElement {
    _t(key, values) {
      return localize(this._hass, en_default, key, values);
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
      const menu = this.shadowRoot.querySelector("ha-menu-button");
      if (menu) menu.hass = value;
      if (!this._built) {
        this._built = true;
        this.build();
      }
      const states = devices(value), ids = states.map((s) => s.entity_id).sort().join(",");
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
      this.shadowRoot.append(el("style", controlStyles));
      const add = button(this._t("add_device"), () => navigate(this, integrationUrl("broadlink_ir_mapper", true)), false, "primary");
      this._add = add;
      const header = panelHeader("HA+ IR Mapper", {
        hass: this._hass,
        narrow: this._narrow,
        domain: "broadlink_ir_mapper",
        iconUrl: "/broadlink_ir_mapper/icon.png",
        onRefresh: () => {
          this._ids = void 0;
          this.hass = this._hass;
        }
      });
      this._count = el("p", "", "ha-plus-muted");
      const main = el("main");
      main.append(
        el("p", this._t("your_remotes_made_simple"), "eyebrow"),
        el(
          "p",
          this._t("power_colors_and_effects_without_reaching_for_the_remote_ir_devices_report_assumed_st"),
          "intro"
        )
      );
      this._empty = el("section", void 0, "surface empty");
      this._empty.append(
        el("h2", this._t("bring_your_ir_lights_into_ha")),
        el(
          "p",
          this._t("add_a_device_choose_your_broadlink_remote_and_learn_its_buttons_no_yaml_or_copied_cod")
        )
      );
      this._grid = el("div", void 0, "grid");
      main.append(this._count, add, this._empty, this._grid);
      this.shadowRoot.append(header, main);
    }
  };
  var IREditor = class extends HTMLElement {
    _t(key, values) {
      return localize(this._hass, en_default, key, values);
    }
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
      picker.entityFilter = (e) => Boolean(this._hass.states[e.entity_id]?.attributes.ir_mapper);
      picker.addEventListener("value-changed", (e) => {
        if (!e.detail.value) return;
        this._config = { ...this._config, entity: e.detail.value };
        this.dispatchEvent(
          new CustomEvent("config-changed", {
            detail: { config: this._config },
            bubbles: true,
            composed: true
          })
        );
      });
      this.append(picker);
    }
  };
  customElements.define("ha-plus-ir-card", IRCard);
  customElements.define("ha-plus-ir-panel", IRPanel);
  customElements.define("ha-plus-ir-card-editor", IREditor);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "ha-plus-ir-card",
    name: "HA+ IR",
    description: t("automatic_ir_presets_effects_brightness_and_resynchronization"),
    preview: true
  });
  window.customIcons = window.customIcons || {};
  window.customIcons["ha-plus-ir"] = {
    getIcon: async (name) => name === "logo" ? {
      path: "M486.983728,109.999628L486.983728,401.999167C486.983728,448.360304 449.344523,485.999328 402.983597,485.999328L110.983547,485.999328C64.622622,485.999328 26.983416,448.360304 26.983416,401.999167L26.983416,109.999628C26.983416,63.638491 64.622622,25.999467 110.983547,25.999467L402.983597,25.999467C449.344523,25.999467 486.983728,63.638491 486.983728,109.999628ZM203.646977,153.172678L85.650716,271.168815C55.389558,301.430480 55.389558,350.567689 85.650716,380.829354L132.153426,427.332080C162.415240,457.593745 211.552123,457.593745 241.813937,427.332080L359.810199,309.335943C390.072012,279.074278 390.072012,229.937069 359.810199,199.675404L313.307488,153.172678C283.046331,122.911013 233.908791,122.911013 203.646977,153.172678ZM319.921476,115.645046C317.786830,122.807673 321.868388,130.356146 329.030477,132.490709C339.847458,135.715703 350.562038,142.060339 359.741932,151.240768C368.922482,160.421198 375.267341,171.134943 378.492284,181.952698C380.626929,189.114655 388.175644,193.196561 395.337733,191.061327C402.500479,188.926094 406.582037,181.378292 404.446735,174.215665C400.031721,159.403909 391.463602,144.660599 378.892694,132.090101C366.322442,119.519602 351.578817,110.951156 336.767582,106.536417C329.604836,104.401183 322.056777,108.483089 319.921476,115.645046ZM332.780548,69.934142C330.645902,77.096769 334.727460,84.644571 341.890206,86.779804C359.894219,92.146742 377.747915,102.673939 393.028483,117.954748C408.309051,133.234886 418.836555,151.088444 424.203363,169.092984C426.338008,176.255611 433.886723,180.336846 441.048813,178.202284C448.211559,176.067050 452.293116,168.518578 450.157814,161.356621C443.600279,139.357410 430.849514,117.474287 412.179245,98.803409C393.508975,80.133203 371.625579,67.382867 349.626654,60.824842C342.463908,58.690279 334.915849,62.771514 332.780548,69.934142ZM271.081989,185.999715C271.081989,205.506160 274.111153,214.011755 287.344776,227.245167C294.480117,234.380545 300.389142,238.371353 306.332512,240.487868C311.542564,242.343239 317.364828,243.038403 326.983732,243.038403C345.781389,243.038403 345.781389,268.960973 326.983732,268.960973C317.343396,268.960973 311.528816,269.653718 306.327054,271.506293C300.393471,273.619503 294.489842,277.609258 287.344554,284.754431C274.125585,297.972850 271.081989,306.519798 271.081989,325.999661C271.081989,343.281375 242.885504,343.281375 242.885504,325.999661C242.885504,306.493216 239.856340,297.987621 226.622716,284.754209C219.487375,277.618831 213.578351,273.628024 207.634980,271.511508C202.424929,269.656137 196.602665,268.960973 186.983761,268.960973C168.186104,268.960973 168.186104,243.038403 186.983761,243.038403C196.624097,243.038403 202.438677,242.345658 207.640438,240.493083C213.574021,238.379873 219.477651,234.390118 226.622939,227.244945C239.841908,214.026526 242.885504,205.479578 242.885504,185.999715C242.885504,168.718001 271.081989,168.718001 271.081989,185.999715ZM203.386906,342.629770C203.386906,360.873489 188.597447,375.662945 170.353725,375.662945C152.110003,375.662945 137.320544,360.873489 137.320544,342.629770C137.320544,324.386051 152.110003,309.596595 170.353725,309.596595C188.597447,309.596595 203.386906,324.386051 203.386906,342.629770Z",
      viewBox: "0 0 513 512"
    } : void 0
  };
})();
