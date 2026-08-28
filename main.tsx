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
  Cloud,
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
  {
    crop: "गेहूं",
    mandi: "दिल्ली मंडी",
    price: 2450,
    unit: "क्विंटल"
  },
  {
    crop: "गेहूं",
    mandi: "जयपुर मंडी",
    price: 2380,
    unit: "क्विंटल"
  },
  {
    crop: "सरसों",
    mandi: "भरतपुर मंडी",
    price: 5650,
    unit: "क्विंटल"
  },
  {
    crop: "सरसों",
    mandi: "अलवर मंडी",
    price: 5580,
    unit: "क्विंटल"
  },
  {
    crop: "चना",
    mandi: "जयपुर मंडी",
    price: 6200,
    unit: "क्विंटल"
  },
  {
    crop: "बाजरा",
    mandi: "हरियाणा मंडी",
    price: 2350,
    unit: "क्विंटल"
  },
  {
    crop: "मक्का",
    mandi: "इंदौर मंडी",
    price: 2250,
    unit: "क्विंटल"
  },
  {
    crop: "सोयाबीन",
    mandi: "इंदौर मंडी",
    price: 4650,
    unit: "क्विंटल"
  },
  {
    crop: "कपास",
    mandi: "अकोला मंडी",
    price: 7200,
    unit: "क्विंटल"
  }
];

