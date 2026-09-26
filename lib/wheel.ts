export interface WheelItem {
  id: number;
  label: string;
  value: number;
  color: string;
  weight: number;
  type: "cash" | "voucher" | "empty" | "lucky";
}

export const WHEEL_ITEMS: WheelItem[] = [
  { id: 0, label: "10.000đ", value: 10000, color: "#a78bfa", weight: 25, type: "cash" },
  { id: 1, label: "Chúc may mắn", value: 0, color: "#6b7280", weight: 20, type: "empty" },
  { id: 2, label: "20.000đ", value: 20000, color: "#f472b6", weight: 15, type: "cash" },
  { id: 3, label: "Voucher 5%", value: 0, color: "#60a5fa", weight: 12, type: "voucher" },
  { id: 4, label: "50.000đ", value: 50000, color: "#34d399", weight: 8, type: "cash" },
  { id: 5, label: "Chúc may mắn", value: 0, color: "#6b7280", weight: 10, type: "empty" },
  { id: 6, label: "100.000đ", value: 100000, color: "#fbbf24", weight: 3, type: "cash" },
  { id: 7, label: "Voucher 10%", value: 0, color: "#ec4899", weight: 7, type: "voucher" },
];

export const MAX_SPINS_PER_DAY = 3;
export const STORAGE_KEY = "locket_spin_data";
export const HISTORY_KEY = "locket_spin_history";

export interface SpinData {
  date: string;
  spins: number;
}

export interface SpinHistory {
  id: string;
  label: string;
  value: number;
  type: string;
  date: string;
}

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getSpinData(): SpinData {
  if (typeof window === "undefined") return { date: getTodayStr(), spins: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getTodayStr(), spins: 0 };
    const data = JSON.parse(raw) as SpinData;
    if (data.date !== getTodayStr()) {
      const reset = { date: getTodayStr(), spins: 0 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
      return reset;
    }
    return data;
  } catch {
    return { date: getTodayStr(), spins: 0 };
  }
}

export function saveSpinData(spins: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayStr(), spins }));
}

export function getHistory(): SpinHistory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistory(item: SpinHistory) {
  if (typeof window === "undefined") return;
  const history = getHistory();
  history.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function pickRandomItem(): WheelItem {
  const totalWeight = WHEEL_ITEMS.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of WHEEL_ITEMS) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return WHEEL_ITEMS[0];
}

export function getTargetRotation(itemId: number, currentRotation: number): number {
  const sliceAngle = 360 / WHEEL_ITEMS.length;
  const targetAngle = 360 - (itemId * sliceAngle + sliceAngle / 2);
  const extraSpins = 5 + Math.floor(Math.random() * 3);
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const targetMod = ((targetAngle % 360) + 360) % 360;
  const delta = (targetMod - currentMod + 360) % 360;
  return currentRotation + extraSpins * 360 + delta;
}
