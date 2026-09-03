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

/* ================= HOME (Play Store Style Download Page integrated) ================= */

function HomePage({
  setTab,
  name,
}: {
  setTab: (t: Tab) => void;
  name: string;
}) {
  const apkDownloadUrl = "https://github.com/sainiaman3478-source/Kisansathi-ai/raw/refs/heads/main/app-release.apk";

  return (
    <div className="pb-8">
      {/* Play Store Style Hero Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
        <div className="w-28 h-28 bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl shadow-lg flex items-center justify-center text-white text-5xl flex-shrink-0">
          🌱
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">KisanSathi AI - Kisan App</h1>
          <p className="text-green-700 font-medium text-sm mt-1">KisanSathi Tech • Tools & Agriculture</p>
          
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 my-4 text-xs text-slate-600">
            <div className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-md">
              <span className="font-bold text-slate-800">4.8</span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-slate-500">(12K+ reviews)</span>
            </div>
            <div className="border-l border-slate-300 h-4"></div>
            <div>
              <span className="font-bold text-slate-800">10K+</span> Downloads
            </div>
            <div className="border-l border-slate-300 h-4"></div>
            <div className="bg-slate-100 px-2 py-0.5 rounded font-bold">3+</div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <a 
              href={apkDownloadUrl}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-center no-underline"
              style={{ background: '#2e7d32', color: '#fff', textDecoration: 'none', display: 'inline-flex', gap: '8px' }}
            >
              <Download className="w-5 h-5" />
              <span>Download APK (Free)</span>
            </a>
            <div className="flex items-center text-xs text-slate-500 space-x-1 mt-2 sm:mt-0">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Verified Safe & Secure App</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3" style={{ background: '#edf7ea', border: '1px solid #c8e6c9', padding: '12px', borderRadius: '12px', display: 'flex', gap: '10px' }}>
        <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-emerald-900">
          <p className="font-semibold" style={{ fontWeight: 'bold', margin: '0 0 4px' }}>Safe Download Guarantee</p>
          <p className="text-emerald-700 text-xs m-0" style={{ fontSize: '11px', color: '#2e7d32' }}>Ye app bilkul surakshit hai. Agar phone mein "Harmful App" ki warning aaye, toh **"Install Anyway"** par click karke aasani se chala sakte hain.</p>
        </div>
      </div>

      {/* Original Web Tools Quick Navigation */}
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

      {/* Features Grid */}
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
            <div className="cardIcon">{c[0]}</div>
            <div>
              <div className="cardTitle">{c[1]}</div>
              <div className="cardSub">{c[2]}</div>
            </div>
          </button>
        ))}
      </div>

      {/* App Key Features list */}
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

      const data: any = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "मंडी डेटा लोड करने में विफल");
      }

      setRecords(data.records || []);
      setSource(data.source || "");
      setHasLoaded(true);
    } catch (err: any) {
      setError(err?.message || "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMandi();
  }, []);

  return (
    <div>
      <PageTitle setTab={setTab} title="मंडी भाव" sub="ताज़ा सरकारी मंडी भाव" />

      <div className="section">
        <input
          className="search"
          placeholder="फसल का नाम खोजें (जैसे: गेहूं, धान)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadMandi()}
        />

        <div className="filterGrid">
          <input
            className="search"
            placeholder="राज्य (जैसे: Uttar Pradesh)"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
          <input
            className="search"
            placeholder="मंडी / मार्केट"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
          />
        </div>

        <button className="primary" onClick={loadMandi} disabled={loading}>
          {loading ? "लोड हो रहा है..." : "भाव खोजें"}
        </button>
      </div>

      {source && (
        <div className="mandiStatus">
          📡 स्रोत: <b>{source}</b> | कुल रिकॉर्ड: <b>{records.length}</b>
        </div>
      )}

      {error && <div className="advice" style={{ background: "#fde8e8", color: "#c53030" }}>{error}</div>}

      {loading && !hasLoaded ? (
        <div className="empty">मंडी भाव लोड हो रहे हैं...</div>
      ) : records.length === 0 && hasLoaded ? (
        <div className="empty">कोई रिकॉर्ड नहीं मिला। कृपया दूसरा नाम खोजें।</div>
      ) : (
        records.map((r, idx) => (
          <div className="mandiCard" key={idx}>
            <div className="mandiTop">
              <div>
                <div className="mandiCrop">{r.commodity}</div>
                <div className="mandiMarket">
                  {r.market}, {r.district} ({r.state})
                </div>
              </div>
              <div className="mandiPrice">
                ₹{r.modalPrice} <span className="priceLabel">/ क्विंटल</span>
              </div>
            </div>

            <div className="mandiDetails">
              <div className="mandiDetail">
                न्यूनतम भाव
                <b>₹{r.minPrice}</b>
              </div>
              <div className="mandiDetail">
                अधिकतम भाव
                <b>₹{r.maxPrice}</b>
              </div>
            </div>
            <div className="muted">दिनांक: {r.arrivalDate}</div>
          </div>
        ))
      )}
    </div>
  );
}

