"""Register app-owned frontend assets through the shared HA+ lifecycle."""

from pathlib import Path

from . import DOMAIN
from .ha_plus_frontend import (
    async_register_frontend as register_frontend,
)


async def async_register_frontend(hass):
    root = Path(__file__).parent
    await register_frontend(
        hass,
        domain=DOMAIN,
        module_url="/broadlink_ir_mapper/ir-mapper.js",
        static_paths={
            "/broadlink_ir_mapper/ir-mapper.js": root / "frontend/ir-mapper.js",
            "/broadlink_ir_mapper/icon.png": root / "brand/icon.png",
            "/broadlink_ir_mapper/icon.js": root / "frontend/icon.js",
        },
        webcomponent_name="ha-plus-ir-panel",
        frontend_url_path="ha-plus-ir",
        sidebar_title="HA+ IR Mapper",
        sidebar_icon="ha-plus-ir:logo",
        require_admin=False,
        extra_js_urls=("/broadlink_ir_mapper/icon.js",),
    )
