import React, { useState } from "react";
import { createRoot } from "react-dom/client";

type Tab =
  | "home"
  | "weather"
  | "doctor"
  | "chat"
  | "mandi"
  | "crop"
  | "store"
  | "scheme";

function App() {
  const [tab, setTab] = useState<Tab>("home");

  if (tab === "weather")
    return <Weather setTab={setTab} />;

  if (tab === "doctor")
    return <SimplePage title="📷 Fas﻿al Check Karein" setTab={setTab} />;

  if (tab === "chat")
    return <SimplePage title="🤖 AI Kisan" setTab={setTab} />;

  if (tab === "mandi")
    return <SimplePage title="💰 Mandi Bhav" setTab={setTab} />;

  if (tab === "crop")
    return <SimplePage title="🌱 Meri Fasal" setTab={setTab} />;

  if (tab === "store")
    return <SimplePage title="🛒 Kisan Store" setTab={setTab} />;

  if (tab === "scheme")
    return <SimplePage title="🏛️ Sarkari Yojana" setTab={setTab} />;

  return <Home setTab={setTab} />;
}

function Home({ setTab }: { setTab: (t: Tab) => void }) {
  return (
    <div className="app">

      <header>
        <div>
          <b>🌾 KisanSaathi AI</b>
          <small>Aapka Digital Kisan Dost</small>
        </div>
        <div className="user">👨‍🌾</div>
      </header>

      <main>

        <section className="welcome">
          <h1>Namaste Kisan Bhai 👋</h1>
          <p>Aaj kheti mein aapki madad ke liye taiyar hoon.</p>

          <button
            className="weatherMini"
            onClick={() => setTab("weather")}
          >
            <span>🌤️</span>
            <div>
              <b>28°C · Saaf Mausam</b>
              <small>🌧️ Baarish ki sambhavna: 20% · Demo Data</small>
            </div>
          </button>
        </section>

        <div className="grid">

          <Card
            icon="📸"
            title="Fasal Check Karein"
            onClick={() => setTab("doctor")}
          />

          <Card
            icon="🤖"
            title="AI Kisan"
            onClick={() => setTab("chat")}
          />

          <Card
            icon="🌦️"
            title="Mausam"
            onClick={() => setTab("weather")}
          />

          <Card
            icon="💰"
            title="Mandi Bhav"
            onClick={() => setTab("mandi")}
          />

          <Card
            icon="🌱"
            title="Meri Fasal"
            onClick={() => setTab("crop")}
          />

          <Card
            icon="🛒"
            title="Kisan Store"
            onClick={() => setTab("store")}
          />

          <Card
            icon="🏛️"
            title="Sarkari Yojana"
            onClick={() => setTab("scheme")}
          />

        </div>

        <section className="advice">
          <b>⚠️ Kheti ki salah</b>
          <p>
            Kal baarish ki sambhavna hai. Sinchai ka nirnay lene se
            pehle sthaniya forecast check karein.
          </p>
        </section>

      </main>

      <button className="aiButton" onClick={() => setTab("chat")}>
        🤖 <span>AI Kisan</span>
      </button>

      <nav>
        <button onClick={() => setTab("home")}>🏠<small>Home</small></button>
        <button onClick={() => setTab("crop")}>🌱<small>Meri Fasal</small></button>
        <button onClick={() => setTab("doctor")}>📷<small>Crop Doctor</small></button>
        <button onClick={() => setTab("store")}>🛒<small>Store</small></button>
      </nav>

    </div>
  );
}

function Card({
  icon,
  title,
  onClick
}: {
  icon: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button className="card" onClick={onClick}>
      <span className="cardIcon">{icon}</span>
      <div>
        <b>{title}</b>
        <small>देखें</small>
      </div>
      <span className="arrow">›</span>
    </button>
  );
}

function Weather({ setTab }: { setTab: (t: Tab) => void }) {
  return (
    <div className="app">

      <header>
        <div>
          <b>🌾 KisanSaathi AI</b>
          <small>Aapka Digital Kisan Dost</small>
        </div>
      </header>

      <main>

        <button className="back" onClick={() => setTab("home")}>
          ← वापस
        </button>

        <section className="weatherPage">

          <h1>🌤️ Mausam</h1>

          <div className="bigWeather">
            <div className="bigSun">☀️</div>
            <h2>28°C</h2>
            <b>Saaf Mausam</b>
            <p>Aaj mausam kheti ke liye achha hai.</p>

            <div className="weatherDetails">
              <div>💧<b>65%</b><small>Nami</small></div>
              <div>💨<b>12 km/h</b><small>Hawa</small></div>
              <div>🌧️<b>20%</b><small>Baarish</small></div>
            </div>
          </div>

          <div className="advice">
            <b>🌾 Kheti ki salah</b>
            <p>
              Sinchai ya spray karne se pehle local weather
              forecast zaroor check karein.
            </p>
          </div>

        </section>

      </main>

      <nav>
        <button onClick={() => setTab("home")}>🏠<small>Home</small></button>
        <button onClick={() => setTab("crop")}>🌱<small>Meri Fasal</small></button>
        <button onClick={() => setTab("doctor")}>📷<small>Crop Doctor</small></button>
        <button onClick={() => setTab("store")}>🛒<small>Store</small></button>
      </nav>

    </div>
  );
}

