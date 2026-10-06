import httpx
from config import API_URL, INTERNAL_API_KEY

HEADERS = {"Content-Type": "application/json"}
if INTERNAL_API_KEY:
    HEADERS["x-internal-key"] = INTERNAL_API_KEY


async def _get(path: str, params: dict | None = None):
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(f"{API_URL}{path}", params=params, headers=HEADERS)
        return r.status_code, r.json() if r.text else {}


async def _post(path: str, body: dict):
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(f"{API_URL}{path}", json=body, headers=HEADERS)
        return r.status_code, r.json() if r.text else {}


# ─── USER APIs ───
async def get_user_by_telegram(telegram_id: str):
    """Tìm user theo telegramId"""
    return await _get("/api/telegram/me", {"telegramId": telegram_id})


async def get_balance(email: str):
    return await _get("/api/balance", {"email": email})


async def get_orders(telegram_id: str):
    return await _get("/api/telegram/orders", {"telegramId": telegram_id})


async def create_recharge(telegram_id: str, amount: int):
    return await _post("/api/telegram/create-recharge", {
        "telegramId": telegram_id,
        "amount": amount,
    })


async def generate_link_code(telegram_id: str):
    return await _post("/api/telegram/generate-code", {"telegramId": telegram_id})


# ─── ADMIN APIs ───
async def admin_stats():
    return await _get("/api/admin/stats")


async def admin_users(search: str = ""):
    return await _get("/api/admin/users", {"search": search, "take": "20"})


async def admin_reset_spins(user_id: str):
    return await _post(f"/api/admin/users/{user_id}/reset-spins", {"mode": "reset"})


async def admin_add_spins(user_id: str, count: int):
    return await _post(f"/api/admin/users/{user_id}/reset-spins", {
        "mode": "add",
        "value": count,
    })


async def admin_recharge_user(user_id: str, amount: int, note: str = ""):
    return await _post(f"/api/admin/users/{user_id}/recharge", {
        "amount": amount,
        "note": note,
    })


async def admin_lucky_wheel():
    return await _get("/api/admin/lucky-wheel")


async def admin_orders(status: str = ""):
    return await _get("/api/admin/orders", {"status": status})


async def admin_withdrawals():
    return await _get("/api/admin/withdrawals")


async def check_recharge(orderCode: str, telegramId: str):
    return await _get("/api/telegram/check-recharge", {"orderCode": orderCode, "telegramId": telegramId})


async def get_recharge_history(telegramId: str):
    return await _get("/api/telegram/recharge-history", {"telegramId": telegramId})


# ─── ADMIN APIs (via /api/telegram/admin) ───
INTERNAL_KEY = "locket-internal-secret-2026"


def _admin_headers():
    return {"Content-Type": "application/json", "x-internal-key": INTERNAL_KEY}


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
        return r.status_code, r.json() if r.text else {}


async def admin_post(action: str, telegramId: str, body: dict):
    params = {"telegramId": telegramId}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.post(
            f"{API_URL}/api/telegram/admin/{action}",
            params=params,
            json=body,
            headers=_admin_headers(),
        )
        return r.status_code, r.json() if r.text else {}
