"""Release archive and upgrade identity checks."""

import json
from pathlib import Path
from zipfile import ZipFile

import pytest

from scripts.release import package

ROOT = Path(__file__).resolve().parents[2]


def test_release_archive_and_tag_guard(tmp_path):
    manifest = json.loads(
        (ROOT / "custom_components/broadlink_ir_mapper/manifest.json").read_text()
    )
    output = tmp_path / "broadlink_ir_mapper.zip"
    package(ROOT, output, f"v{manifest['version']}")
    with ZipFile(output) as archive:
        names = archive.namelist()
        assert {
            "manifest.json",
            "__init__.py",
            "light.py",
            "brand/icon.png",
            "config_flow.py",
            "frontend/ir-mapper.js",
            "services.yaml",
            "translations/en.json",
        } <= set(names)
        assert all(
            "__pycache__" not in name and not name.endswith(".pyc") for name in names
        )
        assert (
            json.loads(archive.read("manifest.json"))["domain"] == "broadlink_ir_mapper"
        )
        assert archive.testzip() is None
    with pytest.raises(ValueError, match="tag must match"):
        package(ROOT, output, "v999.0.0")
