from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class EmbeddedServiceTest(unittest.TestCase):
    def test_copyparty_is_pinned_and_verified(self):
        build = (ROOT / "pi-gen-sources/00-teslausb-tweaks/00-run.sh").read_text()
        setup = (ROOT / "setup/pi/configure-web.sh").read_text()
        version = "v1.20.21"
        digest = "43ac488742715f10ecec03e29f7562d3be66f2976644b3af55d43043fa25c8fa"
        for source in (build, setup):
            self.assertIn(version, source)
            self.assertIn(digest, source)
            self.assertIn("sha256sum -c -", source)

    def test_asset_service_is_confined_to_staging(self):
        setup = (ROOT / "setup/pi/configure-web.sh").read_text()
        service = setup.split("function configure_asset_library () {", 1)[1].split(
            'if [ "${ASSET_LIBRARY_ENABLED:-true}"', 1
        )[0]
        self.assertIn("/mutable/assets/inbox", service)
        self.assertIn("PrivateDevices=true", service)
        self.assertIn("ProtectSystem=strict", service)
        self.assertIn("ReadWritePaths=/mutable/assets", service)
        self.assertIn("MemoryMax=96M", service)
        self.assertNotIn("/backingfiles", service)
        self.assertNotIn("/mnt/lightshow", service)

    def test_asset_proxy_is_loopback_only(self):
        nginx = (ROOT / "teslausb-www/teslausb.nginx").read_text()
        self.assertIn("location /assets/", nginx)
        self.assertIn("proxy_pass http://127.0.0.1:3923/assets/;", nginx)

    def test_offline_game_is_pinned_and_parking_portal_is_offline(self):
        build = (ROOT / "pi-gen-sources/00-teslausb-tweaks/00-run.sh").read_text()
        setup = (ROOT / "setup/pi/configure-web.sh").read_text()
        commit = "478b6ec346e3787f589e4af751378d06ded4cbbc"
        digest = "4f3e35b3b9124c5a5c16231b71684288d8d781c2d534754f6b36119336231e2e"
        for source in (build, setup):
            self.assertIn(commit, source)
            self.assertIn(digest, source)
        parking = (ROOT / "teslausb-www/html/parking/index.html").read_text()
        self.assertNotIn("https://", parking)
        self.assertIn("仅限停车时使用", parking)


if __name__ == "__main__":
    unittest.main()
