"""Device definitions shared by native setup and the panel editor."""

import hashlib
import json
from copy import deepcopy

import voluptuous as vol

from .light import PLATFORM_SCHEMA


def definitions(entry):
    """Retain the original entity identity when a legacy helper gains devices."""
    data = deepcopy({**entry.data, **entry.options})
    return data["devices"] if "devices" in data else [data]


def revision(entry):
    return hashlib.sha256(
        json.dumps({**entry.data, **entry.options}, sort_keys=True).encode()
    ).hexdigest()


def validate_definition(data):
    data = deepcopy(data)
    learned_device = data.pop("learned_device")
    if not isinstance(learned_device, str) or not learned_device:
        raise vol.Invalid("Missing learned device")
    if not isinstance(data.get("name"), str) or not data["name"].strip():
        raise vol.Invalid("Enter a device name")
    data["name"] = data["name"].strip()
    data = PLATFORM_SCHEMA({"platform": "broadlink_ir_mapper", **data})
    data.pop("platform")
    data["learned_device"] = learned_device
    return data
