import importlib.util
import json
import pathlib
import unittest
from unittest import mock


MODULE_PATH = pathlib.Path(__file__).parents[1] / "run" / "send-cn-webhook.py"
SPEC = importlib.util.spec_from_file_location("send_cn_webhook", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ChineseWebhookTest(unittest.TestCase):
    def test_utf8_payloads(self):
        for provider in ("dingtalk", "wecom", "feishu"):
            _, payload = MODULE.request_for(provider, "https://example.invalid", "", "归档完成")
            encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.assertIn("归档完成".encode("utf-8"), encoded)

    @mock.patch.object(MODULE.time, "time", return_value=1700000000)
    def test_dingtalk_signed_url(self, _):
        url = MODULE.dingtalk_url("https://example.invalid?access_token=x", "secret")
        self.assertIn("timestamp=1700000000000", url)
        self.assertIn("&sign=", url)

    @mock.patch.object(MODULE.time, "time", return_value=1700000000)
    def test_feishu_signed_body(self, _):
        _, payload = MODULE.request_for("feishu", "https://example.invalid", "secret", "测试")
        self.assertEqual(payload["timestamp"], "1700000000")
        self.assertTrue(payload["sign"])

    def test_provider_responses(self):
        self.assertTrue(MODULE.response_succeeded("dingtalk", {"errcode": 0}))
        self.assertTrue(MODULE.response_succeeded("wecom", {"errcode": 0}))
        self.assertTrue(MODULE.response_succeeded("feishu", {"code": 0}))
        self.assertFalse(MODULE.response_succeeded("feishu", {"code": 19001}))


if __name__ == "__main__":
    unittest.main()
