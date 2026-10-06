import httpx
from config import API_URL

INTERNAL_KEY = "locket-internal-secret-2026"
HEADERS = {"Content-Type": "application/json"}


async def _get(path: str, params: dict = None):
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"{API_URL}{path}", params=params, headers=HEADERS)
        try:
            return r.status_code, r.json()
        except:
            return r.status_code, {}


async def _post(path: str, body: dict, params: dict = None):
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(f"{API_URL}{path}", json=body, params=params, headers=HEADERS)
        try:
            return r.status_code, r.json()
        except:
            return r.status_code, {}


def _admin_headers():
    return {"Content-Type": "application/json", "x-internal-key": INTERNAL_KEY}


# ═══ USER APIs ═══
async def get_user_by_telegram(telegramId: str):
    return await _get("/api/telegram/me", {"telegramId": telegramId})


async def get_balance(email: str):
    return await _get("/api/balance", {"email": email})


async def get_orders(telegramId: str):
    return await _get("/api/telegram/orders", {"telegramId": telegramId})


async def create_recharge(telegramId: str, amount: int):
    return await _post("/api/telegram/create-recharge", {"telegramId": telegramId, "amount": amount})


async def get_recharge_history(telegramId: str):
    return await _get("/api/telegram/recharge-history", {"telegramId": telegramId})


async def check_recharge(orderCode: str, telegramId: str):
    return await _get("/api/telegram/check-recharge", {"orderCode": orderCode, "telegramId": telegramId})


# ═══ ADMIN APIs ═══
async def admin_get(action: str, telegramId: str, extra: dict = None):
    params = {"telegramId": telegramId}
    if extra:
        params.update(extra)
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            f"{API_URL}/api/telegram/admin/{action}",
            params=params,
            headers=_admin_headers(),
        )
        try:
            return r.status_code, r.json()
        except:
            return r.status_code, {}


async def admin_post(action: str, telegramId: str, body: dict):
    params = {"telegramId": telegramId}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(
            f"{API_URL}/api/telegram/admin/{action}",
            params=params,
            json=body,
            headers=_admin_headers(),
        )
        try:
            return r.status_code, r.json()
        except:
            return r.status_code, {}
