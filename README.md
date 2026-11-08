# HA+ IR Mapper (BroadLink)

<img src="./resources/ha-plus-ir-mapper.png" alt="HA+ BroadLink IR Mapper" width="140">

A local Home Assistant integration that exposes IR-controlled lights through an
existing BroadLink remote. It maps power, preset RGB colors, effects, and relative
brightness commands to normal light entities. Configure devices with native HA forms and guided IR learning, then control them
from the HA+ IR sidebar or dashboard card. Existing YAML configuration remains
supported. No separate server is required.

Requires Home Assistant **2025.1.3 or newer**, a working BroadLink integration,
and a reachable `remote.*` entity. CI covers HA 2025.1.3 and 2026.10.4.

## Install

### HACS custom repository

1. Add `https://github.com/zvikarp/ha-plus-ir-mapper` to HACS custom repositories as an
   **Integration** (not an add-on or dashboard card).
2. Install **HA+ IR Mapper** and restart Home Assistant.
3. Follow guided setup below. Existing YAML installations continue to work.

HACS installs directly from this repository's `custom_components` directory;
a GitHub Release is not required for custom-repository installation. This is not
a listing in HACS's default catalog. Versioned ZIP releases remain available
through **Actions → Release**, with patch/minor/major version selection.

### Manual installation

Copy `custom_components/broadlink_ir_mapper` from this repository into your
Home Assistant configuration's `custom_components` directory. Alternatively,
extract `broadlink_ir_mapper.zip` into that same destination. The archive contains
`manifest.json` and Python files directly at its root.

The final path must be `config/custom_components/broadlink_ir_mapper/light.py`.
The `docs` directory contains documentation, not integration code.
Restart Home Assistant after installation or an upgrade.

## In-app setup and multiple lights

Open **HA+ IR Mapper → Add Device** to use the two-tab editor. **Settings** holds
the device name, BroadLink remote, brightness steps, and destination helper.
**Commands** shows a standard 24-button grid. Click a button to learn it, confirm
the test response, or select a learned button to replace, test, or remove it.
Power on and Power off are required. Brightness, colors, and effects are optional.
Colors include presets and custom `#RRGGBB` values.

Select an existing entry in **Save in helper** to add another light to it.
**Save and add another** keeps that helper and remote selected for the next light.
Each light gets its own entity and command mappings. **Edit commands** opens an
existing light in the same editor. Changes take effect on Save.

## Guided setup and learning

1. In **Settings → Devices & services → Add integration**, choose **HA+ IR Mapper**. Select an available BroadLink remote and name the light.
2. Enter its brightness steps: the approximate number of presses from minimum to
   maximum. Leave 10 if unknown; adjust after checking your remote.
3. Choose **Learn or replace a button**, select its function, and submit. Point
   your physical remote at BroadLink and press the matching button when prompted.
4. After learning, the new command is sent once. Confirm physical response to keep
   the mapping. Learn **Power on** and **Power off** before saving; brightness,
   named RGB presets, and effects are optional.
5. Save and open **HA+ IR** in the sidebar. Settings reopens the native integration
   page; use **Configure** on the entry to rename, recalibrate, learn, test, or
   remove individual mappings. Commands are staged until Save. Cancelling does
   not change an existing device; unused learned codes remain in BroadLink storage.

Guided setup stores references to BroadLink's learned commands, not copied base64.
A remote cannot be changed in place because those commands belong to that remote;
create a new device if moving to a different BroadLink. Setup/options require HA
administrator access. Normal controls use HA's standard entity permissions.

### Sidebar and dashboard card

The theme-aware sidebar and card share the same controls: power, learned color
swatches, exact effect names, estimated brightness, remote status, and inline
command errors. Colors/effects are read automatically from entity metadata and
highlight the current assumed selection. Sliders send on release, not every drag
movement. Controls work from the off state and switch the light on as needed.

In the dashboard card picker, select **HA+ IR** and choose an IR light. The first
available IR entity is preselected. No separate card resource installation is
needed, and no preset lists need to be copied into card configuration:

```yaml
type: custom:ha-plus-ir-card
entity: light.bedroom_led_strip
```

**Resync to full brightness** turns the light on and sends enough brightness-up
commands to saturate the hardware at maximum, establishing a full-brightness
baseline. It deliberately changes physical brightness; it cannot read device
state. The same action is available to automations as
`broadlink_ir_mapper.resynchronize`, targeting the light. A learned brightness-up
command is required. After a power reset or physical remote change, resync before
using absolute brightness targets. Results remain approximate if the configured
step count differs from the hardware.

## Configure with YAML (existing installations)

Learn commands with Home Assistant's `remote.learn_command` action using your
BroadLink remote. Copy the base64 code for each learned command from its
`.storage/broadlink_remote_*_codes` file, reading it without editing that file.
The mapper accepts raw base64 and `b64:`-prefixed codes. To reference a command
already learned through BroadLink, use `{device: led_strip, command: power_on}`
instead of a base64 string. The same reference form works for every IR code field.

