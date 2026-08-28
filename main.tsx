import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home,
  Leaf,
  Camera,
  MessageCircle,
  CloudSun,
  ShoppingCart,
  Landmark,
  IndianRupee,
  Sprout,
  ArrowLeft,
  User,
  Stethoscope,
  Sun,
  X
} from "lucide-react";

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
};

type Mandi = {
  crop: string;
  mandi: string;
  price: number;
  unit: string;
};

const mandiData: Mandi[] = [
  { crop: "गेहूं", mandi: "दिल्ली मंडी", price: 2450, unit: "क्विंटल" },
  { crop: "गेहूं", mandi: "जयपुर मंडी", price: 2380, unit: "क्विंटल" },
  { crop: "सरसों", mandi: "भरतपुर मंडी", price: 5650, unit: "क्विंटल" },
  { crop: "सरसों", mandi: "अलवर मंडी", price: 5580, unit: "क्विंटल" },
  { crop: "चना", mandi: "जयपुर मंडी", price: 6200, unit: "क्विंटल" },
  { crop: "बाजरा", mandi: "हरियाणा मंडी", price: 2350, unit: "क्विंटल" },
  { crop: "मक्का", mandi: "इंदौर मंडी", price: 2250, unit: "क्विंटल" },
  { crop: "सोयाबीन", mandi: "इंदौर मंडी", price: 4650, unit: "क्विंटल" },
  { crop: "कपास", mandi: "अकोला मंडी", price: 7200, unit: "क्विंटल" }
];

