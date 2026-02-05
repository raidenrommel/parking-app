const API_BASE =
  "https://3508emwh93.execute-api.ap-southeast-1.amazonaws.com";

export async function getSlots(branch) {
  const res = await fetch(`${API_BASE}/slots?branch=${branch}`);
  if (!res.ok) throw new Error("Failed to load slots");
  return res.json();
}

export async function registerSlot(payload) {
  const res = await fetch(`${API_BASE}/slots/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Register failed");
}

export async function cancelSlot(slotCode) {
  const res = await fetch(`${API_BASE}/slots/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slotCode })
  });
  if (!res.ok) throw new Error("Cancel failed");
}
