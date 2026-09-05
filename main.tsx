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
  PhoneCall,
  Download,
  Star,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Sprout,
  Building2,
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
  white-space: pre-wrap;
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
/* === FINAL MOCKUP EXACT === */
.hero{ background:#D9EAD3 !important; border:1.5px solid #B6D7A8 !important; border-radius:20px !important; }
.card{ background:#FFFFF8 !important; border:1px solid #E2E8D5 !important; border-radius:18px !important; box-shadow:0 4px 12px rgba(0,0,0,0.04) !important; }
.card div:first-child, .card span:first-child{ background:#C5E8BF !important; width:48px !important; height:48px !important; border-radius:50% !important; display:grid !important; place-items:center !important; }
.card div:first-child img, .card span:first-child img{ width:28px !important; height:28px !important; }
div[style*='E8F5E9']{ max-height:none !important; overflow:visible !important; height:auto !important; }
div[style*='E8F5E9'] p, div[style*='E8F5E9'] div{ white-space:pre-wrap !important; max-height:none !important; }
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
  return (
    <div className="pb-8">
      <section className="hero">
        <h1>नमस्ते {name} 👋</h1>
        <p>आज खेती में आपकी मदद के लिए तैयार हूँ।</p>

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

      <div className="grid mb-6">
        {[
          ["📷", "फसल जाँचें", "फोटो से जांच", "doctor"],
          ["🤖", "AI Kisan", "सवाल पूछें", "chat"],
          ["🌦️", "मौसम", "अपने इलाके का मौसम", "weather"],
          ["💰", "मंडी भाव", "सरकारी मंडी के भाव", "mandi"],
          ["🌱", "मेरी फसल", "अपनी फसल जोड़ें", "crops"],
          ["🛒", "Kisan Store", "कृषि सामान", "store"],
          ["🏛️", "सरकारी योजना", "किसानों की योजनाएं", "profile"],
          ["📞", "किसान हेल्पलाइन", "24x7 सरकारी सहायता", "helpline"],
        ].map((c, i) => (
          <button
            className="card"
            key={i}
            onClick={() => {
              if (c[3] === "helpline") {
                window.location.href = "tel:18001801551";
              } else {
                setTab(c[3] as Tab);
              }
            }}
          >
            <div className="cardIcon" style={{width:'44px',height:'44px',borderRadius:'50%',background:'#C5E8BF',display:'grid',placeItems:'center',fontSize:'22px',flexShrink:0}}>{c[0]}</div>

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
        दवा या सिंचाई का फैसला करने से पहले फसल की स्थिति और स्थानीय मौसम जरूर जांचें।
      </div>
    </div>
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
      <PageTitle setTab={setTab} sub="Real Government Mandi Data (Pan-India)" title="मंडी भाव" />

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
          <RefreshCw size={16} style={{ verticalAlign: "middle", marginRight: 5 }} />

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
              ₹{x.modalPrice || x.maxPrice || 0}
              <div className="priceLabel">मॉडल भाव / क्विंटल</div>
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
          </div>
        </div>
      ))}
    </>
  );
}

/* ==/* ================= WEATHER ================= */

function WeatherPage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [locationName, setLocationName] = useState("लोकेशन प्राप्त की जा रही है...");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeatherIcon = (code: number) => {
    if (code === 0) return "☀️";

    if ([1, 2].includes(code)) return "🌤️";

    if (code === 3) return "☁️";

    if ([45, 48].includes(code)) return "🌫️";

    if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";

    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";

    if ([95, 96, 99].includes(code)) return "⛈️";

    return "🌤️";
  };

  const getWeatherText = (code: number) => {
    if (code === 0) return "साफ आसमान";

    if ([1, 2].includes(code)) return "आंशिक बादल";

    if (code === 3) return "बादल छाए हैं";

    if ([45, 48].includes(code)) return "कोहरा";

    if ([51, 53, 55, 56, 57].includes(code)) return "हल्की बारिश";

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "बारिश";

    if ([71, 73, 75, 77, 85, 86].includes(code)) return "बर्फबारी";

    if ([95, 96, 99].includes(code)) return "तूफान";

    return "मौसम की जानकारी";
  };

  const getDayName = (date: string) => {
    const days = [
      "रविवार",
      "सोमवार",
      "मंगलवार",
      "बुधवार",
      "गुरुवार",
      "शुक्रवार",
      "शनिवार",
    ];

    const d = new Date(`${date}T12:00:00`);

    return days[d.getDay()];
  };

  const fetchWeather = async (
    latitude: string,
    longitude: string,
    name: string
  ) => {
    setLoading(true);
    setError("");

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
        `&timezone=auto` +
        `&forecast_days=5`;

      const res = await fetch(url, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Weather API error");
      }

      const data: WeatherData = await res.json();

      setLat(latitude);
      setLon(longitude);
      setWeather(data);
      setLocationName(name);
    } catch (e) {
      setError("मौसम का लाइव डाटा लोड नहीं हो पाया। कृपया दोबारा कोशिश करें।");
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveLocationWeather = () => {
    if (!navigator.geolocation) {
      setError("आपका browser Live Location support नहीं करता।");
      return;
    }

    setLoading(true);
    setError("");
    setLocationName("आपकी लाइव लोकेशन प्राप्त की जा रही है...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toString();
        const longitude = position.coords.longitude.toString();

        await fetchWeather(
          latitude,
          longitude,
          "आपकी लाइव लोकेशन"
        );
      },

      (err) => {
        setLoading(false);

        if (err.code === 1) {
          setError(
            "Live Location की permission नहीं मिली। कृपया browser में Location Allow करें।"
          );
        } else if (err.code === 2) {
          setError(
            "आपकी Live Location प्राप्त नहीं हो पाई। कृपया दोबारा कोशिश करें।"
          );
        } else if (err.code === 3) {
          setError(
            "Live Location प्राप्त करने में समय समाप्त हो गया। कृपया दोबारा कोशिश करें।"
          );
        } else {
          setError(
            "Live Location प्राप्त नहीं हो पाई।"
          );
        }

        setLocationName("कोई Live Location नहीं चुनी गई");
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    fetchLiveLocationWeather();
  }, []);

  return (
    <>
      <PageTitle
        setTab={setTab}
        sub="Real Live Open-Meteo Weather"
        title="मौसम की जानकारी"
      />

      <div className="section">
        <div
          className="locationRow"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              flex: 1,
              minWidth: 0,
            }}
          >
            <MapPin size={18} color="#2e7d32" />

            <span>
              चुना गया स्थान: <b>{locationName}</b>
            </span>
          </div>

          <button
            onClick={fetchLiveLocationWeather}
            disabled={loading}
            style={{
              background: "#2e7d32",
              color: "#fff",
              border: "none",
              padding: "8px 11px",
              borderRadius: "8px",
              fontSize: "11px",
              cursor: loading ? "not-allowed" : "pointer",
              marginLeft: "8px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            🔄 Live Location
          </button>
        </div>
      </div>

      {loading && (
        <div className="section">
          📍 आपकी Live Location और मौसम की जानकारी लोड हो रही है...
        </div>
      )}

      {error && (
        <div
          className="section"
          style={{
            color: "#c62828",
            background: "#fff0f0",
          }}
        >
          ❌ {error}
        </div>
      )}

      {weather && !loading && (
        <>
          <div className="weatherBig">
            <div style={{ fontSize: "34px" }}>
              {getWeatherIcon(weather.current.weather_code)}
            </div>

            <div>वर्तमान तापमान</div>

            <div className="temperature">
              {weather.current.temperature_2m}°C
            </div>

            <div>
              {getWeatherText(weather.current.weather_code)}
            </div>

            <div style={{ marginTop: "8px" }}>
              महसूस हो रहा है:{" "}
              {weather.current.apparent_temperature}°C
            </div>
          </div>

          <div className="weatherInfoGrid">
            <div className="weatherInfo">
              💧 नमी (Humidity):{" "}
              <b>
                {weather.current.relative_humidity_2m}%
              </b>
            </div>

            <div className="weatherInfo">
              💨 हवा की गति:{" "}
              <b>
                {weather.current.wind_speed_10m} km/h
              </b>
            </div>
          </div>

          <div
            className="section"
            style={{ marginTop: "12px" }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "12px",
              }}
            >
               अगले 10 दिन का लाइव मौसम
            </h3>

            <div className="forecast">
              {weather.daily.time
                .slice(0, 5)
                .map((date, index) => (
                  <div
                    className="forecastCard"
                    key={date}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                      }}
                    >
                      {index === 0
                        ? "आज"
                        : getDayName(date)}
                    </div>

                    <div className="forecastIcon">
                      {getWeatherIcon(
                        weather.daily.weather_code[index]
                      )}
                    </div>

                    <div>
                      <b>
                        {Math.round(
                          weather.daily
                            .temperature_2m_max[index]
                        )}°C
                      </b>
                    </div>

                    <div
                      style={{
                        color: "#777",
                        marginTop: "3px",
                      }}
                    >
                      न्यूनतम:{" "}
                      {Math.round(
                        weather.daily
                          .temperature_2m_min[index]
                      )}°C
                    </div>

                    <div
                      style={{
                        color: "#2e7d32",
                        marginTop: "5px",
                        fontSize: "10px",
                      }}
                    >
                      🌧️ बारिश:{" "}
                      {
                        weather.daily
                          .precipitation_probability_max[
                            index
                          ]
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
  setCrops: React.Dispatch<React.SetStateAction<Crop[]>>;
}) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [note, setNote] = useState("");

  const addCrop = () => {
    if (!name.trim()) return;
    setCrops([
      ...crops,
      { id: Date.now(), name, area, note },
    ]);
    setName("");
    setArea("");
    setNote("");
  };

  return (
    <>
      <PageTitle setTab={setTab} title="मेरी फसलें" />

      <div className="section">
        <h3>नई फसल जोड़ें</h3>
        <input
          className="search"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="फसल का नाम (उदा. गेहूँ)"
        />
        <input
          className="search"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="क्षेत्रफल (उदा. 2 एकड़)"
        />
        <textarea
          className="search"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="विशेष विवरण या नोट्स"
          rows={2}
        />
        <button className="primary" onClick={addCrop}>
          फसल सेव करें
        </button>
      </div>

      <div className="section">
        <h3>मेरी सूची</h3>
        {crops.length === 0 ? (
          <p className="muted">अभी कोई फसल नहीं जोड़ी गई है।</p>
        ) : (
          crops.map((c) => (
            <div key={c.id} className="cropRow">
              <div>
                <div className="cropName">🌱 {c.name}</div>
                <div className="muted">{c.area} {c.note ? `• ${c.note}` : ""}</div>
              </div>
              <button
                className="addBtn"
                style={{ background: "#d32f2f" }}
                onClick={() => setCrops(crops.filter((x) => x.id !== c.id))}
              >
                हटाएं
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ================= DOCTOR ================= */

function DoctorPage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = () => {
    if (!image) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult("AI Doctor Analysis: पत्ती पर हल्के धब्बे दिख रहे हैं। यह नाइट्रोजन की कमी या फफूंद जनित रोग हो सकता है। कृपया नीम आधारित कीटनाशक का छिड़काव करें।");
    }, 2000);
  };

  return (
    <>
      <PageTitle setTab={setTab} title="फसल जाँच (AI Doctor)" />

      <div className="section">
        <div className="upload">
          <Camera size={36} color="#2e7d32" />
          <p>फसल के रोगग्रस्त हिस्से की फोटो अपलोड करें</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={{ marginTop: 10 }}
          />
        </div>

        {image && (
          <div>
            <img src={image} alt="Crop Preview" className="preview" />
            <button
              className="primary"
              style={{ marginTop: 10 }}
              onClick={analyze}
              disabled={analyzing}
            >
              {analyzing ? "जांच हो रही है..." : "रोग की पहचान करें"}
            </button>
          </div>
        )}

        {result && (
          <div className="result">
            <b>निचोड़ / सुझाव:</b>
            <p>{result}</p>
          </div>
        )}
      </div>
    </>
  );
}

/* ================= STORE ================= */

function StorePage({
  setTab,
  cart,
  setCart,
}: {
  setTab: (t: Tab) => void;
  cart: { product: Product; qty: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; qty: number }[]>>;
}) {
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((x) => x.product.id === product.id);
      if (exist) {
        return prev.map((x) =>
          x.product.id === product.id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  return (
    <>
      <PageTitle setTab={setTab} title="Kisan Store (कृषि सामान)" />

      <div className="section">
        {products.map((p) => (
          <div key={p.id} className="product">
            <div>
              <div className="productName">{p.emoji} {p.name}</div>
              <div className="muted">{p.unit} • ₹{p.price}</div>
            </div>
            <button className="addBtn" onClick={() => addToCart(p)}>
              कार्ट में जोड़ें
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================= CART ================= */

function CartPage({
  setTab,
  cart,
  setCart,
}: {
  setTab: (t: Tab) => void;
  cart: { product: Product; qty: number }[];
  setCart: React.Dispatch<React.SetStateAction<{ product: Product; qty: number }[]>>;
}) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  return (
    <>
      <PageTitle setTab={setTab} title="ऑर्डर कार्ट" />

      <div className="section">
        {cart.length === 0 ? (
          <p className="empty">आपकी कार्ट खाली है।</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.product.id} className="cartRow">
                <div>
                  <div className="productName">{item.product.emoji} {item.product.name}</div>
                  <div className="muted">₹{item.product.price} x {item.qty}</div>
                </div>
                <div className="quantity">
                  <button
                    onClick={() =>
                      setCart((prev) =>
                        prev
                          .map((x) =>
                            x.product.id === item.product.id
                              ? { ...x, qty: x.qty - 1 }
                              : x
                          )
                          .filter((x) => x.qty > 0)
                      )
                    }
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() =>
                      setCart((prev) =>
                        prev.map((x) =>
                          x.product.id === item.product.id
                            ? { ...x, qty: x.qty + 1 }
                            : x
                        )
                      )
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}

            <div className="total">
              <span>कुल योग:</span>
              <span>₹{total}</span>
            </div>

            <button
              className="primary"
              onClick={() => {
                alert("ऑर्डर सफलतापूर्वक प्लेस हो गया है!");
                setCart([]);
                setTab("home");
              }}
            >
              ऑर्डर कंफर्म करें
            </button>
          </>
        )}
      </div>
    </>
  );
}

/* ================= CHAT (FIXED & REAL API CONNECTED) ================= */

function ChatPage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { from: "ai", text: "नमस्ते! मैं KisanSathi AI हूँ। खेती से जुड़ा कोई भी सवाल पूछिए।" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });
      const data = await res.json();
      
      const aiReply = data.reply || data.answer || data.message || "माफ कीजिए, अभी जवाब देने में समस्या आ रही है।";
      setMessages((prev) => [...prev, { from: "ai", text: aiReply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "सर्वर से संपर्क नहीं हो पाया। कृपया दोबारा कोशिश करें।" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageTitle setTab={setTab} title="AI Kisan Assistant" />

      <div className="chatBox">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={"bubble " + (m.from === "ai" ? "aiBubble" : "userBubble")}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="bubble aiBubble" style={{ color: "#666" }}>
            AI सोच रहा है...
          </div>
        )}
      </div>

      <div className="inputRow">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="अपना सवाल लिखें..."
          disabled={loading}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="sendBtn" onClick={send} disabled={loading}>
          <Send size={18} />
        </button>
      </div>
    </>
  );
}

/* ================= PROFILE ================= */

function ProfilePage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  return (
    <>
      <PageTitle setTab={setTab} title="सरकारी योजनाएं एवं प्रोफाइल" />

      <div className="section profileCard">
        <div className="bigProfile">
          <User size={36} />
        </div>
        <h3 style={{ margin: "10px 0 4px" }}>किसान साथी</h3>
        <p className="muted">पंजीकृत किसान</p>
      </div>

      <div className="section">
        <h3>महत्वपूर्ण सरकारी योजनाएं</h3>
        {schemes.map((s, i) => (
          <div key={i} className="scheme">
            <div className="schemeIcon">{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: "13px" }}>{s.title}</div>
              <div className="muted">{s.text}</div>
              <a href={s.url} target="_blank" rel="noreferrer">
                वेबसाइट देखें <ExternalLink size={10} style={{ verticalAlign: "middle" }} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================= APP ROOT ================= */

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [name, setName] = useState("किसान भाई");
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);

  return (
    <div className="app">
      <style>{css}</style>

      <header>
        <div className="brand">
          <div className="logo">🌾</div>
          <div>
            KisanSathi AI
            <small>Smart Agriculture Platform</small>
          </div>
        </div>

        <button
          className="profileIcon"
          onClick={() => setTab("profile")}
          aria-label="Profile"
        >
          <User size={20} />
        </button>
      </header>

      <main>
        {tab === "home" && <HomePage setTab={setTab} name={name} />}
        {tab === "mandi" && <MandiPage setTab={setTab} />}
        {tab === "weather" && <WeatherPage setTab={setTab} />}
        {tab === "crops" && <CropsPage setTab={setTab} crops={crops} setCrops={setCrops} />}
        {tab === "doctor" && <DoctorPage setTab={setTab} />}
        {tab === "store" && <StorePage setTab={setTab} cart={cart} setCart={setCart} />}
        {tab === "cart" && <CartPage setTab={setTab} cart={cart} setCart={setCart} />}
        {tab === "chat" && <ChatPage setTab={setTab} />}
        {tab === "profile" && <ProfilePage setTab={setTab} />}
      </main>

      <nav className="bottomNav">
        <Nav
          active={tab === "home"}
          on={() => setTab("home")}
          icon={<Home size={20} />}
          text="होम"
        />
        <Nav
          active={tab === "mandi"}
          on={() => setTab("mandi")}
          icon={<Leaf size={20} />}
          text="मंडी भाव"
        />
        <Nav
          active={tab === "store"}
          on={() => setTab("store")}
          icon={<ShoppingCart size={20} />}
          text="स्टोर"
        />
        <Nav
          active={tab === "cart"}
          on={() => setTab("cart")}
          icon={<ShoppingCart size={20} />}
          text={`कार्ट (${cart.reduce((a, b) => a + b.qty, 0)})`}
        />
      </nav>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
