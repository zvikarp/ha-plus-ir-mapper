"""Panel editor authorization, grouped entities, retries and staged learning."""

from copy import deepcopy
from types import SimpleNamespace
from unittest.mock import Mock, patch
from uuid import uuid4

import pytest
from homeassistant.exceptions import Unauthorized
from pytest_homeassistant_custom_component.common import MockConfigEntry
from test_config_flow import DOMAIN, entry_data

from custom_components.broadlink_ir_mapper.devices import definitions, revision
from custom_components.broadlink_ir_mapper.editor import (
    learn_command,
    list_devices,
    save_device,
)


@pytest.fixture(autouse=True)
def skip_dependencies():
    with patch(
        "homeassistant.config_entries.async_process_deps_reqs", return_value=True
    ):
        yield


def connection(admin=True):
    return SimpleNamespace(
        user=SimpleNamespace(is_admin=admin),
        send_result=Mock(),
        send_error=Mock(),
        async_handle_exception=Mock(),
    )


async def invoke(hass, command, data):
    conn = connection()
    command(hass, conn, {"id": 1, **data})
    await hass.async_block_till_done(wait_background_tasks=True)
    conn.async_handle_exception.assert_not_called()
    return conn


def test_panel_commands_require_admin():
    for command in (list_devices, learn_command, save_device):
        with pytest.raises(Unauthorized):
            command(None, connection(False), {"id": 1})


async def test_add_to_legacy_helper_preserves_identity_and_is_retry_safe(hass):
    original = entry_data()
    entry = MockConfigEntry(domain=DOMAIN, title="Desk lamp", data=original)
    entry.add_to_hass(hass)
    new = {**deepcopy(original), "name": "Shelf lamp"}
    msg = {
        "definition": new,
        "entry_id": entry.entry_id,
        "revision": revision(entry),
        "request_id": str(uuid4()),
    }
    conn = await invoke(hass, save_device, msg)
    conn.send_error.assert_not_called()
    items = definitions(entry)
    assert len(items) == 2
    assert items[0] == original
    assert items[1]["unique_id"] != original["unique_id"]
    assert items[1]["ir_codes"] == original["ir_codes"]
    await invoke(hass, save_device, msg)
    assert len(definitions(entry)) == 2
    changed_retry = {**msg, "definition": {**new, "name": "Different name"}}
    conn = await invoke(hass, save_device, changed_retry)
    assert conn.send_error.call_args.args[1] == "save_failed"
    assert definitions(entry)[1]["name"] == "Shelf lamp"

    stale = {**msg, "request_id": str(uuid4())}
    conn = await invoke(hass, save_device, stale)
    assert conn.send_error.call_args.args[1] == "save_failed"
    assert len(definitions(entry)) == 2


async def test_grouped_helper_creates_all_entities(hass):
    original = entry_data()
    other = {**deepcopy(original), "name": "Shelf lamp", "unique_id": "other-id"}
    entry = MockConfigEntry(domain=DOMAIN, data={"devices": [original, other]})
    entry.add_to_hass(hass)
    hass.states.async_set("remote.test", "on")
    with patch("homeassistant.setup.async_process_deps_reqs", return_value=True):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
    assert hass.states.get("light.desk_lamp").attributes["ir_device_id"] == "fixed-id"
    assert hass.states.get("light.shelf_lamp").attributes["ir_device_id"] == "other-id"
    assert await hass.config_entries.async_unload(entry.entry_id)


async def test_new_helper_save_and_invalid_definition(hass):
    msg = {"definition": entry_data(), "request_id": str(uuid4())}
    with (
        patch(
            "homeassistant.config_entries.async_process_deps_reqs", return_value=True
        ),
        patch(
            "custom_components.broadlink_ir_mapper.async_setup_entry", return_value=True
        ),
    ):
        conn = await invoke(hass, save_device, msg)
        conn.send_error.assert_not_called()
        await invoke(hass, save_device, msg)
    entries = hass.config_entries.async_entries(DOMAIN)
    assert len(entries) == 1
    assert len(definitions(entries[0])) == 1
    invalid = {
        **msg,
        "request_id": str(uuid4()),
        "definition": {**entry_data(), "ir_codes": {}},
    }
    conn = await invoke(hass, save_device, invalid)
    assert conn.send_error.call_args.args[1] == "save_failed"
    assert len(hass.config_entries.async_entries(DOMAIN)) == 1


async def test_learning_does_not_mutate_saved_commands(hass):
    entry = MockConfigEntry(domain=DOMAIN, data=entry_data())
    entry.add_to_hass(hass)
    before = deepcopy(dict(entry.data))
    hass.states.async_set("remote.test", "on")
    calls = []

    async def command(call):
        calls.append((call.service, dict(call.data)))

    hass.services.async_register("remote", "learn_command", command)
    hass.services.async_register("remote", "send_command", command)
    conn = await invoke(hass, learn_command, {"remote": "remote.test"})
    conn.send_error.assert_not_called()
    assert [c[0] for c in calls] == ["learn_command", "send_command"]
    assert calls[0][1]["command"] == calls[1][1]["command"]
    assert entry.data == before
    assert not entry.options


async def test_grouped_options_only_changes_selected_device(hass):
    hass.states.async_set("remote.test", "on")
    first = entry_data()
    second = {**deepcopy(first), "unique_id": "second", "name": "Shelf"}
    entry = MockConfigEntry(domain=DOMAIN, data={"devices": [first, second]})
    entry.add_to_hass(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"device": "second"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"name": "Shelf edited", "brightness_steps": 12}
    )
    await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "finish"}
    )
    items = definitions(entry)
    assert items[0] == first
    assert items[1]["name"] == "Shelf edited"
    assert items[1]["unique_id"] == "second"