```yaml
light:
  - platform: broadlink_ir_mapper
    name: Bedroom LED Strip
    unique_id: bedroom_led_strip_ir
    broadlink_remote: remote.broadlink_rm4_remote
    # brightness_steps: 10  # optional calibration; omit for legacy 25-point steps
    ir_codes:
      power_on: "YOUR_BASE64_POWER_ON_CODE"
      power_off: "YOUR_BASE64_POWER_OFF_CODE"
      brightness_up: "YOUR_BASE64_BRIGHTNESS_UP_CODE"      # optional
      brightness_down: "YOUR_BASE64_BRIGHTNESS_DOWN_CODE"  # optional
    colors:  # optional
      - name: Red
        rgb: [255, 0, 0]
        ir_code: "YOUR_BASE64_RED_CODE"
      - name: Green
        rgb: [0, 255, 0]
        ir_code: "YOUR_BASE64_GREEN_CODE"
    effects:  # optional
      - name: Flash
        ir_code: "YOUR_BASE64_FLASH_CODE"
```

Replace every placeholder with an actual learned code before validating the
configuration. Invalid base64, RGB values, and non-remote entity IDs are rejected.
`name`, `broadlink_remote`, and both power codes are required. `unique_id` is
optional but recommended for entity registry management. See
[example-configuration.yaml](docs/example-configuration.yaml) for the same structure.

Use standard `light.turn_on` / `light.turn_off` actions, with `rgb_color`,
`effect`, or `brightness` as appropriate. Requested RGB colors select the closest
configured preset. Selecting a color clears the current effect; selecting an
effect sets its configured name. Unknown effects fail before sending commands.
The RGB Light Button Card can control these entities, but its preset colors and
effects must be configured on the card separately.

## State and failure behavior

- IR is one-way. The entity exposes **assumed state**; a successful service call
  means submission to BroadLink, not confirmation that the light received it.
- A missing, disabled, unknown, or unavailable remote fails the action. Transport
  exceptions propagate to HA. Failed commands do not advance the assumed state;
  earlier successful commands in a multi-command action remain recorded.
- Commands for one light are serialized so simultaneous actions cannot interleave
  its power, brightness, color, and effect sequence.
- Brightness is an estimate on HA's 0–255 scale. YAML defaults to the legacy
  25-point step; optional `brightness_steps` sets the full-range press count. Targets round
  to the nearest relative step; differences below half a step send nothing and
  leave the estimate unchanged. Repeated targets do not oscillate. Targets 1 and
  255 clamp to the endpoints; zero sends the power-off code. The reported value
  follows steps sent and can differ from the target. Remotes
  with different hardware increments will not match this estimate exactly.
- Either brightness code may be configured independently. Requesting a direction
  without its code fails explicitly. RGB mode inherently includes a brightness
  control in HA; a fixed-brightness remote rejects unsupported dimming requests.
- A restart initializes the assumed state to off and brightness to full. No IR is
  sent at startup. Physical remote changes and device power resets cannot be
  detected; send power and settings explicitly to resynchronize.

## Moving from the `ha-plus` repository

Back up your Home Assistant configuration and installed integration files first.
If HACS installed this integration from `zvikarp/ha-plus`, remove that old HACS
installation/custom-repository entry, then add `zvikarp/ha-plus-ir-mapper` as an
Integration and download it **before restarting Home Assistant**. Removing a HACS
installation removes its code; do not delete the integration from HA's Devices &
services, its config entries, or entity registry records. If the old install was
manual, replace the files in the same directory with the new repository's copy.

The domain, config entry version, entity unique IDs, YAML keys, learned-command
references, and installed directory are unchanged. Do not recreate devices or
relearn buttons. After the new files are installed, restart HA and verify the
existing entities and automations. For rollback, restore your backed-up files;
keep HA configuration and BroadLink storage intact.

## Upgrading and rollback

The domain `broadlink_ir_mapper`, YAML keys, and `unique_id` values are unchanged.
Existing installations keep their `custom_components/broadlink_ir_mapper` path;
replace its files from the new source directory or archive, retaining your YAML.
Do not rename existing `unique_id` values or delete entity registry entries.
Restart HA after replacement. To roll back, restore the previous integration
files and restart; no stored data or configuration migration is performed.
The previous legacy light API is unsuitable for recent HA versions, so rolling
back may also require the previous HA version.

## Validation and release

See [RELEASING.md](docs/RELEASING.md) for automated checks, the hardware acceptance
checklist, and the manual draft-release workflow. A version in the manifest is
not proof that a release has been published or tested with hardware.

Report problems with HA version, sanitized configuration, and logs at
[GitHub Issues](https://github.com/zvikarp/ha-plus-ir-mapper/issues). Never include private
Home Assistant storage files in an issue.

## Shared UI development

Edit `src/ir-mapper.js` and run `npm ci`, `npm run build` and `npm test`.
Commit the generated integration frontend with its source. The pinned
[`@ha-plus/ui`](https://github.com/zvikarp/ha-plus-packages) release contains
all styling and shared controls. Add reusable presentation to the package
instead of app-local CSS or style writes. CI checks generated-file drift.
HACS installations contain the complete bundle and require no browser CDN.
