#!/usr/bin/env python3
"""Sign and send a private Bitzoom REST request using only the Python standard library."""

import hashlib
import hmac
import json
import os
import secrets
import sys
import time
from urllib.parse import parse_qsl, quote_plus
from urllib.request import Request, urlopen


def canonical_query(raw_query: str) -> str:
    pairs = parse_qsl(raw_query, keep_blank_values=True)
    pairs.sort(key=lambda pair: (pair[0], pair[1]))
    return "&".join(
        f"{quote_plus(key)}={quote_plus(value)}" for key, value in pairs
    )


def sign(
    secret: str,
    timestamp: str,
    nonce: str,
    recv_window: str,
    method: str,
    path: str,
    raw_query: str,
    body: bytes,
) -> str:
    body_hash = hashlib.sha256(body).hexdigest()
    payload = "\n".join(
        [
            timestamp,
            nonce,
            recv_window,
            method.upper(),
            path,
            canonical_query(raw_query),
            body_hash,
        ]
    ).encode()
    return hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()


def run_vectors(vector_path: str) -> None:
    with open(vector_path, encoding="utf-8") as vector_file:
        vectors = json.load(vector_file)
    signatures = {
        vector["name"]: sign(
            vector["secret"],
            vector["timestamp"],
            vector["nonce"],
            vector["recvWindow"],
            vector["method"],
            vector["path"],
            vector["rawQuery"],
            vector["body"].encode(),
        )
        for vector in vectors
    }
    print(json.dumps(signatures, separators=(",", ":")))


def main() -> None:
    if len(sys.argv) == 3 and sys.argv[1] == "--vectors":
        run_vectors(sys.argv[2])
        return

    api_url = os.environ.get("BITZOOM_HMAC_API_URL", "https://api1.riverwa.com").rstrip("/")
    api_key = os.environ["BITZOOM_API_KEY"]
    api_secret = os.environ["BITZOOM_API_SECRET"]
    path = "/api/v1/order"
    raw_query = ""
    body = json.dumps(
        {
            "symbol": "BTCUSDT",
            "side": "BUY",
            "type": "LIMIT",
            "quantity": "0.001",
            "price": "70000",
            "clientOrderId": "bot-1234567890123",
        },
        separators=(",", ":"),
    ).encode()
    timestamp = str(int(time.time() * 1000))
    nonce = secrets.token_hex(16)
    recv_window = "5000"
    signature = sign(
        api_secret,
        timestamp,
        nonce,
        recv_window,
        "POST",
        path,
        raw_query,
        body,
    )
    request = Request(
        api_url + path,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "X-BZ-APIKEY": api_key,
            "X-BZ-TIMESTAMP": timestamp,
            "X-BZ-NONCE": nonce,
            "X-BZ-RECVWINDOW": recv_window,
            "X-BZ-SIGNATURE": signature,
        },
    )
    with urlopen(request, timeout=15) as response:
        payload = json.loads(response.read())
        if payload.get("success") is False or int(payload.get("code", 0) or 0) != 0:
            raise RuntimeError(payload.get("errorMessage") or "Bitzoom rejected the request")
        print(f"Request succeeded: HTTP {response.status}")


if __name__ == "__main__":
    main()