function SimplePage({
  title,
  setTab
}: {
  title: string;
  setTab: (t: Tab) => void;
}) {
  return (
    <div className="app">
      <header>
        <div>
          <b>🌾 KisanSaathi AI</b>
          <small>Aapka Digital Kisan Dost</small>
        </div>
      </header>

      <main>
        <button className="back" onClick={() => setTab("home")}>
          ← वापस
        </button>

        <div className="simple">
          <h1>{title}</h1>
          <p>Ye section taiyar kiya ja raha hai.</p>
        </div>
      </main>

      <nav>
        <button onClick={() => setTab("home")}>🏠<small>Home</small></button>
        <button onClick={() => setTab("crop")}>🌱<small>Meri Fasal</small></button>
        <button onClick={() => setTab("doctor")}>📷<small>Crop Doctor</small></button>
        <button onClick={() => setTab("store")}>🛒<small>Store</small></button>
      </nav>
    </div>
  );
}

const style = document.createElement("style");

style.textContent = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f5f7f2;
  color: #263329;
}

button {
  font-family: inherit;
}

.app {
  min-height: 100vh;
  padding-bottom: 80px;
}

header {
  background: white;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 5px #ddd;
}

header b {
  display: block;
  font-size: 16px;
}

header small {
  color: #777;
  display: block;
  margin-top: 5px;
}

.user {
  background: #e9f4e7;
  border-radius: 50%;
  padding: 9px;
}

main {
  max-width: 650px;
  margin: auto;
  padding: 16px;
}

.welcome {
  background: linear-gradient(135deg,#e5f7df,#f5fbf1);
  border-radius: 20px;
  padding: 18px;
}

.welcome h1 {
  font-size: 21px;
  margin: 0 0 8px;
}

.welcome p {
  margin: 0 0 14px;
  font-size: 13px;
}

.weatherMini {
  width: 100%;
  border: 0;
  background: white;
  border-radius: 15px;
  padding: 12px;
  display: flex;
  gap: 12px;
  text-align: left;
  align-items: center;
}

.weatherMini span {
  font-size: 25px;
}

.weatherMini small {
  display: block;
  color: #777;
  margin-top: 5px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 12px;
}

.card {
  border: 0;
  background: white;
  border-radius: 17px;
  min-height: 70px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  box-shadow: 0 2px 8px #e4e7e2;
}

.cardIcon {
  font-size: 25px;
}

.card b {
  display: block;
  font-size: 14px;
}

.card small {
  display: block;
  color: #777;
  margin-top: 5px;
}

.arrow {
  margin-left: auto;
  font-size: 24px;
}

.advice {
  background: white;
  border-radius: 17px;
  padding: 14px;
  margin-top: 12px;
  box-shadow: 0 2px 8px #e4e7e2;
}

.advice b {
  font-size: 14px;
}

.advice p {
  margin: 7px 0 0;
  font-size: 13px;
}

.aiButton {
  position: fixed;
  right: 18px;
  bottom: 75px;
  border: 0;
  border-radius: 30px;
  padding: 12px 17px;
  background: #1f7a3a;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 12px #bbb;
}

nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 9px 3px;
  box-shadow: 0 -2px 10px #ddd;
}

nav button {
  border: 0;
  background: transparent;
  font-size: 20px;
}

nav small {
  display: block;
  font-size: 10px;
  margin-top: 3px;
}

.back {
  border: 0;
  background: white;
  border-radius: 10px;
  padding: 9px 14px;
  margin-bottom: 15px;
}

.weatherPage h1 {
  margin-top: 5px;
}

.bigWeather {
  background: white;
  border-radius: 20px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 2px 10px #ddd;
}

.bigSun {
  font-size: 55px;
}

.bigWeather h2 {
  font-size: 42px;
  margin: 8px;
}

.weatherDetails {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 8px;
  margin-top: 20px;
}

.weatherDetails div {
  background: #f4f7f2;
  border-radius: 12px;
  padding: 12px 5px;
}

.weatherDetails b,
.weatherDetails small {
  display: block;
  margin-top: 5px;
}

.simple {
  background: white;
  border-radius: 20px;
  padding: 25px;
  text-align: center;
}
`;

document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(
  <App />
);
