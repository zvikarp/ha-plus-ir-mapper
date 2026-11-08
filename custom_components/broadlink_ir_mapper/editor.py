"""Admin-only device editing and IR learning for the panel command grid."""

import asyncio
from uuid import UUID, uuid4

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components import websocket_api
from homeassistant.exceptions import HomeAssistantError

from . import DOMAIN
from .devices import definitions, revision, validate_definition


def remote_available(hass, entity_id):
    remote = hass.states.get(entity_id)
    if (
        not entity_id.startswith("remote.")
        or remote is None
        or remote.state in ("off", "unknown", "unavailable")
    ):
        raise vol.Invalid("Choose an available BroadLink remote")


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/devices"})
@websocket_api.require_admin
@websocket_api.async_response
async def list_devices(hass, connection, msg):
    connection.send_result(
        msg["id"],
        [
            {
                "entry_id": entry.entry_id,
                "title": entry.title,
                "revision": revision(entry),
                "devices": definitions(entry),
            }
            for entry in hass.config_entries.async_entries(DOMAIN)
        ],
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/learn",
        vol.Required("remote"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def learn_command(hass, connection, msg):
    try:
        remote_available(hass, msg["remote"])
        locks = hass.data.setdefault(f"{DOMAIN}_learn_locks", {})
        lock = locks.setdefault(msg["remote"], asyncio.Lock())
        if lock.locked():
            raise vol.Invalid("This remote is already learning a command")
        async with lock, asyncio.timeout(65):
            ref = {"device": "ha_plus_ir_panel", "command": uuid4().hex}
            await hass.services.async_call(
                "remote",
                "learn_command",
                {"entity_id": msg["remote"], **ref, "command_type": "ir"},
                blocking=True,
            )
            # BroadLink can report a missing capture without raising. Test the
            # reference before offering it for user confirmation and saving.
            await hass.services.async_call(
                "remote",
                "send_command",
                {"entity_id": msg["remote"], **ref},
                blocking=True,
            )
    except (HomeAssistantError, TimeoutError, ValueError, OSError, vol.Invalid) as err:
        connection.send_error(msg["id"], "learn_failed", str(err))
        return
    connection.send_result(msg["id"], ref)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/save_device",
        vol.Required("definition"): dict,
        vol.Required("request_id"): str,
        vol.Optional("entry_id"): str,
        vol.Optional("revision"): str,
        vol.Optional("device_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def save_device(hass, connection, msg):
    lock = hass.data.setdefault(f"{DOMAIN}_save_lock", asyncio.Lock())
    async with lock:
        try:
            request_id = UUID(msg["request_id"]).hex
            # A retried create must not add another light if its first response
            # was lost. The request identity is persisted as the entity identity.
            if "device_id" not in msg:
                for saved_entry in hass.config_entries.async_entries(DOMAIN):
                    saved = next(
                        (
                            d
                            for d in definitions(saved_entry)
                            if d["unique_id"] == request_id
                        ),
                        None,
                    )
                    if saved:
                        retry_data = {
                            **msg["definition"],
                            "unique_id": saved["unique_id"],
                            "learned_device": saved["learned_device"],
                        }
                        if validate_definition(retry_data) != saved:
                            raise vol.Invalid(
                                "This light was already saved. Reopen it to make changes"
                            )
                        connection.send_result(
                            msg["id"],
                            {
                                "entry_id": saved_entry.entry_id,
                                "revision": revision(saved_entry),
                            },
                        )
                        return
            entry = None
            if "entry_id" in msg:
                entry = hass.config_entries.async_get_entry(msg["entry_id"])
                if entry is None or entry.domain != DOMAIN:
                    raise vol.Invalid("The selected helper no longer exists")
                if msg.get("revision") != revision(entry):
                    raise vol.Invalid(
                        "This helper changed. Reopen the editor and retry"
                    )
            elif "device_id" in msg:
                raise vol.Invalid("Choose the helper containing this device")
            data = dict(msg["definition"])
            items = definitions(entry) if entry else []
            previous = next(
                (d for d in items if d["unique_id"] == msg.get("device_id")), None
            )
            if "device_id" in msg and previous is None:
                raise vol.Invalid("This device no longer exists")
            if previous:
                if data["broadlink_remote"] != previous["broadlink_remote"]:
                    raise vol.Invalid(
                        "Existing commands belong to their original remote"
                    )
                data["unique_id"] = previous["unique_id"]
                data["learned_device"] = previous["learned_device"]
            else:
                data["unique_id"] = request_id
                data["learned_device"] = "ha_plus_ir_" + request_id
            data = validate_definition(data)
            if previous:
                items = [
                    data if d["unique_id"] == data["unique_id"] else d for d in items
                ]
            else:
                items.append(data)
            if entry:
                hass.config_entries.async_update_entry(
                    entry, options={"devices": items}
                )
            else:
                result = await hass.config_entries.flow.async_init(
                    DOMAIN,
                    context={"source": config_entries.SOURCE_IMPORT},
                    data={"devices": items},
                )
                entry = result.get("result")
                if entry is None:
                    raise vol.Invalid("Could not create the helper")
        except (vol.Invalid, KeyError, TypeError, ValueError) as err:
            connection.send_error(msg["id"], "save_failed", str(err))
            return
        connection.send_result(
            msg["id"], {"entry_id": entry.entry_id, "revision": revision(entry)}
        )


def async_register_editor(hass):
    for command in (list_devices, learn_command, save_device):
        websocket_api.async_register_command(hass, command)
