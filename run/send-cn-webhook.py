#!/usr/bin/env python3
"""Send a UTF-8 TeslaUSB notification to a Chinese group robot webhook."""

from __future__ import annotations

import argparse
import base64
import hashlib
import hmac
import json
import time
import urllib.error
import urllib.parse
import urllib.request


def dingtalk_url(webhook: str, secret: str) -> str:
    if not secret:
        return webhook
    timestamp = str(int(time.time() * 1000))
    string_to_sign = f"{timestamp}\n{secret}".encode()
    signature = base64.b64encode(
        hmac.new(secret.encode(), string_to_sign, hashlib.sha256).digest()
    ).decode()
    separator = "&" if "?" in webhook else "?"
    return (
        f"{webhook}{separator}timestamp={timestamp}"
        f"&sign={urllib.parse.quote_plus(signature)}"
    )


def feishu_signature(secret: str, timestamp: str) -> str:
    if not secret:
        return ""
    string_to_sign = f"{timestamp}\n{secret}".encode()
    return base64.b64encode(hmac.new(string_to_sign, digestmod=hashlib.sha256).digest()).decode()


def request_for(provider: str, webhook: str, secret: str, text: str) -> tuple[str, dict]:
    if provider == "dingtalk":
        return dingtalk_url(webhook, secret), {
            "msgtype": "text",
            "text": {"content": text},
        }
    if provider == "wecom":
        return webhook, {
            "msgtype": "text",
            "text": {"content": text},
        }
    if provider == "feishu":
        payload: dict = {"msg_type": "text", "content": {"text": text}}
        if secret:
            timestamp = str(int(time.time()))
            payload.update({"timestamp": timestamp, "sign": feishu_signature(secret, timestamp)})
        return webhook, payload
    raise ValueError(f"不支持的通知通道：{provider}")


def response_succeeded(provider: str, payload: dict) -> bool:
    if provider in {"dingtalk", "wecom"}:
        return payload.get("errcode") == 0
    return payload.get("code", payload.get("StatusCode")) == 0


def send(provider: str, webhook: str, secret: str, title: str, message: str) -> None:
    url, payload = request_for(provider, webhook, secret, f"{title} {message}".strip())
    request = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        raise RuntimeError(f"{provider} 通知请求失败：{error}") from error
    if not response_succeeded(provider, result):
        error_code = result.get("errcode", result.get("code", result.get("StatusCode")))
        error_message = result.get("errmsg", result.get("msg", result.get("StatusMessage", "未知错误")))
        raise RuntimeError(f"{provider} 通知被拒绝：{error_code} {error_message}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("provider", choices=("dingtalk", "wecom", "feishu"))
    parser.add_argument("webhook")
    parser.add_argument("secret")
    parser.add_argument("title")
    parser.add_argument("message")
    args = parser.parse_args()
    send(args.provider, args.webhook, args.secret, args.title, args.message)


if __name__ == "__main__":
    main()