const products: Product[] = [
  { id: 1, name: "नीम खली", price: 450, unit: "25 kg" },
  { id: 2, name: "जैविक खाद", price: 350, unit: "25 kg" },
  { id: 3, name: "सरसों बीज", price: 180, unit: "1 kg" },
  { id: 4, name: "गेहूं बीज", price: 65, unit: "1 kg" }
];

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [name] = useState("किसान भाई");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [chat, setChat] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === Number(id));
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const addToCart = (id: number) => {
    setCart(c => ({
      ...c,
      [id]: (c[id] || 0) + 1
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(c => {
      const copy = { ...c };

      if (!copy[id]) return copy;

      copy[id]--;

      if (copy[id] <= 0) {
        delete copy[id];
      }

      return copy;
    });
  };

  const askAI = () => {
    if (!q.trim()) return;

    const question = q.trim();

    setChat(c => [
      ...c,
      "आप: " + question,
      "AI किसान: आपकी फसल के लिए मौसम, मिट्टी और फसल की स्थिति को ध्यान में रखकर सलाह लेना बेहतर रहेगा।"
    ]);

    setQ("");
  };

  return (
    <div className="app">

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f4f7f1;
          color: #263126;
        }

        button {
          font-family: inherit;
        }

        .app {
          min-height: 100vh;
          max-width: 700px;
          margin: auto;
          background: #f4f7f1;
          padding-bottom: 80px;
        }

        header {
          background: white;
          padding: 15px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 1px 8px rgba(0,0,0,.08);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .brand {
          font-size: 19px;
          font-weight: 700;
          color: #28752e;
        }

        header small {
          color: #777;
        }

        .profileIcon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e8f5e9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #28752e;
        }

        main {
          padding: 14px;
        }

        .hero {
          background: linear-gradient(135deg,#e7f8df,#f7fff4);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 14px;
        }

        .hero h1 {
          margin: 0 0 7px;
          font-size: 23px;
        }

        .hero p {
          margin: 0 0 15px;
          color: #596359;
        }

        .weather {
          background: white;
          border-radius: 15px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .weather strong {
          font-size: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .card {
          border: 0;
          background: white;
          border-radius: 17px;
          padding: 16px 13px;
          min-height: 85px;
          box-shadow: 0 2px 8px rgba(0,0,0,.07);
          display: flex;
          align-items: center;
          gap: 11px;
          text-align: left;
          cursor: pointer;
        }

        .card:active {
          transform: scale(.98);
        }

        .cardIcon {
          font-size: 25px;
          width: 35px;
          text-align: center;
        }

        .cardTitle {
          font-weight: 700;
          font-size: 14px;
        }

        .cardSub {
          font-size: 12px;
          color: #777;
          margin-top: 4px;
        }

        .advice {
          background: white;
          border-radius: 17px;
          padding: 15px;
          margin-top: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }

        .pageTitle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .back {
          border: 0;
          background: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .pageTitle h2 {
          margin: 0;
        }

        .section {
          background: white;
          border-radius: 17px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,.05);
        }

        .mandiCard {
          background: white;
          border-radius: 16px;
          padding: 15px;
          margin-bottom: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mandiCrop {
          font-size: 17px;
          font-weight: 700;
        }

        .mandiName {
          font-size: 12px;
          color: #777;
          margin-top: 5px;
        }

        .mandiPrice {
          font-size: 18px;
          font-weight: 700;
          color: #28752e;
          text-align: right;
        }

        .product {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 0;
          border-bottom: 1px solid #eee;
        }

        .product:last-child {
          border-bottom: 0;
        }

        .productName {
          font-weight: 700;
        }

        .productUnit {
          font-size: 12px;
          color: #777;
          margin-top: 4px;
        }

        .addBtn {
          background: #2e7d32;
          color: white;
          border: 0;
          padding: 9px 13px;
          border-radius: 10px;
          cursor: pointer;
        }

        .chatBox {
          background: white;
          border-radius: 17px;
          padding: 15px;
          min-height: 350px;
        }

        .message {
          padding: 10px 12px;
          background: #edf7ea;
          border-radius: 12px;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .inputRow {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .inputRow input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 13px;
          font-size: 15px;
          min-width: 0;
        }

        .sendBtn {
          border: 0;
          background: #2e7d32;
          color: white;
          border-radius: 12px;
          padding: 0 17px;
        }

        .weatherBig {
          background: linear-gradient(135deg,#e8f7ff,#ffffff);
          border-radius: 20px;
          padding: 25px;
          text-align: center;
          margin-bottom: 12px;
        }

        .temperature {
          font-size: 52px;
          font-weight: 700;
          margin: 10px 0;
          color: #28752e;
        }

        .forecast {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 9px;
        }

        .forecastCard {
          background: white;
          border-radius: 15px;
          padding: 14px 8px;
          text-align: center;
        }

        .bottomNav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(700px,100%);
          background: white;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          padding: 8px 4px;
          box-shadow: 0 -2px 12px rgba(0,0,0,.1);
          z-index: 20;
        }

        .navBtn {
          border: 0;
          background: transparent;
          color: #777;
          font-size: 11px;
          padding: 5px;
          cursor: pointer;
        }

        .navBtn.active {
          color: #28752e;
          font-weight: 700;
        }

        .fab {
          position: fixed;
          right: 20px;
          bottom: 75px;
          width: 55px;
          height: 55px;
          border-radius: 50%;
          border: 0;
          background: #2e7d32;
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,.25);
          cursor: pointer;
          z-index: 15;
        }

        .cartTotal {
          font-size: 20px;
          font-weight: 700;
          color: #28752e;
          margin-top: 15px;
        }

        .empty {
          text-align: center;
          padding: 45px 15px;
          color: #777;
        }

        .closeBtn {
          float: right;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        @media(max-width:420px) {
          .grid {
            gap: 8px;
          }

          .card {
            padding: 13px 9px;
          }

          .cardTitle {
            font-size: 13px;
          }
        }
      `}</style>

      <header>
        <div>
          <div className="brand">🌾 KisanSaathi AI</div>
          <small>Aapka Digital Kisan Dost</small>
        </div>

        <div className="profileIcon">
          <User size={22} />
        </div>
      </header>

      <main>

        {tab === "home" && (
          <HomePage setTab={setTab} name={name} />
        )}

        {tab === "mandi" && (
          <MandiPage setTab={setTab} />
        )}

        {tab === "weather" && (
          <WeatherPage setTab={setTab} />
        )}

        {tab === "crops" && (
          <CropsPage setTab={setTab} />
        )}

        {tab === "doctor" && (
          <DoctorPage setTab={setTab} />
        )}

        {tab === "store" && (
          <StorePage
            setTab={setTab}
            products={products}
            addToCart={addToCart}
          />
        )}

        {tab === "cart" && (
          <CartPage
            setTab={setTab}
            products={products}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            total={total}
          />
        )}

        {tab === "chat" && (
          <ChatPage
            setTab={setTab}
            chat={chat}
            q={q}
            setQ={setQ}
            askAI={askAI}
          />
        )}

        {tab === "profile" && (
          <ProfilePage setTab={setTab} name={name} />
        )}

      </main>

      <button className="fab" onClick={() => setTab("chat")}>
        <MessageCircle size={25} />
      </button>

      <nav className="bottomNav">

        <button
          className={"navBtn " + (tab === "home" ? "active" : "")}
          onClick={() => setTab("home")}
        >
          <Home size={20} />
          <div>Home</div>
        </button>

        <button
          className={"navBtn " + (tab === "crops" ? "active" : "")}
          onClick={() => setTab("crops")}
        >
          <Leaf size={20} />
          <div>मेरी फसल</div>
        </button>

        <button
          className={"navBtn " + (tab === "store" ? "active" : "")}
          onClick={() => setTab("store")}
        >
          <ShoppingCart size={20} />
          <div>
            Store {cartCount > 0 ? `(${cartCount})` : ""}
          </div>
        </button>

        <button
          className={"navBtn " + (tab === "profile" ? "active" : "")}
          onClick={() => setTab("profile")}
        >
          <User size={20} />
          <div>Profile</div>
        </button>

      </nav>

    </div>
  );
}

function HomePage({
  setTab,
  name
}: {
  setTab: (t: Tab) => void;
  name: string;
}) {
  return (
    <>
      <section className="hero">
        <h1>Namaste {name} 👋</h1>

        <p>
          आज खेती में आपकी मदद के लिए तैयार हूँ।
        </p>

        <button
          className="weather"
          onClick={() => setTab("weather")}
          style={{
            width: "100%",
            border: 0,
            cursor: "pointer",
            textAlign: "left"
          }}
        >
          <CloudSun size={30} />

          <div>
            <strong>28°C · साफ मौसम</strong>

            <div style={{ color: "#777", fontSize: 12 }}>
              बारिश की संभावना: 20% · Demo Data
            </div>
          </div>
        </button>
      </section>

      <div className="grid">

        <button
          className="card"
          onClick={() => setTab("doctor")}
        >
          <div className="cardIcon">📸</div>

          <div>
            <div className="cardTitle">
              Fasal Check Karein
            </div>

            <div className="cardSub">
              देखें
            </div>
          </div>

          <Camera size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("chat")}
        >
          <div className="cardIcon">🤖</div>

          <div>
            <div className="cardTitle">
              AI Kisan
            </div>

            <div className="cardSub">
              देखें
            </div>
          </div>

          <MessageCircle size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("weather")}
        >
          <div className="cardIcon">🌦️</div>

          <div>
            <div className="cardTitle">
              Mausam
            </div>

            <div className="cardSub">
              मौसम देखें
            </div>
          </div>

          <CloudSun size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("mandi")}
        >
          <div className="cardIcon">💰</div>

          <div>
            <div className="cardTitle">
              Mandi Bhav
            </div>

            <div className="cardSub">
              आज के भाव देखें
            </div>
          </div>

          <IndianRupee size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("crops")}
        >
          <div className="cardIcon">🌱</div>

          <div>
            <div className="cardTitle">
              Meri Fasal
            </div>

            <div className="cardSub">
              देखें
            </div>
          </div>

          <Leaf size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("store")}
        >
          <div className="cardIcon">🛒</div>

          <div>
            <div className="cardTitle">
              Kisan Store
            </div>

            <div className="cardSub">
              देखें
            </div>
          </div>

          <ShoppingCart size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("profile")}
        >
          <div className="cardIcon">🏛️</div>

          <div>
            <div className="cardTitle">
              Sarkari Yojana
            </div>

            <div className="cardSub">
              देखें
            </div>
          </div>

          <Landmark size={19} />
        </button>

      </div>

      <div className="advice">
        ⚠️ <b>खेती की सलाह</b>

        <br />

        <span style={{ fontSize: 13 }}>
          कल बारिश की संभावना है। सिंचाई का निर्णय लेने से पहले
          स्थानीय forecast चेक करें।
        </span>
      </div>
    </>
  );
}

function MandiPage({
  setTab
}: {
  setTab: (t: Tab) => void;
}) {
  return (
    <>
      <div className="pageTitle">
        <button
          className="back"
          onClick={() => setTab("home")}
        >
          <ArrowLeft size={21} />
        </button>

        <div>
          <h2>💰 Mandi Bhav</h2>

          <small style={{ color: "#777" }}>
            आज के Demo मंडी भाव
          </small>
        </div>
      </div>

      <div className="section">
        <b>📍 फसल के आज के भाव</b>

        <p style={{ color: "#777", fontSize: 12 }}>
          भाव Demo Data हैं। वास्तविक भाव स्थानीय मंडी से verify करें।
        </p>
      </div>

      {mandiData.map((item, index) => (
        <div className="mandiCard" key={index}>

          <div>
            <div className="mandiCrop">
              🌾 {item.crop}
            </div>

            <div className="mandiName">
              {item.mandi}
            </div>
          </div>

          <div className="mandiPrice">
            ₹{item.price.toLocaleString("en-IN")}

            <div
              style={{
                fontSize: 11,
                color: "#777"
              }}
            >
              / {item.unit}
            </div>
          </div>

        </div>
      ))}
    </>
  );
}

function WeatherPage({
  setTab
}: {
  setTab: (t: Tab) => void;
}) {
  return (
    <>
      <div className="pageTitle">

        <button
          className="back"
          onClick={() => setTab("home")}
        >
          <ArrowLeft size={21} />
        </button>

        <div>
          <h2>🌦️ Mausam</h2>

          <small style={{ color: "#777" }}>
            आज का मौसम
          </small>
        </div>

      </div>

      <div className="weatherBig">

        <Sun size={55} />

        <div className="temperature">
          28°C
        </div>

        <h3 style={{ margin: 5 }}>
          साफ मौसम
        </h3>

        <p style={{ color: "#777" }}>
          बारिश की संभावना: 20%
        </p>

      </div>

      <div className="section">

        <h3>🌾 किसान के लिए मौसम सलाह</h3>

        <p>
          आज मौसम खेती के लिए सामान्य है।
          सिंचाई और खेत में काम करने से पहले स्थानीय
          मौसम की स्थिति जरूर देखें।
        </p>

      </div>

      <div className="section">

        <h3>📅 अगले कुछ दिनों का अनुमान</h3>

        <div className="forecast">

          <div className="forecastCard">
            <b>आज</b>
            <div style={{ fontSize: 28, margin: 8 }}>
              ☀️
            </div>
            <b>28°C</b>
            <div style={{ fontSize: 11, color: "#777" }}>
              बारिश 20%
            </div>
          </div>

          <div className="forecastCard">
            <b>कल</b>
            <div style={{ fontSize: 28, margin: 8 }}>
              🌦️
            </div>
            <b>27°C</b>
            <div style={{ fontSize: 11, color: "#777" }}>
              बारिश 60%
            </div>
          </div>

          <div className="forecastCard">
            <b>परसों</b>
            <div style={{ fontSize: 28, margin: 8 }}>
              ☁️
           
