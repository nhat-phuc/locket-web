import os
import json
import subprocess
import re
from pathlib import Path

ROOT = Path(".")

# ═══════════════════════════════════════════
# 1. LIỆT KÊ TRANG USER
# ═══════════════════════════════════════════
print("=" * 70)
print("1. DANH SÁCH TRANG NGƯỜI DÙNG")
print("=" * 70)

user_pages = [
    "app/page.tsx",                          # Trang chủ
    "app/bang-gia/page.tsx",                 # Bảng giá
    "app/dang-ky/page.tsx",                  # Đăng ký
    "app/dang-nhap/page.tsx",                # Đăng nhập
    "app/gioi-thieu/page.tsx",               # Giới thiệu
    "app/nap-tien/page.tsx",                 # Nạp tiền
    "app/rut-tien/page.tsx",                 # Rút tiền
    "app/vong-quay/page.tsx",                # Vòng quay
    "app/tai-khoan/page.tsx",                # Tài khoản
    "app/tai-khoan/vi/page.tsx",             # Ví
    "app/tai-khoan/giao-dich/page.tsx",      # Giao dịch
    "app/tai-khoan/don-hang/page.tsx",       # Đơn hàng
    "app/tai-khoan/gioi-thieu/page.tsx",     # Giới thiệu (trong tài khoản)
    "app/tai-khoan/ho-so/page.tsx",          # Hồ sơ
    "app/tai-khoan/cai-dat/page.tsx",        # Cài đặt
    "app/tai-khoan/lich-su-hoa-hong/page.tsx", # Lịch sử hoa hồng
    "app/lien-he/page.tsx",                  # Liên hệ
]

for p in user_pages:
    path = ROOT / p
    if path.exists():
        lines = len(path.read_text().split("\n"))
        size = path.stat().st_size
        print(f"  ✅ {p} ({lines} dòng, {size} bytes)")
    else:
        print(f"  ❌ THIẾU: {p}")

# ═══════════════════════════════════════════
# 2. LIỆT KÊ API NGƯỜI DÙNG
# ═══════════════════════════════════════════
print()
print("=" * 70)
print("2. DANH SÁCH API NGƯỜI DÙNG")
print("=" * 70)

api_paths = []
for root, dirs, files in os.walk("app/api"):
    if "admin" in root:
        continue
    for f in files:
        if f == "route.ts":
            api_paths.append(os.path.join(root, f))

for p in sorted(api_paths):
    print(f"  ✅ {p}")

# ═══════════════════════════════════════════
# 3. TÌM LỖI TRONG CÁC FILE
# ═══════════════════════════════════════════
print()
print("=" * 70)
print("3. TÌM LỖI TRONG CODE")
print("=" * 70)

errors_found = []
for p in user_pages:
    path = ROOT / p
    if not path.exists():
        continue
    content = path.read_text()
    
    # 3a. Check "use client"
    if "useState" in content or "useEffect" in content:
        if not content.startswith('"use client"') and not content.startswith("'use client'"):
            errors_found.append((p, "Thiếu 'use client' nhưng có useState/useEffect"))
    
    # 3b. Check TODO/FIXME
    todos = re.findall(r'//\s*(TODO|FIXME|XXX|HACK)', content)
    if todos:
        errors_found.append((p, f"Có {len(todos)} TODO/FIXME"))
    
    # 3c. Check console.log (nên xóa)
    console_logs = len(re.findall(r'console\.(log|debug)', content))
    if console_logs > 3:
        errors_found.append((p, f"Có {console_logs} console.log (nên xóa)"))
    
    # 3d. Check placeholder
    if "placeholder" in content.lower() and "coming soon" in content.lower():
        errors_found.append((p, "Có 'Coming soon'"))

if errors_found:
    for p, msg in errors_found:
        print(f"  ⚠️  {p}: {msg}")
else:
    print("  ✅ Không phát hiện lỗi rõ ràng")

# ═══════════════════════════════════════════
# 4. CHECK ENV + DB
# ═══════════════════════════════════════════
print()
print("=" * 70)
print("4. KIỂM TRA ENV + DB")
print("=" * 70)

env = ROOT / ".env"
if env.exists():
    content = env.read_text()
    required_vars = [
        "DATABASE_URL",
        "JWT_SECRET",
        "NEXT_PUBLIC_APP_URL",
        "RESEND_API_KEY",
        "TELEGRAM_BOT_TOKEN",
    ]
    for v in required_vars:
        if v in content:
            print(f"  ✅ {v}")
        else:
            print(f"  ⚠️  Thiếu {v}")

# ═══════════════════════════════════════════
# 5. TSC CHECK
# ═══════════════════════════════════════════
print()
print("=" * 70)
print("5. TYPESCRIPT CHECK")
print("=" * 70)

result = subprocess.run(
    ["npx", "tsc", "--noEmit"],
    capture_output=True,
    text=True,
    timeout=120,
)
if result.returncode == 0:
    print("  ✅ TSC PASS — không có lỗi")
else:
    lines = result.stdout.strip().split("\n")
    print(f"  ❌ {len(lines)} lỗi TS:")
    for line in lines[:15]:
        print(f"    {line}")
    if len(lines) > 15:
        print(f"    ... và {len(lines) - 15} dòng nữa")

print()
print("=" * 70)
print("HOÀN THÀNH")
print("=" * 70)
