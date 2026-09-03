import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home,
  Leaf,
  Camera,
  MessageCircle,
  CloudSun,
  ShoppingCart,
  ArrowLeft,
  User,
  Stethoscope,
  RefreshCw,
  Send,
  Plus,
  Minus,
  ExternalLink,
  MapPin,
  X,
} from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_BASE ||
  "https://kisansathi-ai-q9b0.onrender.com"
).replace(/\/$/, "");

type Tab =
  | "home"
  | "mandi"
  | "weather"
  | "crops"
  | "doctor"
  | "store"
  | "profile"
  | "cart"
  | "chat";

type Product = {
  id: number;
  name: string;
  price: number;
  unit: string;
  emoji: string;
};

type Crop = {
  id: number;
  name: string;
  area: string;
  note: string;
};

type ChatMsg = {
  from: "user" | "ai";
  text: string;
};

type MandiRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
};

type WeatherData = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
};

/* ================= PRODUCTS ================= */

const products: Product[] = [
  {
    id: 1,
    name: "नीम ऑयल",
    price: 299,
    unit: "1 लीटर",
    emoji: "🌿",
  },
  {
    id: 2,
    name: "जैविक खाद",
    price: 499,
    unit: "25 kg",
    emoji: "🌱",
  },
  {
    id: 3,
    name: "फसल सुरक्षा किट",
    price: 699,
    unit: "1 किट",
    emoji: "🧴",
  },
  {
    id: 4,
    name: "बीज उपचार किट",
    price: 399,
    unit: "1 किट",
    emoji: "🌾",
  },
];

/* ================= SCHEMES ================= */

const schemes = [
  {
    icon: "🌾",
    title: "PM-KISAN",
    text: "किसानों के लिए आर्थिक सहायता",
    url: "https://pmkisan.gov.in/",
  },
  {
    icon: "💧",
    title: "प्रधानमंत्री कृषि सिंचाई योजना",
    text: "सिंचाई सुविधा से जुड़ी जानकारी",
    url: "https://pmksy.gov.in/",
  },
  {
    icon: "🌱",
    title: "प्रधानमंत्री फसल बीमा योजना",
    text: "फसल नुकसान से सुरक्षा",
    url: "https://pmfby.gov.in/",
  },
];

/* ================= CSS ================= */

const css = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  min-height: 100%;
  font-family: Arial, "Noto Sans Devanagari", sans-serif;
  background: #f3f7f1;
  color: #243024;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.app {
  min-height: 100vh;
  max-width: 700px;
  margin: auto;
  background: #f3f7f1;
  padding-bottom: 86px;
}

header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: #fff;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 8px #00000012;
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #287b31;
  font-weight: 800;
  font-size: 17px;
}

.logo {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #e8f6e5;
  display: grid;
  place-items: center;
  font-size: 22px;
}

header small {
  display: block;
  color: #7b817b;
  font-size: 10px;
  margin-top: 2px;
}

.profileIcon {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background: #e8f5e9;
  color: #28752e;
  display: grid;
  place-items: center;
}

main {
  padding: 12px;
}

