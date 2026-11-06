# IR mapper release checks

## Automated verification

From the repository root, create a Python 3.13 environment and run:

```sh
pip install -r requirements-ir-minimum.txt
ruff check custom_components/broadlink_ir_mapper tests/ir_mapper scripts
ruff format --check custom_components/broadlink_ir_mapper tests/ir_mapper scripts
npm ci --ignore-scripts
npm test
pytest
python scripts/release.py package
```

Repeat in a separate Python 3.14 environment using
`requirements-ir-current.txt`. CI runs both pinned Home Assistant versions and
uploads an installable ZIP artifact. Tests use Home Assistant's real YAML loader,
entity registration, and light services; remote transmission is simulated.

## BroadLink hardware acceptance (required before publishing)

Record HA version, BroadLink model/firmware, light model, date, tester, and results
in the release notes. These checks require a physical device and are not covered
by CI. No completed hardware test is claimed by this change.

1. Install the generated archive into a clean HA configuration. Confirm YAML
   validation, entity creation, and its configured unique ID.
2. Learn actual IR codes and test power on/off, every configured color and effect,
   with both raw and `b64:`-prefixed configuration values.
3. Test small brightness changes, larger changes, full range, brightness zero,
   and a remote with only one configured brightness direction. Compare physical
   behavior with the documented approximation.
4. Disconnect the BroadLink device. Confirm action errors and that failed sends
   do not report successful power/color/brightness changes. Reconnect and retry.
5. Trigger overlapping on/color/effect/off actions. Confirm transmission order
   and final physical state.
6. Restart HA while the light is on. Confirm no startup IR traffic, documented
   initial assumed state, and successful explicit resynchronization.
7. Upgrade an existing YAML installation. Confirm entity ID/unique ID continuity.
   Restore its previous files and compatible HA version to verify rollback.
8. Complete native setup and options editing, learning all power/color/effect
   types; test learning timeout, cancellation, and an unavailable remote. Verify
   the automatic test send physically before confirming each mapping. Cancel an
   options edit and confirm existing controls are unaffected.
9. Check the HA+ IR panel and dashboard card in light/dark themes at mobile and
   desktop widths; verify keyboard controls, errors, preset/effect selection,
   unavailable state, one slider submission per drag, and resynchronization.
10. Verify HACS custom-repository installation from `zvikarp/ha-plus-ir-mapper`
   and subsequent updates. HACS installs from source; independently verify the
   release ZIP for manual installation when publishing a release.

## Build and publish

HACS installs the integration directly from source, including before a first
release. The integration is under `custom_components/broadlink_ir_mapper`; add-on and
card files are not included in its archive. `scripts/release.py package` creates
`broadlink_ir_mapper.zip`, with only integration files at the archive root.

There are only two workflows: **CI** and **Release**. CI checks pull requests and
`main`, and produces a test ZIP artifact.

On `main`, run **Actions → Release → Run workflow** and choose **patch**, **minor**,
or **major**. Release runs CI first, prepares the next stable version, commits a
manifest bump when needed, builds `broadlink_ir_mapper.zip`, and publishes a
GitHub Release with generated notes. Like HA+ Modes, a source version already
ahead of the latest stable release is released first (including the initial
1.0.0); otherwise the selected bump applies to the latest stable version. Drafts,
prereleases, and non-version tags do not determine the next stable version.

HACS follows the published releases. Its source installation remains available
before the first release; the attached ZIP also supports manual installation.
Publishing a release manually runs CI and attaches the archive from that tag;
a mismatched tag/manifest version is rejected. No release is published merely by
merging a PR, and existing tags/releases are not overwritten. Complete the
hardware acceptance checks before publishing; the workflow does not claim a
physical hardware test.
