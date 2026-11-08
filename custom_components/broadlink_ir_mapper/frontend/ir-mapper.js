(() => {
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
  function nativeTextField(label, value, change) {
    const node = el(customElements.get("ha-input") ? "ha-input" : "ha-textfield");
    node.label = label;
    node.placeholder = label;
    node.value = value;
    node.setAttribute("aria-label", label);
    node.addEventListener("input", () => change(node.value));
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
  var en_default = {
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
    const message = native && native !== nativeKey ? native : messages[key] || en_default[shortKey] || key;
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

  // node_modules/@ha-plus/ui/src/collection-layout.js
  var collectionLayoutStyles = `
  .ha-plus-collection-layout {
    --ha-plus-collection-header-height: var(--header-height, 56px);
    display: grid;
    grid-template-columns: 256px minmax(0, 1fr);
    min-height: calc(100dvh - var(--ha-plus-collection-header-height));
  }
  .ha-plus-collection-layout.ha-plus-embedded { --ha-plus-collection-header-height: 0px; }
  .ha-plus-collection-nav {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: var(--ha-plus-collection-header-height);
    height: calc(100dvh - var(--ha-plus-collection-header-height));
    box-sizing: border-box;
    padding: 12px 8px;
    border-inline-end: 1px solid var(--divider-color, #e0e0e0);
    background: var(--sidebar-background-color, var(--card-background-color, #fff));
  }
  .ha-plus-collection-items { flex: 1; overflow: auto; min-height: 0; }
  .ha-plus-collection-nav h2 { margin: 20px 16px 8px; color: var(--secondary-text-color, #727272); font-size: 12px; font-weight: 500; }
  .ha-plus-collection-item {
    display: flex; align-items: center; gap: 16px; width: 100%; min-height: 56px;
    box-sizing: border-box; padding: 8px 16px; border: 0; border-radius: 4px;
    background: transparent; color: var(--primary-text-color, #212121); text-align: start;
    font: inherit; text-decoration: none; cursor: pointer;
  }
  .ha-plus-collection-item:hover { background: var(--secondary-background-color, #f5f5f5); }
  .ha-plus-collection-item[aria-current=page] { color: var(--primary-color, #03a9f4); background: var(--ha-color-fill-primary-quiet-resting, var(--secondary-background-color, #f5f5f5)); }
  .ha-plus-collection-item:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: -2px; }
  .ha-plus-collection-name { flex: 1; min-width: 0; overflow-wrap: anywhere; }
  .ha-plus-collection-count { color: var(--secondary-text-color, #727272); font-size: 12px; }
  .ha-plus-collection-create { padding: 16px 8px 4px; }
  .ha-plus-create-button {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 40px; padding: 0 16px; border: 0; border-radius: var(--ha-button-border-radius, 999px);
    background: var(--ha-color-fill-primary-normal-resting, #d9f2fc);
    color: var(--ha-color-on-primary-quiet, var(--primary-color, #03a9f4));
    text-decoration: none; font: 500 14px var(--ha-font-family-body, var(--primary-font-family, Roboto, sans-serif)); cursor: pointer;
  }
  ha-button.ha-plus-create-button, mwc-button.ha-plus-create-button { padding: 0; background: transparent; }
  .ha-plus-collection-create .ha-plus-create-button { width: 100%; box-sizing: border-box; --ha-button-width: 100%; }
  .ha-plus-create-button:hover { background: var(--ha-color-fill-primary-normal-hover, #caebf9); }
  .ha-plus-create-button:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 3px; }
  .ha-plus-create-button ha-icon { --mdc-icon-size: 20px; }
  .ha-plus-collection-body { display: flex; flex-direction: column; min-width: 0; min-height: calc(100dvh - var(--ha-plus-collection-header-height)); }
  .ha-plus-collection-content { flex: 1; min-width: 0; width: 100%; max-width: 1000px; margin-inline: auto; padding: 24px; box-sizing: border-box; }
  .ha-plus-collection-mobile { display: none; padding: 16px; }
  .ha-plus-collection-mobile label { display: block; margin-bottom: 8px; color: var(--secondary-text-color, #727272); }
  .ha-plus-collection-mobile select { width: 100%; min-height: 48px; padding: 8px 12px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); border: 1px solid var(--divider-color, #e0e0e0); border-radius: 4px; font: inherit; }
  .ha-plus-collection-mobile .ha-plus-create-button { margin-top: 12px; }
  .ha-plus-collection-host { container-type: inline-size; }
  @media (max-width: 750px) {
    .ha-plus-collection-layout { display: block; }
    .ha-plus-collection-nav { display: none; }
    .ha-plus-collection-mobile { display: block; }
    .ha-plus-collection-content { padding: 0 16px 24px; }
  }
  @container (max-width: 750px) {
    .ha-plus-collection-layout { display: block; }
    .ha-plus-collection-nav { display: none; }
    .ha-plus-collection-mobile { display: block; }
    .ha-plus-collection-content { padding: 0 16px 24px; }
  }
`;
  function collectionCreateButton(label, handler, disabled = false) {
    const control = button(void 0, handler, disabled, "ha-plus-create-button");
    if (control.localName === "ha-button") control.appearance = "filled";
    const plus = icon("mdi:plus");
    if (control.localName !== "button") plus.slot = control.localName === "mwc-button" ? "icon" : "start";
    control.append(plus, document.createTextNode(label));
    return control;
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
  var remoteEditorStyles = `${appStyles}
  :host { display: block; min-width: 0; }
  .remote-editor { display: flex; flex-direction: column; gap: 20px; }
  .remote-editor ha-form { display: block; }
  .remote-command-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .remote-command { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 88px; width: 100%; padding: 12px 8px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); font: inherit; cursor: pointer; overflow-wrap: anywhere; }
  .remote-command:focus-visible, .remote-command[aria-pressed=true] { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  .remote-command small { color: var(--secondary-text-color); }
  .remote-command[data-required=true] small { font-weight: 600; }
  .remote-command[data-learned=true] { border-color: var(--success-color, #43a047); }
  .remote-command:disabled { opacity: .6; cursor: default; }
  .remote-command-color { width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--divider-color); }
  .remote-editor-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 8px; }
  .remote-command-details { border-block: 1px solid var(--divider-color); padding-block: 16px; display: flex; flex-direction: column; gap: 16px; }
  @media (max-width: 450px) { .remote-command-grid { gap: 8px; grid-template-columns: repeat(3, minmax(0, 1fr)); } }
`;

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
            throw new Error(localize(host._hass, en_default, "dashboard_load_failed"));
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
              loadingTimeout = setTimeout(() => reject(new Error(localize(host._hass, en_default, "controls_load_failed"))), 15e3);
            })
          ]);
        } finally {
          clearTimeout(loadingTimeout);
        }
        for (const name of required) {
          if (!customElements.get(name)) {
            throw new Error(localize(host._hass, en_default, "component_load_failed", { component: name }));
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
          timeout = setTimeout(() => reject(new Error(localize(host._hass, en_default, "component_load_failed", { component: "ha-slider" }))), 15e3);
        })
      ]);
    } finally {
      clearTimeout(timeout);
      bootstrap.remove();
    }
  }

  // node_modules/@ha-plus/ui/src/footer.js
  var footerStyles = `
  .ha-plus-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 24px;
    margin-top: auto;
    padding: 4px 16px;
    border-top: 1px solid var(--divider-color, #e0e0e0);
    color: var(--secondary-text-color, #727272);
    font: 14px var(--ha-font-family-body, var(--primary-font-family, Roboto, sans-serif));
  }
  .ha-plus-footer a { color: var(--primary-color, #03a9f4); text-decoration: none; min-height: 32px; display: inline-flex; align-items: center; }
  .ha-plus-footer a:hover { text-decoration: underline; }
  .ha-plus-footer a:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 4px; }
  .ha-plus-page-body { display: flex; flex-direction: column; min-height: calc(100dvh - var(--header-height, 56px)); }
  .ha-plus-page-body > main { flex: 1; width: 100%; box-sizing: border-box; }
`;
  function appFooter({ githubUrl, documentationUrl, version } = {}) {
    const footer = el("footer", void 0, "ha-plus-footer");
    footer.append(el("style", footerStyles));
    for (const [label, href] of [["GitHub", githubUrl], ["Documentation", documentationUrl]]) {
      if (!href) continue;
      const link = el("a", label);
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      footer.append(link);
    }
    const number = el("span", version ? `v${String(version).replace(/^v/, "")}` : "");
    number.dataset.version = "";
    footer.append(number);
    return footer;
  }

  // node_modules/@ha-plus/ui/src/tabs.js
  var nextTabsId = 0;
  var tabStyles = `
  .ha-plus-tabs { display: flex; gap: 0; min-height: 48px; border-bottom: 1px solid var(--divider-color, #e0e0e0); }
  .ha-plus-tabs [role=tab] {
    flex: 0 0 auto; min-width: 96px; min-height: 48px; padding: 0 24px; border: 0; border-bottom: 3px solid transparent;
    border-radius: 0; background: transparent; color: var(--secondary-text-color, #727272);
    font: 500 14px var(--ha-font-family-body, var(--primary-font-family, Roboto, sans-serif)); cursor: pointer;
  }
  .ha-plus-tabs [role=tab][aria-selected=true] { color: var(--primary-color, #03a9f4); border-bottom-color: var(--primary-color, #03a9f4); }
  .ha-plus-tabs [role=tab]:hover { background: var(--secondary-background-color, #f5f5f5); }
  .ha-plus-tabs [role=tab]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: -4px; }
`;
  function tabs(items, value, change, label) {
    const list = el("div", void 0, "ha-plus-tabs");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", label);
    const id = `ha-plus-tabs-${++nextTabsId}`;
    const controls = items.map((item) => {
      const control = el("button", item.label);
      control.type = "button";
      control.id = `${id}-${item.value}`;
      control.dataset.value = item.value;
      control.setAttribute("role", "tab");
      control.addEventListener("click", () => {
        list.value = item.value;
        change(item.value);
      });
      list.append(control);
      return control;
    });
    Object.defineProperty(list, "value", {
      get: () => value,
      set: (next) => {
        if (!items.some((item) => item.value === next)) return;
        value = next;
        controls.forEach((control) => {
          const selected = control.dataset.value === next;
          control.setAttribute("aria-selected", String(selected));
          control.tabIndex = selected ? 0 : -1;
        });
      }
    });
    list.value = value;
    list.addEventListener("keydown", (event) => {
      const current = controls.indexOf(event.target);
      if (current < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const rtl = list.ownerDocument.defaultView.getComputedStyle(list).direction === "rtl";
      let index;
      if (event.key === "Home") index = 0;
      else if (event.key === "End") index = controls.length - 1;
      else {
        const forward = event.key === "ArrowRight" !== rtl;
        index = (current + (forward ? 1 : -1) + controls.length) % controls.length;
      }
      controls[index].focus();
      controls[index].click();
    });
    return list;
  }

  // node_modules/@ha-plus/ui/src/index.js
  /*! @ha-plus/ui v0.3.3 | MIT | Copyright (c) 2026 HA+ contributors | https://github.com/zvikarp/ha-plus-packages/blob/main/LICENSE */
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

  // src/device-editor.js
  var defaultColors = [
    ["Red", "#ff0000"],
    ["Green", "#00ff00"],
    ["Blue", "#0000ff"],
    ["White", "#ffffff"],
    ["Orange", "#ff8000"],
    ["Lime", "#80ff00"],
    ["Sky blue", "#0080ff"],
    ["Warm white", "#ffddaa"],
    ["Amber", "#ffbf00"],
    ["Cyan", "#00ffff"],
    ["Purple", "#8000ff"],
    ["Cool white", "#ddeeff"],
    ["Yellow", "#ffff00"],
    ["Teal", "#008080"],
    ["Pink", "#ff0080"],
    ["Magenta", "#ff00ff"]
  ];
  var standardCommands = [
    ["power_on", "Power on", "mdi:power"],
    ["power_off", "Power off", "mdi:power-off"],
    ["brightness_up", "Brightness up", "mdi:brightness-7"],
    ["brightness_down", "Brightness down", "mdi:brightness-5"]
  ];
  var hexToRgb = (hex) => /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1).match(/../g).map((value) => parseInt(value, 16)) : void 0;
  var rgbToHex = (rgb) => "#" + rgb.map((value) => value.toString(16).padStart(2, "0")).join("");
  var emptyDevice = () => ({ name: "", broadlink_remote: "", brightness_steps: 10, ir_codes: {}, colors: [], effects: [] });
  var IRDeviceEditor = class extends HTMLElement {
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
      this._error = void 0;
      this.render();
      try {
        await action();
      } catch (error) {
        this._error = error.message || "The operation failed. Please retry.";
      } finally {
        this._busy = false;
        this.render();
      }
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
        key,
        name,
        symbol,
        kind: "ir_codes",
        ref: this._data.ir_codes[key],
        required: key === "power_on" || key === "power_off"
      }));
      const colors = defaultColors.map(([name, hex]) => ({ name, rgb: hexToRgb(hex) }));
      for (const saved of this._data.colors) {
        const preset = colors.find((color) => color.name === saved.name);
        if (preset) Object.assign(preset, saved);
        else colors.push(saved);
      }
      commands.push(...colors.map((color) => ({ ...color, key: `color:${color.name}`, kind: "colors", ref: color.ir_code })));
      const effects = ["Flash", "Strobe", "Fade", "Smooth"].map((name) => ({ name }));
      for (const saved of this._data.effects) {
        const preset = effects.find((effect) => effect.name === saved.name);
        if (preset) Object.assign(preset, saved);
        else effects.push(saved);
      }
      commands.push(...effects.map((effect) => ({ ...effect, key: `effect:${effect.name}`, kind: "effects", ref: effect.ir_code, symbol: "mdi:lightbulb-auto" })));
      return commands;
    }
    _commit(command, ref) {
      if (command.kind === "ir_codes") this._data.ir_codes[command.key] = ref;
      else {
        this._data[command.kind] = this._data[command.kind].filter((item2) => item2.name !== command.name);
        const item = { name: command.name, ir_code: ref };
        if (command.kind === "colors") item.rgb = command.rgb;
        this._data[command.kind].push(item);
      }
      command.ref = ref;
      this._pending = void 0;
      this.render();
    }
    _learn(command) {
      if (!this._validSettings()) {
        this.render();
        return;
      }
      this._selected = command;
      this._pending = void 0;
      this._run(async () => {
        const ref = await this._call("learn", { remote: this._data.broadlink_remote });
        this._pending = { command, ref };
      });
    }
    _save(another) {
      if (!this._validSettings()) {
        this._tab = "settings";
        this.render();
        return;
      }
      if (!this._data.ir_codes.power_on || !this._data.ir_codes.power_off) {
        this._error = "Learn Power on and Power off before saving. Other commands are optional.";
        this._tab = "commands";
        this.render();
        return;
      }
      this._run(async () => {
        const result = await this._call("save_device", {
          definition: this._data,
          request_id: this._requestId,
          ...this._entry ? { entry_id: this._entry.entry_id, revision: this._entry.revision } : {},
          ...this._deviceId ? { device_id: this._deviceId } : {}
        });
        showToast(this, "IR light saved");
        if (!another) {
          this._close();
          return;
        }
        this._helpers = await this._call("devices");
        this._entry = this._helpers.find((entry) => entry.entry_id === result.entry_id);
        const remote = this._data.broadlink_remote;
        this._data = { ...emptyDevice(), broadlink_remote: remote };
        this._requestId = crypto.randomUUID();
        this._deviceId = void 0;
        this._selected = this._pending = void 0;
        this._tab = "settings";
      });
    }
    _settings() {
      const form = nativeForm(this._hass, [
        { name: "name", label: "Device name", required: true, selector: { text: {} } },
        { name: "broadlink_remote", label: "BroadLink remote", required: true, disabled: Boolean(this._deviceId), selector: { entity: { domain: "remote", integration: "broadlink" } } },
        { name: "brightness_steps", label: "Brightness steps", helper: "Number of brightness button presses from minimum to maximum.", required: true, selector: { number: { min: 1, max: 100, step: 1, mode: "box" } } },
        ...!this._deviceId ? [{ name: "helper", label: "Save in helper", selector: { select: { options: [
          { value: "new", label: "Create a new helper" },
          ...this._helpers.map((entry) => ({ value: entry.entry_id, label: `${entry.title} (${entry.devices.length} ${entry.devices.length === 1 ? "light" : "lights"})` }))
        ] } } }] : []
      ], { ...this._data, helper: this._entry?.entry_id || "new" }, (values) => {
        const { helper, ...fields } = values;
        Object.assign(this._data, fields);
        if (!this._deviceId) this._entry = this._helpers.find((entry) => entry.entry_id === helper);
      });
      form.disabled = this._busy;
      return form;
    }
    _details() {
      const command = this._selected;
      const details = el("section", void 0, "remote-command-details");
      details.append(el("h3", command.name));
      if (command.kind === "colors") {
        const currentHex = rgbToHex(command.rgb);
        const palette = nativeForm(this._hass, [{
          name: "preset",
          label: "Default color",
          selector: { select: { options: [
            ...defaultColors.map(([name, hex2]) => ({ label: name, value: hex2 })),
            { label: "Custom color", value: "custom" }
          ] } }
        }], { preset: defaultColors.some(([, hex2]) => hex2 === currentHex) ? currentHex : "custom" }, (values) => {
          if (values.preset === "custom") return;
          command.rgb = hexToRgb(values.preset);
          this._hex.value = values.preset;
          this._invalidHex = false;
          this._hex.invalid = false;
          learn.disabled = this._busy;
        });
        const hex = nativeTextField("Custom color hex (#RRGGBB)", rgbToHex(command.rgb), (value) => {
          const rgb = hexToRgb(value);
          hex.invalid = !rgb;
          if (rgb) command.rgb = rgb;
          this._invalidHex = !rgb;
          palette.data = { preset: defaultColors.some(([, hex2]) => hex2.toLowerCase() === value.toLowerCase()) ? value.toLowerCase() : "custom" };
          learn.disabled = this._busy || !rgb;
        });
        this._hex = hex;
        hex.disabled = this._busy;
        palette.disabled = this._busy;
        details.append(palette, hex);
      }
      const actions = el("div", void 0, "remote-editor-actions");
      const learn = button(command.ref ? "Replace command" : "Learn command", () => this._learn(command), this._busy, "primary");
      actions.append(learn);
      if (command.ref) {
        actions.append(button("Test command", () => this._run(() => this._hass.callService("remote", "send_command", {
          entity_id: this._data.broadlink_remote,
          ...typeof command.ref === "string" ? { command: "b64:" + command.ref.replace(/^b64:/, "") } : command.ref
        })), this._busy));
        if (command.kind === "colors") actions.append(button("Update color", () => {
          if (this._invalidHex) return;
          this._commit(command, command.ref);
        }, this._busy));
        actions.append(button("Remove command", () => {
          if (command.kind === "ir_codes") delete this._data.ir_codes[command.key];
          else this._data[command.kind] = this._data[command.kind].filter((item) => item.name !== command.name);
          this._selected = void 0;
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
      const page = el("div", void 0, "remote-editor");
      page.append(el("p", "Click a command to learn it. Power on and Power off are required. Learn only the optional buttons your remote has."));
      if (this._busy) page.append(notice("Point the physical remote at your BroadLink and press the selected button. Learning and testing can take up to 65 seconds.", "status"));
      if (this._pending) {
        const confirmation = notice(`Did ${this._pending.command.name} work when the test command was sent?`, "status");
        confirmation.append(button("Yes, keep command", () => this._commit(this._pending.command, this._pending.ref)), button("Retry", () => this._learn(this._pending.command)), button("Discard", () => {
          this._pending = void 0;
          this.render();
        }));
        page.append(confirmation);
      }
      if (this._selected && !this._pending) page.append(this._details());
      const grid = el("div", void 0, "remote-command-grid");
      grid.setAttribute("aria-label", "Remote commands");
      for (const command of this._commands()) {
        const tile = el("button", void 0, "remote-command");
        tile.type = "button";
        tile.disabled = this._busy || Boolean(this._pending);
        tile.dataset.required = String(Boolean(command.required));
        tile.dataset.learned = String(Boolean(command.ref));
        tile.setAttribute("aria-pressed", String(command.key === this._selected?.key));
        if (command.rgb) {
          const swatch = el("span", void 0, "remote-command-color");
          swatch.style.backgroundColor = rgbToHex(command.rgb);
          tile.append(swatch);
        } else tile.append(icon(command.symbol));
        tile.append(el("span", command.name), el("small", `${command.required ? "Required" : "Optional"} \xB7 ${command.ref ? "Learned" : "Not learned"}`));
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
        const name = nativeTextField("Command name", this._optionalName, (value) => {
          this._optionalName = value;
        });
        page.append(name, button("Add command", () => {
          const name2 = this._optionalName.trim();
          if (!name2) {
            this._error = "Enter a command name.";
            this.render();
            return;
          }
          const key = `${kind === "colors" ? "color" : "effect"}:${name2}`;
          if (this._commands().some((command) => command.key === key)) {
            this._error = "Choose a different command name.";
            this.render();
            return;
          }
          this._selected = { kind, key, name: name2, ...kind === "colors" ? { rgb: [255, 0, 0] } : {} };
          this._adding = void 0;
          this.render();
        }, this._busy));
      } else {
        const actions = el("div", void 0, "remote-editor-actions");
        actions.append(button("Add custom color", () => this._addOptional("colors"), this._busy || Boolean(this._pending)), button("Add effect", () => this._addOptional("effects"), this._busy || Boolean(this._pending)));
        page.append(actions);
      }
      return page;
    }
    render() {
      if (!this._data) return;
      const page = el("section", void 0, "remote-editor");
      page.append(el("h2", this._deviceId ? `Edit ${this._data.name}` : "Add IR light"));
      const tabBar = tabs([
        { value: "settings", label: "Settings" },
        { value: "commands", label: "Commands" }
      ], this._tab, (value) => {
        if (this._busy || this._pending) return;
        this._tab = value;
        this.render();
      }, "IR light setup");
      for (const tab of tabBar.querySelectorAll("[role=tab]")) tab.disabled = this._busy || Boolean(this._pending);
      page.append(tabBar);
      if (this._error) page.append(notice(this._error, "error"));
      if (this._ready) page.append(this._tab === "settings" ? this._settings() : this._commandPage());
      else page.append(el("p", "Loading Home Assistant controls\u2026"));
      const actions = el("div", void 0, "remote-editor-actions");
      actions.append(button("Cancel", () => this._close(), this._busy));
      if (this._tab === "settings") actions.append(button("Learn commands", () => {
        if (this._validSettings()) this._tab = "commands";
        this.render();
      }, this._busy, "primary"));
      actions.append(button("Save and add another", () => this._save(true), this._busy || Boolean(this._pending)), button("Save", () => this._save(false), this._busy || Boolean(this._pending), "primary"));
      page.append(actions);
      this.shadowRoot.replaceChildren(el("style", remoteEditorStyles + tabStyles), page);
    }
  };
  customElements.define("ha-plus-ir-device-editor", IRDeviceEditor);

  // src/translations/en.json
  var en_default2 = {
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

  // src/ir-mapper.js
  var t = (key, values) => localize(haContext(), en_default2, key, values);
  var manageUrl = "/config/integrations/integration/broadlink_ir_mapper";
  var addUrl = "/ha-plus-ir?setup=1";
  var devices = (hass) => Object.values(hass?.states || {}).filter((s) => s.attributes?.ir_mapper);
  var IRCard = class extends HTMLElement {
    _t(key, values) {
      return localize(this._hass, en_default2, key, values);
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
        link.href = attr.ir_device_id ? `/ha-plus-ir?device=${encodeURIComponent(attr.ir_device_id)}` : manageUrl;
        footer.append(link);
      }
      surface.append(footer);
    }
  };
  var IRPanel = class extends HTMLElement {
    _t(key, values) {
      return localize(this._hass, en_default2, key, values);
    }
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
      if (this._editor) {
        this._editor._hass = value;
        return;
      }
      const menu = this.shadowRoot.querySelector("ha-menu-button");
      if (menu) menu.hass = value;
      if (!this._built) {
        this._built = true;
        this.build();
        const params = new URLSearchParams(window.location?.search || "");
        if (value.user?.is_admin && (params.has("setup") || params.has("device"))) {
          this._openEditor(params.get("device") || void 0);
        }
      }
      const states = devices(value), ids = states.map((s) => s.entity_id).sort().join(",");
      if (ids !== this._ids) {
        this._ids = ids;
        this._grid.replaceChildren();
        for (const state of states) {
          const card = document.createElement("ha-plus-ir-card");
          card.setConfig({ entity: state.entity_id });
          const item = el("section");
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
        const entry = helpers.find((entry2) => entry2.devices.some((device2) => device2.unique_id === deviceId));
        const device = entry?.devices.find((device2) => device2.unique_id === deviceId);
        if (deviceId && !device) throw new Error("This light is managed in YAML. Edit its YAML configuration to change commands.");
        const editor = document.createElement("ha-plus-ir-device-editor");
        this._editor = editor;
        this._main.replaceChildren(editor);
        await editor.configure(this._hass, helpers, device ? { entry, device } : void 0, () => {
          this._editor = void 0;
          if (window.location?.search) window.history.replaceState(null, "", window.location.pathname);
          this._ids = void 0;
          this.shadowRoot.replaceChildren();
          this.build();
          this.hass = this._hass;
        });
      } catch (error) {
        this._main.prepend(notice(error.message || "Could not open device setup", "error"));
      }
    }
    build() {
      this.shadowRoot.append(el("style", controlStyles + collectionLayoutStyles));
      const add = collectionCreateButton("Add Device", () => this._openEditor());
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
      this._main = main;
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
      const body = el("div", void 0, "ha-plus-page-body");
      body.append(main, appFooter({
        githubUrl: "https://github.com/zvikarp/ha-plus-ir-mapper",
        documentationUrl: "https://github.com/zvikarp/ha-plus-ir-mapper#readme",
        version: this._panel?.config?.version
      }));
      this.shadowRoot.append(header, body);
    }
  };
  var IREditor = class extends HTMLElement {
    _t(key, values) {
      return localize(this._hass, en_default2, key, values);
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
})();