const products: Product[] = [
  {
    id: 1,
    name: "नीम खली",
    price: 450,
    unit: "25 kg"
  },
  {
    id: 2,
    name: "जैविक खाद",
    price: 350,
    unit: "25 kg"
  },
  {
    id: 3,
    name: "सरसों बीज",
    price: 180,
    unit: "1 kg"
  },
  {
    id: 4,
    name: "गेहूं बीज",
    price: 65,
    unit: "1 kg"
  }
];

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [name] = useState("किसान भाई");

  const [cart, setCart] = useState<Record<number, number>>({});

  const [chat, setChat] = useState<string[]>([]);

  const [q, setQ] = useState("");

  const cartCount = Object.values(cart).reduce(
    (a, b) => a + b,
    0
  );

  const total = Object.entries(cart).reduce(
    (sum, [id, qty]) => {
      const product = products.find(
        item => item.id === Number(id)
      );

      return sum + (product ? product.price * qty : 0);
    },
    0
  );

  const addToCart = (id: number) => {
    setCart(current => ({
      ...current,
      [id]: (current[id] || 0) + 1
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(current => {
      const copy = { ...current };

      if (!copy[id]) {
        return copy;
      }

      copy[id]--;

      if (copy[id] <= 0) {
        delete copy[id];
      }

      return copy;
    });
  };

  const askAI = () => {
    const question = q.trim();

    if (!question) {
      return;
    }

    setChat(current => [
      ...current,
      "आप: " + question,
      "AI किसान: आपकी फसल की समस्या के लिए मौसम, मिट्टी और फसल की स्थिति को ध्यान में रखना जरूरी है। साफ फोटो और फसल की जानकारी देने पर बेहतर सलाह मिल सकती है।"
    ]);

    setQ("");
  };

  return (
    <div className="app">

      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: #f4f7f1;
          color: #263126;
        }

        body {
          min-height: 100vh;
        }

        button,
        input {
          font-family: inherit;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        .app {
          min-height: 100vh;
          max-width: 700px;
          margin: auto;
          background: #f4f7f1;
          padding-bottom: 85px;
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
          width: 42px;
          height: 42px;
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
          background: linear-gradient(
            135deg,
            #e7f8df,
            #f7fff4
          );
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

        .weatherButton {
          background: white;
          border-radius: 15px;
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          border: 0;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 2px 7px rgba(0,0,0,.05);
        }

        .weatherButton strong {
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
          min-height: 88px;
          box-shadow: 0 2px 8px rgba(0,0,0,.07);
          display: flex;
          align-items: center;
          gap: 9px;
          text-align: left;
          cursor: pointer;
        }

        .card:active {
          transform: scale(.98);
        }

        .cardIcon {
          font-size: 25px;
          width: 34px;
          min-width: 34px;
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
          line-height: 1.6;
        }

        .pageTitle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .pageTitle h2 {
          margin: 0;
        }

        .pageTitle small {
          color: #777;
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
          box-shadow: 0 1px 5px rgba(0,0,0,.06);
        }

        .section {
          background: white;
          border-radius: 17px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,.05);
        }

        .section h3 {
          margin-top: 0;
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
          gap: 10px;
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
          gap: 10px;
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

        .addBtn:active {
          transform: scale(.97);
        }

        .weatherBig {
          background: linear-gradient(
            135deg,
            #e8f7ff,
            #ffffff
          );
          border-radius: 20px;
          padding: 28px 20px;
          text-align: center;
          margin-bottom: 12px;
        }

        .temperature {
          font-size: 52px;
          font-weight: 700;
          margin: 10px 0;
          color: #28752e;
        }

        .weatherInfoGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 12px;
        }

        .weatherInfo {
          background: #f7faf6;
          border-radius: 14px;
          padding: 14px;
          text-align: center;
        }

        .forecast {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
        }

        .forecastCard {
          background: #f7faf6;
          border-radius: 15px;
          padding: 14px 7px;
          text-align: center;
        }

        .forecastIcon {
          font-size: 28px;
          margin: 8px;
        }

        .chatBox {
          background: white;
          border-radius: 17px;
          padding: 15px;
          min-height: 350px;
          box-shadow: 0 2px 8px rgba(0,0,0,.05);
        }

        .message {
          padding: 10px 12px;
          background: #edf7ea;
          border-radius: 12px;
          margin-bottom: 8px;
          font-size: 14px;
          line-height: 1.5;
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
          outline: none;
        }

        .inputRow input:focus {
          border-color: #2e7d32;
        }

        .sendBtn {
          border: 0;
          background: #2e7d32;
          color: white;
          border-radius: 12px;
          padding: 0 17px;
          cursor: pointer;
        }

        .cartTotal {
          font-size: 20px;
          font-weight: 700;
          color: #28752e;
          margin-top: 15px;
        }

        .cartRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 13px 0;
          border-bottom: 1px solid #eee;
        }

        .quantity {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quantity button {
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 8px;
          background: #e8f5e9;
          color: #28752e;
          font-size: 18px;
          cursor: pointer;
        }

        .empty {
          text-align: center;
          padding: 45px 15px;
          color: #777;
        }

        .profileCard {
          text-align: center;
        }

        .bigProfile {
          width: 75px;
          height: 75px;
          margin: auto;
          border-radius: 50%;
          background: #e8f5e9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #28752e;
        }

        .scheme {
          padding: 14px 0;
          border-bottom: 1px solid #eee;
        }

        .scheme:last-child {
          border-bottom: 0;
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
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
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
          display: flex;
          align-items: center;
          justify-content: center;
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

          .temperature {
            font-size: 45px;
          }

        }

      `}</style>

      <header>
        <div>
          <div className="brand">
            🌾 KisanSaathi AI
          </div>

          <small>
            Aapka Digital Kisan Dost
          </small>
        </div>

        <div className="profileIcon">
          <User size={22} />
        </div>
      </header>

      <main>

        {tab === "home" && (
          <HomePage
            setTab={setTab}
            name={name}
          />
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
            cart={cart}
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
          <ProfilePage
            setTab={setTab}
            name={name}
          />
        )}

      </main>

      <button
        className="fab"
        onClick={() => setTab("chat")}
        aria-label="AI Kisan"
      >
        <MessageCircle size={25} />
      </button>

      <nav className="bottomNav">

        <button
          className={
            "navBtn " +
            (tab === "home" ? "active" : "")
          }
          onClick={() => setTab("home")}
        >
          <Home size={20} />
          <div>Home</div>
        </button>

        <button
          className={
            "navBtn " +
            (tab === "crops" ? "active" : "")
          }
          onClick={() => setTab("crops")}
        >
          <Leaf size={20} />
          <div>मेरी फसल</div>
        </button>

        <button
          className={
            "navBtn " +
            (tab === "store" ? "active" : "")
          }
          onClick={() => setTab("store")}
        >
          <ShoppingCart size={20} />
          <div>
            Store {cartCount > 0 ? `(${cartCount})` : ""}
          </div>
        </button>

        <button
          className={
            "navBtn " +
            (tab === "profile" ? "active" : "")
          }
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

        <h1>
          Namaste {name} 👋
        </h1>

        <p>
          आज खेती में आपकी मदद के लिए तैयार हूँ।
        </p>

        <button
          className="weatherButton"
          onClick={() => setTab("weather")}
        >
          <CloudSun size={32} />

          <div>
            <strong>
              28°C · साफ मौसम
            </strong>

            <div
              style={{
                color: "#777",
                fontSize: 12,
                marginTop: 4
              }}
            >
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
          <div className="cardIcon">
            📸
          </div>

          <div>
            <div className="cardTitle">
              Fasal Check Karein
            </div>

            <div className="cardSub">
              फसल की जांच
            </div>
          </div>

          <Camera size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("chat")}
        >
          <div className="cardIcon">
            🤖
          </div>

          <div>
            <div className="cardTitle">
              AI Kisan
            </div>

            <div className="cardSub">
              सवाल पूछें
            </div>
          </div>

          <MessageCircle size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("weather")}
        >
          <div className="cardIcon">
            🌦️
          </div>

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
          <div className="cardIcon">
            💰
          </div>

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
          <div className="cardIcon">
            🌱
          </div>

          <div>
            <div className="cardTitle">
              Meri Fasal
            </div>

            <div className="cardSub">
              अपनी फसल देखें
            </div>
          </div>

          <Leaf size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("store")}
        >
          <div className="cardIcon">
            🛒
          </div>

          <div>
            <div className="cardTitle">
              Kisan Store
            </div>

            <div className="cardSub">
              सामान खरीदें
            </div>
          </div>

          <ShoppingCart size={19} />
        </button>

        <button
          className="card"
          onClick={() => setTab("profile")}
        >
          <div className="cardIcon">
            🏛️
          </div>

          <div>
            <div className="cardTitle"
