import os
import re
import subprocess
from pathlib import Path
from collections import defaultdict

ROOT = Path(".")

# ═══════════════════════════════════════════════════════
# 1. CẤU TRÚC PROJECT
# ═══════════════════════════════════════════════════════
print("=" * 70)
print("1. CẤU TRÚC PROJECT")
print("=" * 70)

def count_files(folder, pattern):
    p = ROOT / folder
    if not p.exists():
        return 0
    return sum(1 for f in p.rglob(pattern) if "node_modules" not in str(f))

print(f"API routes:      {count_files('app/api', 'route.ts')}")
print(f"Pages:           {count_files('app', 'page.tsx')}")
print(f"Layouts:         {count_files('app', 'layout.tsx')}")
print(f"Lib files:       {count_files('lib', '*.ts')}")
print(f"Components:      {count_files('components', '*.tsx')}")
print(f"Prisma models:   {len(re.findall(r'^model ', (ROOT/'prisma/schema.prisma').read_text(), re.M))}")

# ═══════════════════════════════════════════════════════
# 2. FILE BACKUP CẦN XÓA
# ═══════════════════════════════════════════════════════
print()
print("=" * 70)
print("2. FILE BACKUP CẦN XÓA (giảm rác project)")
print("=" * 70)

backups = []
for f in ROOT.rglob("*"):
    if "node_modules" in str(f) or ".next" in str(f) or ".git" in str(f):
        continue
    name = f.name
    if ".bak" in name or name.endswith(".disabled") or name.endswith(".old"):
        backups.append(f)

if backups:
    print(f"⚠️  Tìm thấy {len(backups)} file backup:")
    by_ext = defaultdict(list)
    for b in backups:
        by_ext[b.suffix or ".noext"].append(b)
    for ext, files in sorted(by_ext.items()):
        print(f"  {ext}: {len(files)} files")
        for f in files[:3]:
            print(f"    - {f}")
        if len(files) > 3:
            print(f"    ... và {len(files) - 3} file khác")
else:
    print("✅ Không có file backup")

# ═══════════════════════════════════════════════════════
# 3. FILE BẮT BUỘC CHO REFERRAL
# ═══════════════════════════════════════════════════════
print()
print("=" * 70)
print("3. FILE REFERRAL — KIỂM TRA TỒN TẠI")
print("=" * 70)

required = [
    "lib/config.ts",
    "lib/commission.ts",
    "app/api/auth/register/route.ts",
    "app/api/auth/me/route.ts",
    "app/api/referral/stats/route.ts",
    "app/api/referral/my/route.ts",
    "app/api/referral/change-code/route.ts",
    "app/api/referral/commission-history/route.ts",
    "app/api/admin/referral/route.ts",
    "app/api/admin/referral/users/route.ts",
    "app/api/admin/referral/users/[id]/route.ts",
    "app/api/admin/referral/users/[id]/reset-code/route.ts",
    "app/api/sepay-webhook/route.ts",
    "app/admin/referral/page.tsx",
    "app/admin/referral/users/page.tsx",
    "app/gioi-thieu/page.tsx",
    "app/tai-khoan/gioi-thieu/page.tsx",
    "app/dang-ky/page.tsx",
    "scripts/backfill-referral-codes.ts",
]

for path in required:
    p = ROOT / path
    if p.exists():
        size = p.stat().st_size
        print(f"  ✅ {path} ({size} bytes)")
    else:
        print(f"  ❌ THIẾU: {path}")

# ═══════════════════════════════════════════════════════
# 4. GREP CÁC DẤU HIỆU QUAN TRỌNG
# ═══════════════════════════════════════════════════════
print()
print("=" * 70)
print("4. KIỂM TRA LOGIC REFERRAL")
print("=" * 70)

checks = [
    ("REFERRAL_COMMISSION = 30000", "lib/config.ts"),
    ("balance: { increment", "lib/commission.ts"),
    ("referralCode: newRefCode", "app/api/auth/register/route.ts"),
    ("referredBy: referrer", "app/api/auth/register/route.ts"),
    ("processReferralCommission", "app/api/sepay-webhook/route.ts"),
    ("Lazy-generate", "app/api/auth/me/route.ts"),
]

for pattern, file in checks:
    p = ROOT / file
    if not p.exists():
        print(f"  ❌ {file} không tồn tại")
        continue
    content = p.read_text()
    if pattern in content:
        print(f"  ✅ {pattern}  trong {file}")
    else:
        print(f"  ❌ {pattern}  KHÔNG CÓ trong {file}")

# ═══════════════════════════════════════════════════════
# 5. CẢNH BÁO BẢO MẬT
# ═══════════════════════════════════════════════════════
print()
print("=" * 70)
print("5. CẢNH BÁO BẢO MẬT")
print("=" * 70)

# Check .env
env = ROOT / ".env"
if env.exists():
    content = env.read_text()
    for key in ["DATABASE_URL", "RESEND_API_KEY", "TELEGRAM_BOT_TOKEN", "PAYMENT_WEBHOOK_SECRET"]:
        if key in content:
            print(f"  ✅ Có {key}")
        else:
            print(f"  ⚠️  Thiếu {key}")
else:
    print("  ❌ Không có file .env")

# Check hardcoded secret
issues = []
for f in (ROOT / "app").rglob("*.ts"):
    if "node_modules" in str(f):
        continue
    content = f.read_text()
    if re.search(r'(secret|password|api_key)\s*[:=]\s*["\'][a-zA-Z0-9]{20,}', content, re.I):
        issues.append(str(f))

if issues:
    print(f"  ⚠️  {len(issues)} file có thể hardcode secret:")
    for f in issues[:5]:
        print(f"    - {f}")
else:
    print("  ✅ Không phát hiện secret hardcoded")

# ═══════════════════════════════════════════════════════
# 6. TSC CHECK
# ═══════════════════════════════════════════════════════
print()
print("=" * 70)
print("6. TYPESCRIPT CHECK")
print("=" * 70)

result = subprocess.run(
    ["npx", "tsc", "--noEmit"],
    capture_output=True,
    text=True,
    timeout=120,
)
if result.returncode == 0:
    print("  ✅ TypeScript PASS — không có lỗi")
else:
    print(f"  ❌ Có lỗi TypeScript:")
    # Chỉ in 10 dòng đầu
    lines = result.stdout.strip().split("\n")
    for line in lines[:10]:
        print(f"    {line}")
    if len(lines) > 10:
        print(f"    ... và {len(lines) - 10} dòng nữa")

# ═══════════════════════════════════════════════════════
# 7. BUILD CHECK (tùy chọn — chậm)
# ═══════════════════════════════════════════════════════
print()
print("=" * 70)
print("7. KẾT LUẬN")
print("=" * 70)
print("""
Nếu TSC PASS → code OK, chỉ cần DB hoạt động.

Nếu TSC FAIL → xem danh sách lỗi ở mục 6.

Việc cần làm:
  1. Xóa file backup nếu có nhiều (mục 2)
  2. Fix lỗi TS nếu có (mục 6)
  3. Bổ sung .env nếu thiếu (mục 5)
  4. Kiểm tra Neon DB đã sống lại chưa
""")