.hero {
  background: linear-gradient(135deg, #e3f7dc, #f9fff6);
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 12px;
  border: 1px solid #e2efdf;
}

.hero h1 {
  font-size: 21px;
  margin: 0 0 6px;
}

.hero p {
  margin: 0 0 12px;
  color: #667066;
  font-size: 13px;
}

.weatherButton {
  width: 100%;
  border: 0;
  background: #fff;
  border-radius: 15px;
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  box-shadow: 0 2px 8px #00000008;
}

.weatherButton strong {
  font-size: 15px;
}

.weatherButton span {
  font-size: 11px;
  color: #777;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.card {
  border: 0;
  background: #fff;
  border-radius: 16px;
  padding: 14px 10px;
  min-height: 84px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  box-shadow: 0 2px 8px #0000000d;
}

.card:active {
  transform: scale(.985);
}

.cardIcon {
  font-size: 23px;
  width: 30px;
  text-align: center;
}

.cardTitle {
  font-weight: 800;
  font-size: 13px;
}

.cardSub {
  color: #777;
  font-size: 10px;
  margin-top: 4px;
}

.advice,
.section,
.chatBox {
  background: #fff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 2px 8px #0000000b;
}

.advice {
  margin-top: 11px;
  background: #fff8df;
  font-size: 12px;
  line-height: 1.6;
}

.section {
  margin-bottom: 11px;
}

.pageTitle {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 2px 0 12px;
}

.pageTitle h2 {
  margin: 0;
  font-size: 18px;
}

.pageTitle small {
  color: #777;
  font-size: 11px;
}

.back {
  border: 0;
  background: #fff;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  box-shadow: 0 1px 5px #0000000c;
}

.primary,
.addBtn,
.sendBtn {
  background: #2e7d32;
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 10px 13px;
  font-weight: 700;
}

.primary {
  width: 100%;
}

.primary:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.addBtn {
  font-size: 12px;
}

.search {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 11px;
  padding: 11px;
  outline: none;
  margin-bottom: 10px;
  background: #fff;
}

.search:focus {
  border-color: #2e7d32;
}

.filterGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.filterGrid input {
  width: 100%;
}

.mandiStatus {
  background: #edf7ea;
  color: #28752e;
  border-radius: 11px;
  padding: 9px 10px;
  font-size: 11px;
  margin-bottom: 10px;
}

.mandiCard {
  background: #fff;
  border-radius: 15px;
  padding: 13px;
  margin-bottom: 9px;
  box-shadow: 0 2px 8px #0000000a;
}

.mandiTop {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.mandiCrop {
  font-weight: 800;
  font-size: 14px;
}

.mandiMarket {
  font-size: 12px;
  font-weight: 700;
  margin-top: 4px;
}

.mandiPrice {
  color: #28752e;
  font-weight: 800;
  text-align: right;
  white-space: nowrap;
}

.priceLabel {
  color: #777;
  font-size: 10px;
  font-weight: 400;
}

.mandiDetails {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 10px;
}

.mandiDetail {
  background: #f7faf6;
  border-radius: 9px;
  padding: 8px;
  font-size: 10px;
  color: #666;
}

.mandiDetail b {
  display: block;
  color: #222;
  font-size: 11px;
  margin-top: 2px;
}

.muted {
  font-size: 11px;
  color: #777;
  margin-top: 3px;
}

.weatherBig {
  background: linear-gradient(135deg, #e4f7dd, #fff);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  margin-bottom: 11px;
}

.temperature {
  font-size: 48px;
  font-weight: 800;
  color: #28752e;
  margin: 4px 0;
}

.weatherInfoGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 11px;
}

.weatherInfo {
  background: #fff;
  border-radius: 13px;
  padding: 11px;
  font-size: 12px;
}

.forecast {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.forecastCard {
  background: #f7faf6;
  border-radius: 13px;
  padding: 11px;
  text-align: center;
  font-size: 11px;
}

.forecastIcon {
  font-size: 25px;
  margin: 7px;
}

.locationRow {
  display: flex;
  gap: 7px;
  align-items: center;
  background: #fff;
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 10px;
  font-size: 12px;
}

.chatBox {
  min-height: 330px;
  max-height: 55vh;
  overflow: auto;
}

.bubble {
  max-width: 88%;
  padding: 10px 12px;
  border-radius: 13px;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.aiBubble {
  background: #edf7ea;
}

.userBubble {
  background: #2e7d32;
  color: #fff;
  margin-left: auto;
}

.quick {
  display: flex;
  gap: 6px;
  overflow: auto;
  margin: 8px 0;
}

.quick button {
  white-space: nowrap;
  border: 1px solid #dce7d9;
  background: #fff;
  border-radius: 18px;
  padding: 7px 10px;
  font-size: 10px;
}

.inputRow {
  display: flex;
  gap: 7px;
  margin-top: 9px;
}

.inputRow input {
  flex: 1;
  min-width: 0;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 11px;
  outline: none;
}

.sendBtn {
  padding: 0 15px;
}

.cropRow,
.product,
.cartRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.cropRow:last-child,
.product:last-child,
.cartRow:last-child {
  border-bottom: 0;
}

.cropName,
.productName {
  font-weight: 800;
}

.quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity button {
  width: 29px;
  height: 29px;
  border: 0;
  border-radius: 8px;
  background: #e8f5e9;
  color: #28752e;
  display: grid;
  place-items: center;
}

.upload {
  border: 2px dashed #cfe3cb;
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  background: #f8fcf7;
}

.preview {
  max-width: 100%;
  max-height: 240px;
  border-radius: 12px;
  margin-top: 10px;
}

.result {
  background: #edf7ea;
  border-radius: 13px;
  padding: 12px;
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.6;
}

.doctorTip {
  background: #fff8df;
  border-radius: 12px;
  padding: 11px;
  margin-top: 10px;
  font-size: 11px;
  line-height: 1.5;
}

.profileCard {
  text-align: center;
}

.bigProfile {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin: auto;
  background: #e8f5e9;
  color: #28752e;
  display: grid;
  place-items: center;
}

.scheme {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.scheme:last-child {
  border-bottom: 0;
}

.schemeIcon {
  font-size: 23px;
}

.scheme a {
  font-size: 11px;
  color: #28752e;
  text-decoration: none;
}

.empty {
  text-align: center;
  padding: 38px 10px;
  color: #777;
}

.total {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 800;
  padding: 13px 0;
}

.bottomNav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(700px, 100%);
  background: #fff;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 7px 4px;
  box-shadow: 0 -2px 12px #00000014;
  z-index: 20;
}

.navBtn {
  border: 0;
  background: transparent;
  color: #777;
  font-size: 10px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.navBtn.active {
  color: #28752e;
  font-weight: 800;
}

.fab {
  position: fixed;
  right: max(18px, calc((100vw - 700px) / 2 + 18px));
  bottom: 72px;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 50%;
  background: #16843a;
  color: #fff;
  box-shadow: 0 4px 14px #0003;
  z-index: 15;
  display: grid;
  place-items: center;
}

@media (max-width: 420px) {
  main {
    padding: 10px;
  }

  .hero {
    padding: 15px;
  }

  .card {
    padding: 12px 8px;
  }

  .temperature {
    font-size: 44px;
  }

  .filterGrid {
    grid-template-columns: 1fr;
  }
}
`;

/* ================= PAGE TITLE ================= */

function PageTitle({
  setTab,
  title,
  sub,
}: {
  setTab: (t: Tab) => void;
  title: string;
  sub?: string;
}) {
  return (
    <div className="pageTitle">
      <button
        className="back"
        onClick={() => setTab("home")}
        aria-label="Back"
      >
        <ArrowLeft size={21} />
      </button>

      <div>
        <h2>{title}</h2>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
}

/* ================= NAV ================= */

function Nav({
  active,
  on,
  icon,
  text,
}: {
  active: boolean;
  on: () => void;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <button
      className={"navBtn " + (active ? "active" : "")}
      onClick={on}
    >
      {icon}
      {text}
    </button>
  );
}

/* ================= HOME ================= */

function HomePage({
  setTab,
  name,
}: {
  setTab: (t: Tab) => void;
  name: string;
}) {
  const cards: [string, string, string, Tab][] = [
    ["📷", "फसल जाँचें", "फोटो से जांच", "doctor"],
    ["🤖", "AI Kisan", "सवाल पूछें", "chat"],
    ["🌦️", "मौसम", "अपने इलाके का मौसम", "weather"],
    ["💰", "मंडी भाव", "सरकारी मंडी के भाव", "mandi"],
    ["🌱", "मेरी फसल", "अपनी फसल जोड़ें", "crops"],
    ["🛒", "Kisan Store", "कृषि सामान", "store"],
    ["🏛️", "सरकारी योजना", "किसानों की योजनाएं", "profile"],
  ];

  return (
    <>
      <section className="hero">
        <h1>नमस्ते {name} 👋</h1>

        <p>
          आज खेती में आपकी मदद के लिए तैयार हूँ।
        </p>

        <button
          className="weatherButton"
          onClick={() => setTab("weather")}
        >
          <CloudSun size={29} />

          <div>
            <strong>आज का मौसम देखें</strong>
            <br />
            <span>अपने इलाके का live मौसम देखें</span>
          </div>

          <ArrowLeft
            size={16}
            style={{
              marginLeft: "auto",
              transform: "rotate(180deg)",
            }}
          />
        </button>
      </section>

      <div className="grid">
        {cards.map((c) => (
          <button
            className="card"
            key={c[3]}
            onClick={() => setTab(c[3])}
          >
            <div className="cardIcon">{c[0]}</div>

            <div>
              <div className="cardTitle">{c[1]}</div>
              <div className="cardSub">{c[2]}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="advice">
        ⚠️ <b>किसान सलाह</b>
        <br />
        दवा या सिंचाई का फैसला करने से पहले फसल की
        स्थिति और स्थानीय मौसम जरूर जांचें।
      </div>
    </>
  );
}

/* ================= MANDI ================= */

function MandiPage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  const [state, setState] = useState("");
  const [commodity, setCommodity] = useState("");
  const [market, setMarket] = useState("");
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadMandi = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("limit", "1000");

      if (state.trim()) {
        params.set("state", state.trim());
      }

      const targetCommodity = commodity.trim() || search.trim();
      if (targetCommodity) {
        params.set("commodity", targetCommodity);
      }

      if (market.trim()) {
        params.set("market", market.trim());
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 35000);

      const response = await fetch(
        `${API_BASE}/api/mandi?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      const data: any = await response.json().catch(() => ({}));

      const mandiData = Array.isArray(data.mandi)
        ? data.mandi
        : Array.isArray(data)
        ? data
        : [];

      if (mandiData.length > 0 || response.ok) {
        setRecords(mandiData);
        setSource(data.source || "Gov/API");
        setHasLoaded(true);

        if (!mandiData.length) {
          setError("इस खोज के लिए अभी कोई मंडी रिकॉर्ड नहीं मिला। कृपया राज्य या फसल का नाम जांचें।");
        }
      } else {
        throw new Error(data.error || "Mandi data load नहीं हो पाया।");
      }
    } catch (e) {
      setRecords([]);
      setHasLoaded(true);

      if (
        e instanceof DOMException &&
        e.name === "AbortError"
      ) {
        setError(
          "Mandi server ने समय पर जवाब नहीं दिया।"
        );
      } else {
        setError(
          e instanceof Error
            ? e.message
            : "Real Mandi service से connection नहीं हुआ।"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    if (!s) return records;

    return records.filter((x) =>
      `${x.state || ""} ${x.district || ""} ${x.market || ""} ${x.commodity || ""} ${x.variety || ""} ${x.grade || ""}`
        .toLowerCase()
        .includes(s)
    );
  }, [records, search]);

  return (
    <>
      <PageTitle
        setTab={setTab}
        title="मंडी भाव"
        sub="Real Government Mandi Data (Pan-India)"
      />

      <div className="section">
        <div className="mandiStatus">
          🟢 <b>Real Mandi Data (देशभर की मंडियां)</b>
          <br />
          Government of India - Data.gov.in / AGMARKNET
        </div>

        <input
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔎 राज्य, फसल, मंडी या जिला खोजें (उदा. Wheat, Rajasthan)"
        />

        <div className="filterGrid">
          <input
            className="search"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="राज्य जैसे Haryana, Rajasthan"
          />

          <input
            className="search"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            placeholder="फसल जैसे Wheat, Paddy"
          />

          <input
            className="search"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            placeholder="मंडी जैसे Azadpur"
          />
        </div>

        <button
          className="primary"
          onClick={loadMandi}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            style={{
              verticalAlign: "middle",
              marginRight: 5,
            }}
          />

          {loading
            ? "देशभर के मंडी भाव लोड हो रहे हैं..."
            : "🔍 Real Mandi Bhav देखें"}
        </button>

        {source && (
          <div
            className="muted"
            style={{ marginTop: 8 }}
          >
            Source: {source} | Total Loaded: {records.length}
          </div>
        )}
      </div>

      {!hasLoaded && !loading && (
        <div className="section empty">
          <div style={{ fontSize: 45 }}>🌾</div>
          <h3>देशभर के मंडी भाव देखें</h3>
          <p>
            फसल या राज्य डालकर ऊपर वाला बटन दबाएं।
          </p>
        </div>
      )}

      {error && hasLoaded && (
        <div
          className="section"
          style={{
            color: "#a33",
            background: "#fff0f0",
          }}
        >
          ❌ {error}
        </div>
      )}

      {filtered.map((x, i) => (
        <div
          className="mandiCard"
          key={`${x.state}-${x.market}-${x.commodity}-${i}`}
        >
          <div className="mandiTop">
            <div>
              <div className="mandiCrop">
                🌾 {x.commodity || "फसल"}
              </div>

              <div className="mandiMarket">
                📍 {x.market || "मंडी"}
              </div>

              <div className="muted">
                {x.district ? `${x.district}, ` : ""}
                {x.state}
              </div>
            </div>

            <div className="mandiPrice">
              <span className="priceLabel">मॉडल भाव</span>
              <div>₹{x.modalPrice || 0}</div>
              <span className="priceLabel">/ क्विंटल</span>
            </div>
          </div>

          <div className="mandiDetails">
            <div className="mandiDetail">
              न्यूनतम भाव
              <b>₹{x.minPrice || 0}</b>
            </div>
            <div className="mandiDetail">
              अधिकतम भाव
              <b>₹{x.maxPrice || 0}</b>
            </div>
            <div className="mandiDetail">
              किस्म (Variety)
              <b>{x.variety || "General"}</b>
            </div>
            <div className="mandiDetail">
              तारीख
              <b>{x.arrivalDate || "आज"}</b>
            </div>
          </div>
        </div>
      ))}

      {hasLoaded && !loading && records.length > 0 && filtered.length === 0 && (
        <div className="section empty">
          <p>कोई रिकॉर्ड मेल नहीं खाया। Search filter बदल कर देखें।</p>
        </div>
      )}
    </>
  );
}

/* ================= WEATHER ================= */

function WeatherPage({ setTab }: { setTab: (t: Tab) => void }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [locName, setLocName] = useState("उत्तर प्रदेश, भारत");

  const getWeatherCodeText = (code: number) => {
    if (code === 0) return "साफ़ आसमान ☀️";
    if (code <= 3) return "आंशिक रूप से बादल ⛅";
    if (code <= 48) return "कोहरा 🌫️";
    if (code <= 67) return "बारिश / बूंदाबांदी 🌧️";
    if (code <= 77) return "बर्फबारी ❄️";
    if (code <= 82) return "तेज बारिश 🌧️";
    if (code <= 99) return "तूफान और बारिश ⛈️";
    return "मौसम सामान्य";
  };

  const fetchWeather = (lat: number, lon: number, locationLabel?: string) => {
    setLoading(true);
    setErr("");
    if (locationLabel) setLocName(locationLabel);

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
    )
      .then((res) => res.json())
      .then((resData) => {
        if (resData.current) {
          setData(resData);
        } else {
          setErr("मौसम की जानकारी नहीं मिल सकी।");
        }
      })
      .catch(() => setErr("मौसम सर्वर से कनेक्शन फेल हो गया।"))
      .finally(() => setLoading(false));
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setErr("आपके डिवाइस में GPS सपोर्ट नहीं है।");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocName("आपकी लाइव लोकेशन");
        fetchWeather(latitude, longitude, "आपकी लाइव लोकेशन 📍");
      },
      () => {
        setErr("GPS लोकेशन एक्सेस नहीं मिला। Default मौसम दिखाया जा रहा है।");
        fetchWeather(26.8467, 80.9462, "उत्तर प्रदेश (Default)");
      }
    );
  };

  useEffect(() => {
    fetchWeather(26.8467, 80.9462, "उत्तर प्रदेश (Default)");
  }, []);

  return (
    <>
      <PageTitle setTab={setTab} title="मौसम" sub="लाइव अपडेट और पूर्वाअनुमान" />

      <div className="locationRow">
        <MapPin size={18} color="#28752e" />
        <span style={{ fontWeight: "bold", flex: 1 }}>{locName}</span>
        <button
          onClick={handleGPS}
          style={{
            border: 0,
            background: "#28752e",
            color: "#fff",
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 11,
            fontWeight: "bold",
          }}
        >
          📍 GPS अपडेट
        </button>
      </div>

      {loading && (
        <div className="section empty">
          <p>मौसम की जानकारी लोड हो रही है...</p>
        </div>
      )}

      {err && <div className="section" style={{ color: "red" }}>{err}</div>}

      {data && !loading && (
        <>
          <div className="weatherBig">
            <div style={{ fontSize: 13, color: "#555" }}>
              {getWeatherCodeText(data.current.weather_code)}
            </div>
            <div className="temperature">{Math.round(data.current.temperature_2m)}°C</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              महसूस हो रहा है: {Math.round(data.current.apparent_temperature)}°C
            </div>

            <div className="weatherInfoGrid">
              <div className="weatherInfo">
                💧 नमी (Humidity)
                <br />
                <b>{data.current.relative_humidity_2m}%</b>
              </div>
              <div className="weatherInfo">
                💨 हवा की गति
                <br />
                <b>{data.current.wind_speed_10m} km/h</b>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>📅 अगले 3 दिनों का पूर्वानुमान</h3>
            <div className="forecast" style={{ marginTop: 10 }}>
              {data.daily.time.slice(0, 3).map((day, idx) => (
                <div key={day} className="forecastCard">
                  <b>{idx === 0 ? "आज" : idx === 1 ? "कल" : "परसों"}</b>
                  <div className="forecastIcon">
                    {data.daily.weather_code[idx] <= 3 ? "☀️" : "🌧️"}
                  </div>
                  <div>
                    {Math.round(data.daily.temperature_2m_max[idx])}° /{" "}
                    {Math.round(data.daily.temperature_2m_min[idx])}°C
                  </div>
                  <div style={{ color: "#28752e", fontSize: 10, marginTop: 4 }}>
                    🌧️ {data.daily.precipitation_probability_max[idx]}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ================= CROPS ================= */

function CropsPage({ setTab }: { setTab: (t: Tab) => void }) {
  const [crops, setCrops] = useState<Crop[]>([
    { id: 1, name: "गेहूँ", area: "2 एकड़", note: "सिंचाई की आवश्यकता 5 दिन में" },
    { id: 2, name: "सरसों", area: "1 एकड़", note: "कीटनाशक स्प्रे पूरा हुआ" },
  ]);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [note, setNote] = useState("");

  const addCrop = () => {
    if (!name.trim()) return;
    setCrops([...crops, { id: Date.now(), name, area, note }]);
    setName("");
    setArea("");
    setNote("");
  };

  const removeCrop = (id: number) => {
    setCrops(crops.filter((c) => c.id !== id));
  };

  return (
    <>
      <PageTitle setTab={setTab} title="मेरी फसलें" sub="फसलों का प्रबंधन करें" />

      <div className="section">
        <h3>🌱 नई फसल जोड़ें</h3>
        <input
          className="search"
          placeholder="फसल का नाम (उदा. धान, गेहूँ)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="filterGrid">
          <input
            className="search"
            placeholder="क्षेत्रफल (उदा. 2 एकड़)"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
          <input
            className="search"
            placeholder="नोट्स (उदा. खाद देना बाकी है)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button className="primary" onClick={addCrop}>
          + फसल जोड़ें
        </button>
      </div>

      <div className="section">
        <h3>📋 जोड़ी गई फसलें ({crops.length})</h3>
        {crops.length === 0 ? (
          <p className="muted">कोई फसल नहीं जोड़ी गई है।</p>
        ) : (
          crops.map((c) => (
            <div className="cropRow" key={c.id}>
              <div>
                <div className="cropName">{c.name}</div>
                <div className="muted">
                  क्षेत्रफल: {c.area || "N/A"} | {c.note}
                </div>
              </div>
              <button
                onClick={() => removeCrop(c.id)}
                style={{
                  border: 0,
                  background: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: 8,
                  padding: "6px 10px",
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ================= CROP DOCTOR ================= */

function DoctorPage({ setTab }: { setTab: (t: Tab) => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [cropName, setCropName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type || "image/jpeg");
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!image) {
      setError("कृपया पहले फसल की फोटो अपलोड करें।");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch(`${API_BASE}/api/crop-doctor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mimeType, cropName, symptoms }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "जाँच नहीं हो सकी।");
      setResult(data.reply);
    } catch (err: any) {
      setError(err.message || "सर्वर से कनेक्ट करने में दिक्कत आई।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle setTab={setTab} title="फसल डॉक्टर" sub="AI फोटो पहचान व उपचार" />

      <div className="section">
        <div className="upload">
          <Camera size={38} color="#28752e" />
          <p style={{ margin: "8px 0 12px", fontSize: 13 }}>
            प्रभावित पत्ती या पौधे की साफ़ फोटो लें
          </p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImage}
            style={{ display: "none" }}
            id="cropPic"
          />
          <label htmlFor="cropPic" className="addBtn" style={{ cursor: "pointer" }}>
            📷 फोटो अपलोड / फोटो खींचें
          </label>
        </div>

        {image && (
          <div style={{ textAlign: "center" }}>
            <img src={image} alt="Crop Preview" className="preview" />
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <input
            className="search"
            placeholder="🌾 फसल का नाम (गेहूँ, धान, कपास...)"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
          />
          <textarea
            className="search"
            rows={3}
            placeholder="📝 क्या समस्या दिख रही है? जैसे पत्तियां पीली हैं, दाग हैं, कीड़े हैं..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        <button
          className="primary"
          onClick={analyze}
          disabled={loading || !image}
          style={{ marginTop: 6 }}
        >
          {loading ? "🔬 AI फसल की जाँच कर रहा है..." : "🔍 AI से फसल की जांच करें"}
        </button>

        {error && (
          <div className="section" style={{ color: "red", marginTop: 10 }}>
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="result">
            <b>🤖 AI Crop Doctor रिपोर्ट:</b>
            <div style={{ marginTop: 8, whitespace: "pre-line" }}>{result}</div>
          </div>
        )}

        <div className="doctorTip">
          💡 <b>बेहतर परिणाम के लिए:</b> पूरी पत्ती, प्रभावित हिस्सा, पौधे का आकार और खेत की स्थिति साफ़ दिखाई देने वाली फोटो भेजें।
        </div>
      </div>
    </>
  );
}

/* ================= KISAN STORE (WITH WHATSAPP ORDER INTEGRATION) ================= */

function StorePage({
  setTab,
  cart,
  setCart,
}: {
  setTab: (t: Tab) => void;
  cart: { [id: number]: number };
  setCart: React.Dispatch<React.SetStateAction<{ [id: number]: number }>>;
}) {
  const WHATSAPP_NUMBER = "917830210996";

  const addToCart = (id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find((x) => x.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const handleWhatsAppOrder = () => {
    const itemsInCart = Object.entries(cart)
      .map(([id, qty]) => {
        const product = products.find((p) => p.id === Number(id));
        return product ? { ...product, qty } : null;
      })
      .filter(Boolean);

    if (itemsInCart.length === 0) {
      alert("आपकी कार्ट खाली है! कृपया पहले सामान जोड़ें।");
      return;
    }

    let message = `🛒 *KisanSaathi AI - Naya Order*\n\n`;
    message += `*Items:*\n`;

    itemsInCart.forEach((item, index) => {
      if (item) {
        message += `${index + 1}. ${item.name} (${item.unit}) - ${item.qty}x = ₹${item.price * item.qty}\n`;
      }
    });

    message += `\n*Kul Kimat:* ₹${totalAmount}\n\n`;
    message += `Kripya mera order confirm karein aur delivery ki jankari dein.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  return (
    <>
      <PageTitle setTab={setTab} title="Kisan Store" sub="जैविक खाद व कृषि सुरक्षा" />

      <div className="section">
        {products.map((p) => {
          const qty = cart[p.id] || 0;
          return (
            <div className="product" key={p.id}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 28 }}>{p.emoji}</span>
                <div>
                  <div className="productName">{p.name}</div>
                  <div className="muted">
                    {p.unit} | ₹{p.price}
                  </div>
                </div>
              </div>

              {qty === 0 ? (
                <button className="addBtn" onClick={() => addToCart(p.id)}>
                  + कार्ट में जोड़ें
                </button>
              ) : (
                <div className="quantity">
                  <button onClick={() => removeFromCart(p.id)}>
                    <Minus size={14} />
                  </button>
                  <b>{qty}</b>
                  <button onClick={() => addToCart(p.id)}>
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalItems > 0 && (
        <div className="section" style={{ background: "#edf7ea" }}>
          <div className="total">
            <span>कुल सामान ({totalItems}):</span>
            <span style={{ color: "#28752e" }}>₹{totalAmount}</span>
          </div>
          <button
            className="primary"
            onClick={handleWhatsAppOrder}
            style={{
              background: "#25D366",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            💬 Direct WhatsApp Par Order Karein
          </button>
        </div>
      )}
    </>
  );
}

/* ================= CHAT (AI KISAN) ================= */

function ChatPage({ setTab }: { setTab: (t: Tab) => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      from: "ai",
      text: "नमस्ते! मैं KisanSaathi AI हूँ। आपकी खेती, फसल, बीमारी या खाद से जुड़ा कोई भी सवाल पूछें।",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "गेहूँ में खाद कब डालें?",
    "कीटनाशक छिड़कने का सही समय?",
    "धान की बीमारी कैसे रोकें?",
  ];

  const send = async (msgToSend?: string) => {
    const query = msgToSend || text;
    if (!query.trim() || loading) return;

    const newMsgs: ChatMsg[] = [...messages, { from: "user", text: query }];
    setMessages(newMsgs);
    if (!msgToSend) setText("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI उत्तर नहीं दे सका।");

      setMessages([...newMsgs, { from: "ai", text: data.reply }]);
    } catch (e: any) {
      setMessages([
        ...newMsgs,
        { from: "ai", text: "माफ़ कीजिये, अभी AI सर्वर में तकनीकी दिक्कत है।" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle setTab={setTab} title="AI Kisan Companion" sub="24/7 Krishi Sallaah" />

      <div className="chatBox">
        {messages.map((m, i) => (
          <div
            className={`bubble ${m.from === "ai" ? "aiBubble" : "userBubble"}`}
            key={i}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="bubble aiBubble">🤖 AI सोच रहा है...</div>}
      </div>

      <div className="quick">
        {quickPrompts.map((q) => (
          <button key={q} onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="inputRow">
        <input
          placeholder="खेती से जुड़ा सवाल यहाँ लिखें..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="sendBtn" onClick={() => send()} disabled={loading}>
          <Send size={18} />
        </button>
      </div>
    </>
  );
}

/* ================= PROFILE & SCHEMES ================= */

function ProfilePage({
  setTab,
  name,
  setName,
}: {
  setTab: (t: Tab) => void;
  name: string;
  setName: (n: string) => void;
}) {
  return (
    <>
      <PageTitle setTab={setTab} title="प्रोफाइल व योजनाएं" sub="सरकारी सुविधाएं" />

      <div className="section profileCard">
        <div className="bigProfile">
          <User size={36} />
        </div>
        <h3 style={{ margin: "10px 0 4px" }}>{name}</h3>
        <p className="muted" style={{ margin: 0 }}>
          डिजिटल किसान साथी यूजर
        </p>
      </div>

      <div className="section">
        <h3>🏛️ प्रमुख सरकारी कृषि योजनाएं</h3>
        {schemes.map((s) => (
          <div className="scheme" key={s.title}>
            <span className="schemeIcon">{s.icon}</span>
            <div style={{ flex: 1 }}>
              <b>{s.title}</b>
              <div className="muted">{s.text}</div>
            </div>
            <a href={s.url} target="_blank" rel="noreferrer">
              देखें <ExternalLink size={12} />
            </a>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================= MAIN APP ================= */

export function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [name, setName] = useState("किसान भाई");
  const [cart, setCart] = useState<{ [id: number]: number }>({});

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="app">
      <style>{css}</style>

      <header>
        <div className="brand" onClick={() => setTab("home")}>
          <div className="logo">🌾</div>
          <div>
            KisanSaathi AI
            <small>आपका डिजिटल किसान दोस्त</small>
          </div>
        </div>

        <button className="profileIcon" onClick={() => setTab("profile")}>
          <User size={20} />
        </button>
      </header>

      <main>
        {tab === "home" && <HomePage setTab={setTab} name={name} />}
        {tab === "mandi" && <MandiPage setTab={setTab} />}
        {tab === "weather" && <WeatherPage setTab={setTab} />}
        {tab === "crops" && <CropsPage setTab={setTab} />}
        {tab === "doctor" && <DoctorPage setTab={setTab} />}
        {tab === "store" && <StorePage setTab={setTab} cart={cart} setCart={setCart} />}
        {tab === "chat" && <ChatPage setTab={setTab} />}
        {tab === "profile" && <ProfilePage setTab={setTab} name={name} setName={setName} />}
      </main>

      {/* Floating Chat FAB */}
      {tab !== "chat" && (
        <button className="fab" onClick={() => setTab("chat")}>
          <MessageCircle size={26} />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="bottomNav">
        <Nav
          active={tab === "home"}
          on={() => setTab("home")}
          icon={<Home size={20} />}
          text="Home"
        />
        <Nav
          active={tab === "crops"}
          on={() => setTab("crops")}
          icon={<Leaf size={20} />}
          text="मेरी फसल"
        />
        <Nav
          active={tab === "store"}
          on={() => setTab("store")}
          icon={<ShoppingCart size={20} />}
          text={`Store ${cartCount > 0 ? `(${cartCount})` : ""}`}
        />
        <Nav
          active={tab === "profile"}
          on={() => setTab("profile")}
          icon={<User size={20} />}
          text="Profile"
        />
      </nav>
    </div>
  );
}

// Render App
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