/* ================= WEATHER ================= */

function WeatherPage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  const [lat, setLat] = useState("28.6139");
  const [lon, setLon] = useState("77.2090");
  const [locationName, setLocationName] = useState("दिल्ली (New Delhi)");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async (latitude: string, longitude: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max`
      );
      const data = await res.json();
      if (!res.ok) throw new Error("मौसम डेटा लोड नहीं हो सका");
      setWeather(data);
    } catch (err: any) {
      setError(err?.message || "मौसम लोड करने में त्रुटि");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(lat, lon);
  }, []);

  const getWeatherDesc = (code: number) => {
    if (code === 0) return { text: "साफ आसमान", icon: "☀️" };
    if (code <= 3) return { text: "आंशिक बादल", icon: "⛅" };
    if (code <= 48) return { text: "कोहरा / धुंध", icon: "🌫️" };
    if (code <= 67) return { text: "बारिश", icon: "🌧️" };
    if (code <= 77) return { text: "बर्फबारी", icon: "❄️" };
    return { text: "तूफानी / बारिश", icon: "⛈️" };
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      alert("आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nLat = pos.coords.latitude.toFixed(4);
        const nLon = pos.coords.longitude.toFixed(4);
        setLat(nLat);
        setLon(nLon);
        setLocationName(`GPS: ${nLat}, ${nLon}`);
        fetchWeather(nLat, nLon);
      },
      (err) => {
        setLoading(false);
        alert("लोकेशन प्राप्त करने में विफल: " + err.message);
      }
    );
  };

  return (
    <div>
      <PageTitle setTab={setTab} title="मौसम की जानकारी" sub="Live Weather Forecast" />

      <div className="locationRow">
        <MapPin size={18} color="#2e7d32" />
        <span style={{ flex: 1, fontWeight: "bold" }}>{locationName}</span>
        <button
          className="addBtn"
          onClick={handleGeoLocation}
          style={{ background: "#e8f5e9", color: "#2e7d32", border: "0" }}
        >
          GPS खोजें
        </button>
      </div>

      {error && <div className="advice" style={{ background: "#fde8e8", color: "#c53030" }}>{error}</div>}

      {loading && !weather ? (
        <div className="empty">मौसम की जानकारी लोड हो रही है...</div>
      ) : weather ? (
        <>
          <div className="weatherBig">
            <div style={{ fontSize: "40px" }}>
              {getWeatherDesc(weather.current.weather_code).icon}
            </div>
            <div className="temperature">
              {Math.round(weather.current.temperature_2m)}°C
            </div>
            <div style={{ fontWeight: "bold", fontSize: "16px", color: "#28752e" }}>
              {getWeatherDesc(weather.current.weather_code).text}
            </div>
            <div className="muted">
              महसूस होता है: {Math.round(weather.current.apparent_temperature)}°C
            </div>
          </div>

          <div className="weatherInfoGrid">
            <div className="weatherInfo">
              💧 नमी (Humidity)
              <br />
              <b style={{ fontSize: "15px" }}>{weather.current.relative_humidity_2m}%</b>
            </div>
            <div className="weatherInfo">
              💨 हवा की गति
              <br />
              <b style={{ fontSize: "15px" }}>{weather.current.wind_speed_10m} किमी/घंटा</b>
            </div>
          </div>

          <div className="section" style={{ marginTop: "15px" }}>
            <h3 style={{ fontSize: "15px", marginBottom: "10px" }}>आगामी 3 दिन का अनुमान</h3>
            <div className="forecast">
              {weather.daily.time.slice(1, 4).map((dateStr, idx) => {
                const code = weather.daily.weather_code[idx + 1];
                const maxT = weather.daily.temperature_2m_max[idx + 1];
                const minT = weather.daily.temperature_2m_min[idx + 1];
                const desc = getWeatherDesc(code);
                const dayName = new Date(dateStr).toLocaleDateString("hi-IN", {
                  weekday: "short",
                });
                return (
                  <div className="forecastCard" key={idx}>
                    <div>{dayName}</div>
                    <div className="forecastIcon">{desc.icon}</div>
                    <div style={{ fontWeight: "bold" }}>
                      {Math.round(maxT)}° / {Math.round(minT)}°
                    </div>
                    <div className="muted" style={{ fontSize: "9px" }}>{desc.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ================= CROPS ================= */

function CropsPage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  const [crops, setCrops] = useState<Crop[]>([
    { id: 1, name: "गेहूं (Wheat)", area: "2 एकड़", note: "सिंचाई बाकी है" },
    { id: 2, name: "धान (Paddy)", area: "1.5 एकड़", note: "खाاد डाली जा चुकी है" },
  ]);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [note, setNote] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const addCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCrops([
      ...crops,
      {
        id: Date.now(),
        name: name.trim(),
        area: area.trim() || "1 एकड़",
        note: note.trim() || "सामान्य देखरेख",
      },
    ]);
    setName("");
    setArea("");
    setNote("");
    setShowAdd(false);
  };

  const deleteCrop = (id: number) => {
    setCrops(crops.filter((c) => c.id !== id));
  };

  return (
    <div>
      <PageTitle setTab={setTab} title="मेरी फसल" sub="खेत और फसलों का प्रबंधन" />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "16px" }}>आपकी पंजीकृत फसलें</h3>
        <button className="addBtn" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "बंद करें" : "+ फसल जोड़ें"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addCrop} className="section" style={{ background: "#f8fcf7" }}>
          <input
            className="search"
            placeholder="फसल का नाम (जैसे: सरसों, कपास)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="search"
            placeholder="क्षेत्रफल (जैसे: 2 एकड़)"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
          <input
            className="search"
            placeholder="विशेष नोट (जैसे: खाद डालनी है)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button type="submit" className="primary">
            फसल सुरक्षित करें
          </button>
        </form>
      )}

      <div className="section">
        {crops.length === 0 ? (
          <div className="empty">कोई फसल नहीं जोड़ी गई है। ऊपर दिए गए बटन से जोड़ें।</div>
        ) : (
          crops.map((c) => (
            <div className="cropRow" key={c.id}>
              <div>
                <div className="cropName">{c.name}</div>
                <div className="muted">क्षेत्र: {c.area} | नोट: {c.note}</div>
              </div>
              <button
                onClick={() => deleteCrop(c.id)}
                style={{ border: "0", background: "#fde8e8", color: "#c53030", padding: "6px 10px", borderRadius: "8px", fontSize: "11px" }}
              >
                हटाएं
              </button>
            </div>
          ))
        )}
      </div>
    </div>
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeCrop = () => {
    if (!image) return;
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(
        "🔍 **AI डॉक्टर विश्लेषण:**\nफसल के पत्तों पर हल्के पीले धब्बे दिखाई दे रहे हैं जो 'नाइट्रोजन की कमी' या शुरुआती 'ब्लाइट रोग' का संकेत हो सकते हैं।\n\n💡 **सुझाव:**\n1. नीम आधारित कीटनाशक का छिड़काव करें।\n2. खेत में जलभराव न होने दें।\n3. जरूरत पड़ने पर नज़दीکی कृषि केंद्र से संपर्क करें।"
      );
    }, 2000);
  };

  return (
    <div>
      <PageTitle setTab={setTab} title="फसल डॉक्टर (AI)" sub="फसल की बीमारी की पहचान" />

      <div className="section">
        <div className="upload">
          <Camera size={40} color="#2e7d32" style={{ marginBottom: "8px" }} />
          <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>
            बीमार फसल या पत्ते की फोटो अपलोड करें
          </div>
          <div className="muted" style={{ marginBottom: "12px" }}>कैमरे से खींचें या गैलरी से चुनें</div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
            id="cropPhoto"
          />
          <label
            htmlFor="cropPhoto"
            className="primary"
            style={{ display: "inline-block", cursor: "pointer", padding: "10px 20px" }}
          >
            फोटो चुनें
          </label>
        </div>

        {image && (
          <div style={{ textAlign: "center", marginTop: "12px" }}>
            <img src={image} alt="Crop Preview" className="preview" />
            <br />
            <button
              className="primary"
              style={{ marginTop: "10px" }}
              onClick={analyzeCrop}
              disabled={analyzing}
            >
              {analyzing ? "जांच हो रही है..." : "फसल की जांच करें"}
            </button>
          </div>
        )}

        {result && (
          <div className="result" style={{ whiteSpace: "pre-wrap" }}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STORE ================= */

function StorePage({
  setTab,
  cart,
  setCart,
}: {
  setTab: (t: Tab) => void;
  cart: { [key: number]: number };
  setCart: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
}) {
  const updateCart = (id: number, delta: number) => {
    setCart((prev) => {
      const cur = prev[id] || 0;
      const next = cur + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }, [cart]);

  return (
    <div>
      <PageTitle setTab={setTab} title="Kisan Store" sub="बीज, खाद और कृषि उपकरण" />

      <div className="section">
        {products.map((p) => {
          const qty = cart[p.id] || 0;
          return (
            <div className="product" key={p.id}>
              <div style={{ fontSize: "28px" }}>{p.emoji}</div>
              <div style={{ flex: 1, marginLeft: "8px" }}>
                <div className="productName">{p.name}</div>
                <div className="muted">{p.unit}</div>
                <div style={{ fontWeight: "bold", color: "#2e7d32", marginTop: "2px" }}>
                  ₹{p.price}
                </div>
              </div>
              {qty === 0 ? (
                <button className="addBtn" onClick={() => updateCart(p.id, 1)}>
                  जोड़ें
                </button>
              ) : (
                <div className="quantity">
                  <button onClick={() => updateCart(p.id, -1)}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: "bold", fontSize: "14px" }}>{qty}</span>
                  <button onClick={() => updateCart(p.id, 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalItems > 0 && (
        <button
          className="primary"
          style={{ position: "fixed", bottom: "70px", left: "12px", right: "12px", width: "calc(100% - 24px)", maxWidth: "676px", margin: "auto", zIndex: 25 }}
          onClick={() => setTab("cart")}
        >
          कार्ट देखें ({totalItems} वस्तुएं) - आगे बढ़ें
        </button>
      )}
    </div>
  );
}

/* ================= CART ================= */

function CartPage({
  setTab,
  cart,
  setCart,
}: {
  setTab: (t: Tab) => void;
  cart: { [key: number]: number };
  setCart: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
}) {
  const items = useMemo(() => {
    return Object.entries(cart)
      .map(([idStr, qty]) => {
        const prod = products.find((p) => p.id === Number(idStr));
        return { prod, qty };
      })
      .filter((x): x is { prod: Product; qty: number } => Boolean(x.prod));
  }, [cart]);

  const subTotal = useMemo(() => {
    return items.reduce((acc, { prod, qty }) => acc + prod.price * qty, 0);
  }, [items]);

  const [ordered, setOrdered] = useState(false);

  if (ordered) {
    return (
      <div style={{ textAlign: "center", padding: "50px 20px" }}>
        <CheckCircle2 size={60} color="#2e7d32" style={{ margin: "auto", marginBottom: "15px" }} />
        <h2>ऑर्डर सफल रहा!</h2>
        <p className="muted" style={{ marginBottom: "20px" }}>आपका कृषि सामान जल्द ही आपके पते पर भेज दिया जाएगा।</p>
        <button className="primary" onClick={() => { setCart({}); setTab("home"); }}>
          होम पर वापस जाएं
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageTitle setTab={setTab} title="आपकी कार्ट" sub="ऑर्डर की समीक्षा" />

      <div className="section">
        {items.length === 0 ? (
          <div className="empty">आपकी कार्ट खाली है।</div>
        ) : (
          <>
            {items.map(({ prod, qty }) => (
              <div className="cartRow" key={prod.id}>
                <div>
                  <div className="productName">{prod.name}</div>
                  <div className="muted">₹{prod.price} x {qty}</div>
                </div>
                <div style={{ fontWeight: "bold" }}>₹{prod.price * qty}</div>
              </div>
            ))}

            <div className="total">
              <span>कुल राशि:</span>
              <span style={{ color: "#2e7d32" }}>₹{subTotal}</span>
            </div>

            <button
              className="primary"
              style={{ marginTop: "15px" }}
              onClick={() => setOrdered(true)}
            >
              ऑर्डर कंफर्म करें (Cash on Delivery)
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ================= PROFILE ================= */

function ProfilePage({
  setTab,
  name,
  setName,
}: {
  setTab: (t: Tab) => void;
  name: string;
  setName: (n: string) => void;
}) {
  const [tempName, setTempName] = useState(name);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    setName(tempName.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageTitle setTab={setTab} title="सरकारी योजनाएं व प्रोफाइल" sub="योजनाएं और व्यक्तिगत जानकारी" />

      <div className="section profileCard" style={{ padding: "20px" }}>
        <div className="bigProfile">
          <User size={36} />
        </div>
        <h3 style={{ margin: "10px 0 4px" }}>{name}</h3>
        <p className="muted" style={{ margin: 0 }}>सक्रिय किसान सदस्य</p>

        <form onSubmit={handleSave} style={{ marginTop: "15px", textAlign: "left" }}>
          <label className="muted" style={{ display: "block", marginBottom: "5px" }}>आपका नाम बदलें</label>
          <input
            className="search"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />
          <button type="submit" className="primary">नाम सुरक्षित करें</button>
          {saved && <div style={{ color: "#2e7d32", fontSize: "11px", marginTop: "6px", textAlign: "center" }}>नाम सफलतापूर्वक सहेज लिया गया!</div>}
        </form>
      </div>

      <div className="section">
        <h3 style={{ fontSize: "15px", marginBottom: "10px" }}>महत्वपूर्ण सरकारी योजनाएं</h3>
        {schemes.map((s, idx) => (
          <div className="scheme" key={idx}>
            <div className="schemeIcon">{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: "13px" }}>{s.title}</div>
              <div className="muted">{s.text}</div>
            </div>
            <a href={s.url} target="_blank" rel="noreferrer">
              देखें <ExternalLink size={12} style={{ verticalAlign: "middle" }} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= CHAT ================= */

function ChatPage({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      from: "ai",
      text: "नमस्ते! मैं आपका AI किसान मित्र हूँ। फसल, खाद, कीटनाशक या मौसम से जुड़ा कोई भी सवाल पूछिए।",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMsg = { from: "user", text: q.trim() };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    setTimeout(() => {
      let reply = "फसल की अच्छी पैदावार के लिए समय पर सिंचाई और संतुलित उर्वरक बहुत जरूरी हैं। ";
      if (q.includes("कीड़ा") || q.includes("रोग") || q.includes("बीमारी")) {
        reply = "कीट या रोग की रोकथाम के लिए नीम के तेल का छिड़काव या अनुशंसित कीटनाशक का प्रयोग करें। प्रभावित पत्ते की फोटो 'फसल डॉक्टर' में अपलोड करके सटीक सलाह ले सकते हैं।";
      } else if (q.includes("खाद") || q.includes("यूरिया")) {
        reply = "यूरिया का प्रयोग फसल की वानस्पतिक वृद्धि के समय हल्की सिंचाई के बाद करना सबसे अच्छा रहता है।";
      } else if (q.includes("गेहूं") || q.includes("धान")) {
        reply = `${q.replace("के बारे में बताओ", "")} की फसल में खरपतवार नियंत्रण और समय पर पानी देना बेहद आवश्यक है।`;
      }
      setMessages((prev) => [...prev, { from: "ai", text: reply }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      <PageTitle setTab={setTab} title="AI Kisan Chat" sub="कृषि विशेषज्ञ से सलाह लें" />

      <div className="chatBox">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={"bubble " + (m.from === "ai" ? "aiBubble" : "userBubble")}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="bubble aiBubble">जवाब लिखा जा रहा है...</div>}
      </div>

      <div className="quick">
        {["गेहूं की खेती कैसे करें?", "कीट नियंत्रण के उपाय", "यूरिया कब डालें?"].map((q, i) => (
          <button key={i} onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="inputRow">
        <input
          placeholder="अपना सवाल यहाँ लिखें..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="sendBtn primary" onClick={() => send()} disabled={loading}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

/* ================= MAIN APP ================= */

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [name, setName] = useState("किसान भाई");
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = css;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="app">
      <header>
        <div className="brand" onClick={() => setTab("home")} style={{ cursor: "pointer" }}>
          <div className="logo">🌱</div>
          <div>
            KisanSathi AI
            <small>डिजिटल किसान सहायक</small>
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
        {tab === "crops" && <CropPage setTab={setTab} />}
        {tab === "doctor" && <DoctorPage setTab={setTab} />}
        {tab === "store" && <StorePage setTab={setTab} cart={cart} setCart={setCart} />}
        {tab === "cart" && <CartPage setTab={setTab} cart={cart} setCart={setCart} />}
        {tab === "profile" && <ProfilePage setTab={setTab} name={name} setName={setName} />}
        {tab === "chat" && <ChatPage setTab={setTab} />}
      </main>

      <button
        className="fab"
        onClick={() => setTab("chat")}
        aria-label="Chat AI"
      >
        <MessageCircle size={24} />
      </button>

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
          active={tab === "chat"}
          on={() => setTab("chat")}
          icon={<MessageCircle size={20} />}
          text="AI चैट"
        />
      </nav>
    </div>
  );
}

if (typeof document !== "undefined") {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
}
