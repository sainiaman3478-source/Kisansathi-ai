Import React, { useEffect, useMemo, useState } from "react";
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
              <div>₹{x.modalPrice || 0}</di
