"""Verify the manual release policy without publishing or bumping source files."""

import json

import pytest

from scripts.release import prepare


@pytest.fixture
def project(tmp_path):
    source = tmp_path / "custom_components/broadlink_ir_mapper"
    source.mkdir(parents=True)
    (source / "manifest.json").write_text(json.dumps({"version": "1.0.0"}))

    return tmp_path


@pytest.mark.parametrize(
    ("bump", "expected"), [("patch", "1.0.1"), ("minor", "1.1.0"), ("major", "2.0.0")]
)
def test_next_stable_version(project, bump, expected):
    assert prepare(project, bump, [{"tagName": "v1.0.0"}]) == expected
    assert (
        json.loads(
            (
                project / "custom_components/broadlink_ir_mapper/manifest.json"
            ).read_text()
        )["version"]
        == expected
    )


def test_first_or_prepared_version_is_reused(project):
    assert prepare(project, "major", []) == "1.0.0"
    assert (
        prepare(
            project,
            "patch",
            [
                {"tagName": "v0.1.0"},
                {"tagName": "v99.0.0", "isDraft": True},
                {"tagName": "v2.0.0-rc.1", "isPrerelease": True},
                {"tagName": "invalid"},
            ],
        )
        == "1.0.0"
    )


def test_invalid_bump_is_rejected_without_mutation(project):
    manifest = project / "custom_components/broadlink_ir_mapper/manifest.json"
    before = manifest.read_bytes()
    with pytest.raises(ValueError):
        prepare(project, "invalid", [])
    assert manifest.read_bytes() == before
