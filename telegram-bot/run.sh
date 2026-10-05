#!/bin/bash
cd "$(dirname "$0")"

# Tạo venv nếu chưa có
if [ ! -d "venv" ]; then
    echo "📦 Tạo virtualenv..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "📥 Cài dependencies..."
pip install -q -r requirements.txt

echo "🚀 Chạy bot..."
python bot.py
