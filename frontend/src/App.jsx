import { useEffect, useState } from "react";
import "./app.css";
import logo from "./assets/Parking.png";

/* =========================
   CONFIG
   ========================= */
const API = import.meta.env.VITE_API_URL;

export default function App() {

  /* =========================
     GLOBAL UI STATE
     ========================= */
  const [branch, setBranch] = useState("MKT");          // Current location (MKT / BGC)
  const [slots, setSlots] = useState([]);               // Slots fetched from API
  const [selectedSlot, setSelectedSlot] = useState(null); // Slot selected for booking
  const [msg, setMsg] = useState("");                   // User feedback message
  const [processing, setProcessing] = useState(false);  // Payment loading state

  /* =========================
     BOOKING FORM STATE
     ========================= */
  const [form, setForm] = useState({
    renterName: "",
    renterEmail: "",
    renterContact: "",
    plateNumber: "",
    durationMonths: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolder: ""
  });

  /* =========================
     EFFECT: LOAD SLOTS
     Runs whenever branch changes
     ========================= */
  useEffect(() => {
    loadSlots();
  }, [branch]);

  /* =========================
     EFFECT: RESET SELECTION
     Prevents cross-branch booking
     ========================= */
  useEffect(() => {
    setSelectedSlot(null);
    setMsg("");
  }, [branch]);

  /* =========================
     API: FETCH SLOTS
     ========================= */
  async function loadSlots() {
    const res = await fetch(`${API}/slots?branch=${branch}`);
    setSlots(await res.json());
  }

  /* =========================
     API: RESET DEMO DATA
     ========================= */
  async function resetDemo() {
    await fetch(`${API}/reset`, { method: "POST" });
    loadSlots();
  }

  /* =========================
     INPUT HELPERS
     ========================= */
  function formatCard(v) {
    return v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(v) {
    v = v.replace(/\D/g, "");
    return v.length <= 2 ? v : v.slice(0, 2) + "/" + v.slice(2, 4);
  }

  /* =========================
     PAYMENT HANDLER
     ========================= */
  async function payNow() {
    setProcessing(true);
    setMsg("Processing payment…");

    const res = await fetch(`${API}/slots/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotCode: selectedSlot.slotCode,
        ...form,
        cardNumber: form.cardNumber.replace(/\s/g, "")
      })
    });

    const text = await res.text();
    setProcessing(false);

    if (!res.ok) return setMsg(text);

    setMsg("Payment successful! Slot booked.");
    setSelectedSlot(null);

    // Reset form after success
    setForm({
      renterName: "",
      renterEmail: "",
      renterContact: "",
      plateNumber: "",
      durationMonths: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      cardHolder: ""
    });

    loadSlots();
  }

  /* =========================
     UI RENDER
     ========================= */
  return (
    <>
      {/* =========================
          HEADER
         ========================= */}
      <header className="topbar">
        <img src={logo} alt="ParkSense Solutions" />
      </header>

      <main className="app">

        {/* =========================
            BRANCH TOGGLE
           ========================= */}
        <div className="branch-toggle">
          <button
            className={branch === "MKT" ? "active" : ""}
            onClick={() => setBranch("MKT")}
          >
            Makati
          </button>
          <button
            className={branch === "BGC" ? "active" : ""}
            onClick={() => setBranch("BGC")}
          >
            BGC
          </button>
        </div>

        {/* =========================
            RESET DEMO
           ========================= */}
        <button className="danger" onClick={resetDemo}>
          Reset Demo
        </button>

        {/* =========================
            AVAILABLE SLOTS
           ========================= */}
        <h2>Available Slots</h2>
        <div className="grid">
          {slots
            .filter(s => !s.isOccupied)
            .map(s => (
              <div
                key={s.slotCode}
                className="card"
                onClick={() => setSelectedSlot(s)}
              >
                <b>{s.slotCode} – {s.slotName}</b>
                <div>Recommended vehicle: {s.recommendedVehicle}</div>
                <div>Size: {s.lengthFt} ft × {s.widthFt} ft</div>
              </div>
            ))}
        </div>

        {/* =========================
            BOOKING FORM
           ========================= */}
        {selectedSlot && (
          <section className="booking">
            <h2>Book – {selectedSlot.slotCode}</h2>

            <input placeholder="Name" value={form.renterName}
              onChange={e => setForm({ ...form, renterName: e.target.value })} />
            <input placeholder="Email" value={form.renterEmail}
              onChange={e => setForm({ ...form, renterEmail: e.target.value })} />
            <input placeholder="Contact" value={form.renterContact}
              onChange={e => setForm({ ...form, renterContact: e.target.value })} />
            <input placeholder="Plate Number" value={form.plateNumber}
              onChange={e => setForm({ ...form, plateNumber: e.target.value })} />
            <input placeholder="Duration (30-day cycle)" value={form.durationMonths}
              onChange={e => setForm({ ...form, durationMonths: e.target.value })} />

            <h3>Payment</h3>
            <input placeholder="Card Number" value={form.cardNumber}
              onChange={e => setForm({ ...form, cardNumber: formatCard(e.target.value) })} />
            <input placeholder="MM/YY" value={form.expiry}
              onChange={e => setForm({ ...form, expiry: formatExpiry(e.target.value) })} />
            <input type="password" placeholder="CVV" value={form.cvv}
              onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "") })} />
            <input placeholder="Cardholder Name" value={form.cardHolder}
              onChange={e => setForm({ ...form, cardHolder: e.target.value })} />

            <button disabled={processing} onClick={payNow}>
              {processing ? "Processing…" : "Pay Now"}
            </button>

            {msg && <p className="msg">{msg}</p>}
          </section>
        )}

        {/* =========================
            OCCUPIED SLOTS
           ========================= */}
        <h2>Occupied Slots</h2>
        <div className="grid">
          {slots
            .filter(s => s.isOccupied)
            .map(s => (
              <div key={s.slotCode} className="card occupied">
                <b>{s.slotCode} – {s.slotName}</b>
                <div>Client: {s.renterName}</div>
                <div>Plate: {s.plateNumber}</div>
                {typeof s.daysLeft === "number" && (
                  <div>Days left: {s.daysLeft}</div>
                )}
                <div>Size: {s.lengthFt} ft × {s.widthFt} ft</div>
              </div>
            ))}
        </div>

      </main>
    </>
  );
}













