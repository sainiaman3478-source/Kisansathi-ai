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

type MandiResponse = {
  ok: boolean;
  source?: string;
  count?: number;
  mandi?: MandiRecord[];
  error?: string;
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

      params.set("limit", "100");

      if (state.trim()) {
        params.set("state", state.trim());
      }

      if (commodity.trim()) {
        params.set("commodity", commodity.trim());
      }

      if (market.trim()) {
        params.set("market", market.trim());
      }

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 30000);

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

      const contentType =
        response.headers.get("content-type") || "";

      const data: MandiResponse =
        contentType.includes("application/json")
          ? await response.json().catch(() => ({
              ok: false,
              error: "Server ने गलत JSON response दिया।",
            }))
          : {
              ok: false,
              error:
                "Mandi API ने JSON की जगह दूसरा response दिया।",
            };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            `Mandi server error (${response.status})`
        );
      }

      const mandiData = Array.isArray(data.mandi)
        ? data.mandi
        : [];

      setRecords(mandiData);
      setSource(data.source || "");
      setHasLoaded(true);

      if (!mandiData.length) {
        setError(
          "इस search के लिए अभी कोई mandi record नहीं मिला।"
        );
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
      `${x.state} ${x.district} ${x.market} ${x.commodity} ${x.variety} ${x.grade}`
        .toLowerCase()
        .includes(s)
    );
  }, [records, search]);

  return (
    <>
      <PageTitle
        setTab={setTab}
        title="मंडी भाव"
        sub="Real Government Mandi Data"
      />

      <div className="section">
        <div className="mandiStatus">
          🟢 <b>Real Mandi Data</b>
          <br />
          Government of India - Data.gov.in / AGMARKNET
        </div>

        <input
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔎 राज्य, फसल, मंडी या जिला खोजें..."
        />

        <div className="filterGrid">
          <input
            className="search"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="राज्य जैसे Haryana"
          />

          <input
            className="search"
            value={commodity}
            onChange={(e) =>
              setCommodity(e.target.value)
            }
            placeholder="फसल जैसे Wheat"
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
            ? "मंडी भाव लोड हो रहे हैं..."
            : "🔍 Real Mandi Bhav देखें"}
        </button>

        {source && (
          <div
            className="muted"
            style={{ marginTop: 8 }}
          >
            Source: {source}
          </div>
        )}
      </div>

      {!hasLoaded && !loading && (
        <div className="section empty">
          <div style={{ fontSize: 45 }}>🌾</div>
          <h3>Real Mandi Bhav देखें</h3>
          <p>
            राज्य, फसल या मंडी डालें और ऊपर वाला
            बटन दबाएं।
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
                {x.district
                  ? `${x.district}, `
                  : ""}
                {x.state}
              </div>
            </div>

            <div className="mandiPrice">
              ₹
              {Number(
                x.modalPrice || 0
              ).toLocaleString("en-IN")}

              <div className="priceLabel">
                Modal / क्विंटल
              </div>
            </div>
          </div>

          <div className="mandiDetails">
            <div className="mandiDetail">
              न्यूनतम भाव
              <b>
                ₹
                {Number(
                  x.minPrice || 0
                ).toLocaleString("en-IN")}
              </b>
            </div>

            <div className="mandiDetail">
              अधिकतम भाव
              <b>
                ₹
                {Number(
                  x.maxPrice || 0
                ).toLocaleString("en-IN")}
              </b>
            </div>

            <div className="mandiDetail">
              Variety
              <b>{x.variety || "-"}</b>
            </div>

            <div className="mandiDetail">
              तारीख
              <b>{x.arrivalDate || "-"}</b>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/* ================= WEATHER ================= */

function WeatherPage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [w, setW] = useState<WeatherData | null>(null);
  const [loc, setLoc] = useState("");

  const load = () => {
    if (!navigator.geolocation) {
      setError(
        "इस फोन में Location उपलब्ध नहीं है।"
      );
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const { latitude, longitude } = p.coords;

          const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
            `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
            `&timezone=auto&forecast_days=3`;

          const r = await fetch(url);

          if (!r.ok) throw new Error();

          const d: WeatherData = await r.json();

          setW(d);

          setLoc(
            `${latitude.toFixed(2)}°, ${longitude.toFixed(
              2
            )}°`
          );
        } catch {
          setError(
            "मौसम नहीं मिल पाया। Internet और Location जांचें।"
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError(
          "Location की अनुमति दें, तभी आपके इलाके का live मौसम दिखेगा।"
        );
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const txt = (c: number) =>
    c === 0
      ? "साफ आसमान"
      : c <= 3
      ? "आंशिक बादल"
      : c <= 48
      ? "कोहरा"
      : c <= 67
      ? "बारिश"
      : c <= 77
      ? "बर्फ"
      : c <= 82
      ? "तेज बारिश"
      : "गरज के साथ बारिश";

  const emo = (c: number) =>
    c === 0
      ? "☀️"
      : c <= 3
      ? "🌤️"
      : c <= 48
      ? "🌫️"
      : c <= 67
      ? "🌧️"
      : c <= 77
      ? "❄️"
      : "⛈️";

  return (
    <>
      <PageTitle
        setTab={setTab}
        title="मौसम"
        sub="Live Weather"
      />

      <div className="locationRow">
        <MapPin size={17} />

        <span>
          {loc || "Location अभी नहीं ली गई"}
        </span>

        <button
          style={{
            marginLeft: "auto",
            border: 0,
            background: "transparent",
          }}
          onClick={load}
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {!w ? (
        <div
          className="section"
          style={{
            textAlign: "center",
            padding: 30,
          }}
        >
          <CloudSun size={52} />

          <h3>अपने इलाके का मौसम देखें</h3>

          <p className="muted">
            Location अनुमति देने के बाद live forecast
            आएगा।
          </p>

          <button
            className="primary"
            onClick={load}
          >
            {loading
              ? "मौसम लोड हो रहा है..."
              : "📍 मेरा मौसम देखें"}
          </button>

          {error && (
            <p
              style={{
                color: "#b33",
                fontSize: 12,
              }}
            >
              {error}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="weatherBig">
            <div style={{ fontSize: 48 }}>
              {emo(w.current.weather_code)}
            </div>

            <div className="temperature">
              {Math.round(
                w.current.temperature_2m
              )}
              °C
            </div>

            <h3>
              {txt(w.current.weather_code)}
            </h3>

            <div className="weatherInfoGrid">
              <div className="weatherInfo">
                💧 नमी
                <br />
                <b>
                  {w.current.relative_humidity_2m}%
                </b>
              </div>

              <div className="weatherInfo">
                💨 हवा
                <br />
                <b>
                  {Math.round(
                    w.current.wind_speed_10m
                  )}{" "}
                  km/h
                </b>
              </div>

              <div className="weatherInfo">
                🌡️ महसूस
                <br />
                <b>
                  {Math.round(
                    w.current.apparent_temperature
                  )}
                  °C
                </b>
              </div>

              <div className="weatherInfo">
                🌧️ बारिश
                <br />
                <b>
                  {w.current.precipitation} mm
                </b>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>अगले 3 दिन</h3>

            <div className="forecast">
              {w.daily.time.map((d, i) => (
                <div
                  className="forecastCard"
                  key={d}
                >
                  <b>
                    {i === 0
                      ? "आज"
                      : i === 1
                      ? "कल"
                      : "परसों"}
                  </b>

                  <div className="forecastIcon">
                    {emo(
                      w.daily.weather_code[i]
                    )}
                  </div>

                  <b>
                    {Math.round(
                      w.daily.temperature_2m_max[i]
                    )}
                    ° /{" "}
                    {Math.round(
                      w.daily.temperature_2m_min[i]
                    )}
                    °
                  </b>

                  <div className="muted">
                    बारिश{" "}
                    {
                      w.daily
                        .precipitation_probability_max[i]
                    }
                    %
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

function CropsPage({
  setTab,
  crops,
  setCrops,
}: {
  setTab: (t: Tab) => void;
  crops: Crop[];
  setCrops: React.Dispatch<
    React.SetStateAction<Crop[]>
  >;
}) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");

  const save = () => {
    if (!name.trim()) return;

    setCrops((c) => [
      ...c,
      {
        id: Date.now(),
        name: name.trim(),
        area: area.trim(),
        note: "नियमित निगरानी करें",
      },
    ]);

    setName("");
    setArea("");
  };

  return (
    <>
      <PageTitle
        setTab={setTab}
        title="मेरी फसल"
        sub="आपकी Saved Crops"
      />

      <div className="section">
        <h3>🌱 नई फसल जोड़ें</h3>

        <input
          className="search"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          placeholder="फसल का नाम (गेहूं, धान...)"
        />

        <input
          className="search"
          value={area}
          onChange={(e) =>
            setArea(e.target.value)
          }
          placeholder="खेत/क्षेत्र (जैसे 2 एकड़)"
        />

        <button
          className="primary"
          onClick={save}
        >
          <Plus size={16} /> फसल सेव करें
        </button>
      </div>

      {crops.length === 0 ? (
        <div className="section empty">
          <div style={{ fontSize: 45 }}>🌱</div>
          <h3>अभी कोई फसल सेव नहीं है</h3>
          <p>ऊपर से अपनी फसल जोड़ें।</p>
        </div>
      ) : (
        <div className="section">
          {crops.map((c) => (
            <div
              className="cropRow"
              key={c.id}
            >
              <div>
                <div className="cropName">
                  🌾 {c.name}
                </div>

                <div className="muted">
                  {c.area || "क्षेत्र नहीं दिया"} ·{" "}
                  {c.note}
                </div>
              </div>

              <button
                onClick={() =>
                  setCrops((x) =>
                    x.filter(
                      (y) => y.id !== c.id
                    )
                  )
                }
                style={{
                  border: 0,
                  background: "transparent",
                  color: "#a33",
                }}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ================= IMAGE COMPRESS ================= */

async function compressImage(
  file: File
): Promise<File> {
  const image = new Image();

  const objectUrl = URL.createObjectURL(file);

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();

      image.onerror = () =>
        reject(
          new Error("Image load नहीं हुई")
        );

      image.src = objectUrl;
    });

    const maxSize = 1280;

    let width = image.naturalWidth;
    let height = image.naturalHeight;

    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = Math.round(
          (height / width) * maxSize
        );

        width = maxSize;
      } else {
        width = Math.round(
          (width / height) * maxSize
        );

        height = maxSize;
      }
    }

    const canvas =
      document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) return file;

    ctx.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    const blob =
      await new Promise<Blob | null>(
        (resolve) =>
          canvas.toBlob(
            resolve,
            "image/jpeg",
            0.78
          )
      );

    if (!blob) return file;

    return new File(
      [blob],
      "crop-photo.jpg",
      {
        type: "image/jpeg",
      }
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/* ================= CROP DOCTOR ================= */

function DoctorPage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  const [file, setFile] =
    useState<File | null>(null);

  const [url, setUrl] = useState("");

  const [result, setResult] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [crop, setCrop] =
    useState("");

  const [symptoms, setSymptoms] =
    useState("");

  /* ================= CHOOSE PHOTO ================= */

  const choose = (f: File | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }

    setFile(f);
    setResult("");

    if (f) {
      setUrl(
        URL.createObjectURL(f)
      );
    } else {
      setUrl("");
    }
  };

  /* ================= CLEAN PHOTO URL ================= */

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  /* ================= FILE TO BASE64 ================= */

  const fileToDataUrl = (
    input: File
  ): Promise<string> => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () => {
          if (
            typeof reader.result ===
            "string"
          ) {
            resolve(
              reader.result
            );
          } else {
            reject(
              new Error(
                "फोटो को पढ़ा नहीं जा सका।"
              )
            );
          }
        };

        reader.onerror = () => {
          reject(
            new Error(
              "फोटो पढ़ने में समस्या हुई।"
            )
          );
        };

        reader.readAsDataURL(
          input
        );
      }
    );
  };

  /* ================= AI ANALYZE ================= */

  const analyze = async () => {
    if (!file || loading) {
      if (!file) {
        setResult(
          "❌ पहले फसल की फोटो चुनें।"
        );
      }

      return;
    }

    setLoading(true);
    setResult("");

    try {
      /*
       * Step 1:
       * Photo को छोटा करें
       */
      const smallImage =
        await compressImage(file);

      /*
       * Step 2:
       * Photo को Base64 Data URL में बदलें
       */
      const imageData =
        await fileToDataUrl(
          smallImage
        );

      if (!imageData) {
        throw new Error(
          "फसल की फोटो तैयार नहीं हो पाई।"
        );
      }

      /*
       * Step 3:
       * Render backend को JSON भेजें
       */
      const controller =
        new AbortController();

      const timeout =
        setTimeout(() => {
          controller.abort();
        }, 90000);

      const response =
        await fetch(
          `${API_BASE}/api/crop-doctor`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              image: imageData,

              mimeType:
                smallImage.type ||
                "image/jpeg",

              cropName:
                crop.trim() ||
                "फसल का नाम नहीं बताया गया",

              symptoms:
                symptoms.trim() ||
                "कोई अतिरिक्त लक्षण नहीं बताया गया",
            }),

            signal:
              controller.signal,
          }
        );

      clearTimeout(timeout);

      /*
       * Server response पढ़ें
       */
      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      const data =
        contentType.includes(
          "application/json"
        )
          ? await response
              .json()
              .catch(() => ({}))
          : {};

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Crop Doctor server error (${response.status})`
        );
      }

      const reply =
        data.reply ||
        data.result ||
        data.message ||
        "";

      if (!reply) {
        throw new Error(
          "AI ने कोई रिपोर्ट नहीं भेजी।"
        );
      }

      setResult(reply);
    } catch (e) {
      if (
        e instanceof DOMException &&
        e.name === "AbortError"
      ) {
        setResult(
          "❌ Crop Doctor server ने 90 सेकंड में जवाब नहीं दिया। Render backend या AI API की जांच करनी होगी।"
        );
      } else {
        setResult(
          e instanceof Error
            ? "❌ " + e.message
            : "❌ Crop Doctor से connection नहीं हो पाया।"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        setTab={setTab}
        title="फसल जाँचें"
        sub="AI Crop Doctor"
      />

      <div className="section">
        <div className="upload">
          <Camera size={48} />

          <h3>
            🌱 फसल की फोटो लें
          </h3>

          <p className="muted">
            पत्ती या पौधे की साफ और
            अच्छी रोशनी वाली फोटो लें।
          </p>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) =>
              choose(
                e.target.files?.[0] ||
                  null
              )
            }
          />

          {url && (
            <img
              className="preview"
              src={url}
              alt="फसल preview"
            />
          )}
        </div>

        <input
          className="search"
          style={{
            marginTop: 10,
          }}
          value={crop}
          onChange={(e) =>
            setCrop(
              e.target.value
            )
          }
          placeholder="🌾 फसल का नाम (गेहूं, धान, कपास...)"
        />

        <textarea
          value={symptoms}
          onChange={(e) =>
            setSymptoms(
              e.target.value
            )
          }
          placeholder="📝 क्या समस्या दिख रही है? जैसे पत्तियां पीली हैं, दाग हैं, कीड़े हैं..."
          style={{
            width: "100%",
            minHeight: 90,
            border:
              "1px solid #ddd",
            borderRadius: 11,
            padding: 11,
            resize: "vertical",
            outline: "none",
            background: "#fff",
          }}
        />

        {file && (
          <button
            className="primary"
            style={{
              marginTop: 10,
            }}
            onClick={analyze}
            disabled={loading}
          >
            {loading
              ? "🤖 AI फसल की जांच कर रहा है..."
              : "🔍 AI से फसल की जांच करें"}
          </button>
        )}

        {result && (
          <div className="result">
            <b>
              🤖 AI Crop Doctor रिपोर्ट
            </b>

            <div
              style={{
                marginTop: 7,
                whiteSpace:
                  "pre-wrap",
              }}
            >
              {result}
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <Stethoscope size={28} />

        <h3>
          ⚠️ जरूरी सावधानी
        </h3>

        <p className="muted">
          AI की फोटो पहचान शुरुआती
          सहायता के लिए है। दवा की
          मात्रा और अंतिम उपचार तय
          करने से पहले स्थानीय कृषि
          विशेषज्ञ से पुष्टि करें।
        </p>

        <div className="doctorTip">
          💡 बेहतर परिणाम के लिए:
          पूरी पत्ती, प्रभावित हिस्सा,
          पौधे का आकार और खेत की
          स्थिति साफ दिखाई देने वाली
          फोटो भेजें।
        </div>
      </div>
    </>
  );
}

/* ================= STORE ================= */

function StorePage({
  setTab,
  cart,
  add,
}: {
  setTab: (t: Tab) => void;
  cart: Record<number, number>;
  add: (id: number) => void;
}) {
  const count =
    Object.values(cart).reduce(
      (a, b) => a + b,
      0
    );

  return (
    <>
      <PageTitle
        setTab={setTab}
        title="Kisan Store"
        sub="कृषि सामान"
      />

      <div className="section">
        {products.map((p) => (
          <div
            className="product"
            key={p.id}
          >
            <div
              style={{
                display: "flex",
                gap: 9,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: 28,
                }}
              >
                {p.emoji}
              </span>

              <div>
                <div className="productName">
                  {p.name}
                </div>

                <div className="muted">
                  ₹{p.price} · {p.unit}
                </div>
              </div>
            </div>

            <button
              className="addBtn"
              onClick={() =>
                add(p.id)
              }
            >
              कार्ट में डालें
            </button>
          </div>
        ))}

        <button
          className="primary"
          style={{
            marginTop: 12,
          }}
          onClick={() =>
            setTab("cart")
          }
        >
          🛒 कार्ट देखें{" "}
          {count
            ? `(${count})`
            : ""}
        </button>
      </div>
    </>
  );
}

/* ================= CART ================= */

function CartPage({
  setTab,
  cart,
  add,
  remove,
  total,
}: {
  setTab: (t: Tab) => void;
  cart: Record<number, number>;
  add: (id: number) => void;
  remove: (id: number) => void;
  total: number;
}) {
  const ids =
    Object.keys(cart).map(
      Number
    );

  return (
    <>
      <PageTitle
        setTab={setTab}
        title="Cart"
        sub="आपका सामान"
      />

      {!ids.length ? (
        <div className="section empty">
          <ShoppingCart size={50} />

          <h3>
            Cart खाली है
          </h3>

          <button
            className="addBtn"
            onClick={() =>
              setTab("store")
            }
          >
            Store देखें
          </button>
        </div>
      ) : (
        <div className="section">
          {ids.map((id) => {
            const p =
              products.find(
                (x) =>
                  x.id === id
              );

            if (!p) return null;

            return (
              <div
                className="cartRow"
                key={id}
              >
                <div>
                  <b>
                    {p.name}
                  </b>

                  <div className="muted">
                    ₹{p.price} ×{" "}
                    {cart[id]}
                  </div>
                </div>

                <div className="quantity">
                  <button
                    onClick={() =>
                      remove(id)
                    }
                  >
                    <Minus size={15} />
                  </button>

                  <b>
                    {cart[id]}
                  </b>

                  <button
                    onClick={() =>
                      add(id)
                    }
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="total">
            <span>
              कुल राशि
            </span>

            <span>
              ₹
              {total.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          <button
            className="primary"
            onClick={() =>
              alert(
                "Demo order: अभी payment/delivery backend जोड़ना बाकी है।"
              )
            }
          >
            ऑर्डर करें
          </button>
        </div>
      )}
    </>
  );
}

/* ================= CHAT ================= */

function ChatPage({
  setTab,
  chat,
  q,
  setQ,
  send,
}: {
  setTab: (t: Tab) => void;
  chat: ChatMsg[];
  q: string;
  setQ: (s: string) => void;
  send: (s?: string) => void;
}) {
  const quick = [
    "गेहूं में खाद कब डालें?",
    "धान में पत्तियां पीली हैं",
    "आज बारिश होगी?",
    "सरसों में कीड़ा लग गया",
    "आज मंडी में गेहूं का भाव क्या है?",
  ];

  return (
    <>
      <PageTitle
        setTab={setTab}
        title="AI Kisan"
        sub="खेती से जुड़े सवाल पूछें"
      />

      <div className="chatBox">
        {!chat.length ? (
          <div className="empty">
            <MessageCircle size={48} />

            <h3>
              नमस्ते किसान भाई 👋
            </h3>

            <p>
              फसल, मौसम, मंडी या खेती
              के बारे में पूछें।
            </p>
          </div>
        ) : (
          chat.map((m, i) => (
            <div
              className={
                "bubble " +
                (m.from === "user"
                  ? "userBubble"
                  : "aiBubble")
              }
              key={i}
            >
              <b>
                {m.from === "user"
                  ? "आप"
                  : "🤖 AI Kisan"}
              </b>

              <br />

              {m.text}
            </div>
          ))
        )}
      </div>

      <div className="quick">
        {quick.map((x) => (
          <button
            key={x}
            onClick={() =>
              send(x)
            }
          >
            {x}
          </button>
        ))}
      </div>

      <div className="inputRow">
        <input
          value={q}
          onChange={(e) =>
            setQ(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter"
            ) {
              send();
            }
          }}
          placeholder="अपना सवाल लिखें..."
        />

        <button
          className="sendBtn"
          onClick={() =>
            send()
          }
        >
          <Send size={18} />
        </button>
      </div>
    </>
  );
}

/* ================= PROFILE ================= */

function ProfilePage({
  setTab,
  name,
  crops,
}: {
  setTab: (t: Tab) => void;
  name: string;
  crops: Crop[];
}) {
  return (
    <>
      <PageTitle
        setTab={setTab}
        title="Profile"
        sub="किसान प्रोफाइल"
      />

      <div className="section profileCard">
        <div className="bigProfile">
          <User size={36} />
        </div>

        <h2>{name}</h2>

        <p className="muted">
          {crops.length} फसल सेव हैं
        </p>
      </div>

      <div className="section">
        <h3>
          🏛️ सरकारी योजनाएं
        </h3>

        {schemes.map((s) => (
          <div
            className="scheme"
            key={s.title}
          >
            <div className="schemeIcon">
              {s.icon}
            </div>

            <div
              style={{
                flex: 1,
              }}
            >
              <b>
                {s.title}
              </b>

              <div className="muted">
                {s.text}
              </div>

              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
              >
                आधिकारिक वेबसाइट{" "}
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <h3>
          ℹ️ ऐप की स्थिति
        </h3>

        <p className="muted">
          ✅ Real Mandi Bhav
          <br />
          ✅ AI Kisan - Render backend
          <br />
          ✅ Weather - live forecast
          <br />
          ✅ Crop Doctor - AI photo analysis
        </p>
      </div>
    </>
  );
}

/* ================= APP ================= */

function App() {
  const [tab, setTab] =
    useState<Tab>("home");

  const [name] =
    useState("किसान भाई");

  const [cart, setCart] =
    useState<Record<number, number>>(
      () => {
        try {
          return JSON.parse(
            localStorage.getItem(
              "ks_cart"
            ) || "{}"
          );
        } catch {
          return {};
        }
      }
    );

  const [crops, setCrops] =
    useState<Crop[]>(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "ks_crops"
          ) || "[]"
        );
      } catch {
        return [];
      }
    });

  const [chat, setChat] =
    useState<ChatMsg[]>(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "ks_chat"
          ) || "[]"
        );
      } catch {
        return [];
      }
    });

  const [q, setQ] =
    useState("");

  /* ================= STORAGE ================= */

  useEffect(() => {
    localStorage.setItem(
      "ks_cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(
      "ks_crops",
      JSON.stringify(crops)
    );
  }, [crops]);

  useEffect(() => {
    localStorage.setItem(
      "ks_chat",
      JSON.stringify(chat)
    );
  }, [chat]);

  /* ================= CART ================= */

  const count =
    Object.values(cart).reduce(
      (a, b) => a + b,
      0
    );

  const total =
    Object.entries(cart).reduce(
      (s, [id, n]) =>
        s +
        (products.find(
          (p) =>
            p.id === Number(id)
        )?.price || 0) *
          n,
      0
    );

  const add = (id: number) => {
    setCart((c) => ({
      ...c,
      [id]:
        (c[id] || 0) + 1,
    }));
  };

  const remove = (
    id: number
  ) => {
    setCart((c) => {
      const x = {
        ...c,
      };

      if (x[id] > 1) {
        x[id]--;
      } else {
        delete x[id];
      }

      return x;
    });
  };

  /* ================= AI CHAT ================= */

  const send = async (
    text = q
  ) => {
    const t =
      text.trim();

    if (!t) return;

    setChat((c) => [
      ...c,
      {
        from: "user",
        text: t,
      },
      {
        from: "ai",
        text:
          "AI Kisan सोच रहा है...",
      },
    ]);

    setQ("");

    try {
      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () =>
            controller.abort(),
          30000
        );

      const r =
        await fetch(
          `${API_BASE}/api/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                message: t,
              }),

            signal:
              controller.signal,
          }
        );

      clearTimeout(timeout);

      const data =
        await r
          .json()
          .catch(() => ({}));

      if (!r.ok) {
        throw new Error(
          data.error ||
            "AI service error"
        );
      }

      setChat((c) => {
        const copy = [
          ...c,
        ];

        const i =
          copy
            .map(
              (x) =>
                x.from
            )
            .lastIndexOf(
              "ai"
            );

        if (i >= 0) {
          copy[i] = {
            from: "ai",
            text:
              data.reply ||
              "AI से जवाब नहीं मिला।",
          };
        }

        return copy;
      });
    } catch (e) {
      const msg =
        e instanceof
          DOMException &&
        e.name ===
          "AbortError"
          ? "AI server ने समय पर जवाब नहीं दिया।"
          : e instanceof
            Error
          ? e.message
          : "AI सेवा से कनेक्शन नहीं हो पाया।";

      setChat((c) => {
        const copy = [
          ...c,
        ];

        const i =
          copy
            .map(
              (x) =>
                x.from
            )
            .lastIndexOf(
              "ai"
            );

        if (i >= 0) {
          copy[i] = {
            from: "ai",
            text:
              "❌ " + msg,
          };
        }

        return copy;
      });
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <style>
        {css}
      </style>

      <div className="app">

        <header>
          <button
            className="brand"
            style={{
              border: 0,
              background:
                "transparent",
              padding: 0,
            }}
            onClick={() =>
              setTab("home")
            }
          >
            <span className="logo">
              🌾
            </span>

            <span>
              KisanSaathi AI

              <small>
                आपका डिजिटल किसान दोस्त
              </small>
            </span>
          </button>

          <button
            className="profileIcon"
            onClick={() =>
              setTab(
                "profile"
              )
            }
          >
            <User size={20} />
          </button>
        </header>

        <main>

          {tab === "home" && (
            <HomePage
              setTab={setTab}
              name={name}
            />
          )}

          {tab === "mandi" && (
            <MandiPage
              setTab={setTab}
            />
          )}

          {tab === "weather" && (
            <WeatherPage
              setTab={setTab}
            />
          )}

          {tab === "crops" && (
            <CropsPage
              setTab={setTab}
              crops={crops}
              setCrops={
                setCrops
              }
            />
          )}

          {tab === "doctor" && (
            <DoctorPage
              setTab={setTab}
            />
          )}

          {tab === "store" && (
            <StorePage
              setTab={setTab}
              cart={cart}
              add={add}
            />
          )}

          {tab === "cart" && (
            <CartPage
              setTab={setTab}
              cart={cart}
              add={add}
              remove={remove}
              total={total}
            />
          )}

          {tab === "chat" && (
            <ChatPage
              setTab={setTab}
              chat={chat}
              q={q}
              setQ={setQ}
              send={send}
            />
          )}

          {tab === "profile" && (
            <ProfilePage
              setTab={setTab}
              name={name}
              crops={crops}
            />
          )}

        </main>

        <button
          className="fab"
          onClick={() =>
            setTab("chat")
          }
          aria-label="AI Kisan"
        >
          <MessageCircle size={23} />
        </button>

        <nav className="bottomNav">

          <Nav
            active={
              tab === "home"
            }
            on={() =>
              setTab("home")
            }
            icon={
              <Home size={19} />
            }
            text="Home"
          />

          <Nav
            active={
              tab === "crops"
            }
            on={() =>
              setTab("crops")
            }
            icon={
              <Leaf size={19} />
            }
            text="मेरी फसल"
          />

          <Nav
            active={
              tab === "store"
            }
            on={() =>
              setTab("store")
            }
            icon={
              <ShoppingCart
                size={19}
              />
            }
            text={
              count
                ? `Store (${count})`
                : "Store"
            }
          />

          <Nav
            active={
              tab === "profile"
            }
            on={() =>
              setTab(
                "profile"
              )
            }
            icon={
              <User size={19} />
            }
            text="Profile"
          />

        </nav>
      </div>
    </>
  );
}

/* ================= START ================= */

const root =
  document.getElementById(
    "root"
  );

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
