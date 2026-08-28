import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Tab =
  | "home"
  | "weather"
  | "crops"
  | "doctor"
  | "store"
  | "cart"
  | "chat"
  | "profile";

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages([...messages, "आप: " + message]);
    setMessage("");
  };

  return (
    <div className="app">

      <header className="header">
        <h2>🌾 KisanSaathi AI</h2>
        <small>आपका Digital Kisan Dost</small>
      </header>

      <main className="main">

        {tab === "home" && (
          <section>
            <h1>नमस्ते किसान भाई 👋</h1>
            <p>आज खेती में आपकी क्या मदद करूँ?</p>

            <div className="grid">

              <button onClick={() => setTab("weather")}>
                🌤️
                <b>मौसम</b>
                <span>आज का मौसम देखें</span>
              </button>

              <button onClick={() => setTab("crops")}>
                🌾
                <b>मेरी फसल</b>
                <span>अपनी फसल देखें</span>
              </button>

              <button onClick={() => setTab("doctor")}>
                🩺
                <b>Crop Doctor</b>
                <span>फसल की समस्या</span>
              </button>

              <button onClick={() => setTab("store")}>
                🛒
                <b>किसान Store</b>
                <span>खेती का सामान</span>
              </button>

            </div>
          </section>
        )}

        {tab === "weather" && (
          <section>
            <button className="back" onClick={() => setTab("home")}>
              ← वापस
            </button>

            <h1>🌤️ मौसम</h1>

            <div className="weather">
              <div className="weatherIcon">☀️</div>
              <h2>आज का मौसम</h2>
              <strong>28°C</strong>
              <p>आसमान साफ है</p>

              <div className="weatherInfo">
                <span>💧 नमी<br /><b>65%</b></span>
                <span>💨 हवा<br /><b>12 km/h</b></span>
                <span>🌡️ तापमान<br /><b>28°C</b></span>
              </div>
            </div>
          </section>
        )}

        {tab === "crops" && (
          <section>
            <button className="back" onClick={() => setTab("home")}>
              ← वापस
            </button>
            <h1>🌾 मेरी फसल</h1>

            <div className="card">
              <h2>फसल की जानकारी</h2>
              <p>अपनी फसल की जानकारी यहाँ जोड़ें।</p>
            </div>
          </section>
        )}

        {tab === "doctor" && (
          <section>
            <button className="back" onClick={() => setTab("home")}>
              ← वापस
            </button>
            <h1>🩺 Crop Doctor</h1>

            <div className="card">
              <h2>फसल की समस्या?</h2>
              <p>अपनी फसल की समस्या बताएं।</p>
              <button onClick={() => setTab("chat")}>
                🤖 AI से पूछें
              </button>
            </div>
          </section>
        )}

        {tab === "store" && (
          <section>
            <button className="back" onClick={() => setTab("home")}>
              ← वापस
            </button>
            <h1>🛒 किसान Store</h1>

            <div className="card">
              <h2>🌱 बीज</h2>
              <p>खेती के लिए उपयोगी सामान</p>
            </div>

            <div className="card">
              <h2>🧪 खाद</h2>
              <p>फसल के लिए जरूरी उत्पाद</p>
            </div>

            <button onClick={() => setTab("cart")}>
              🛒 Cart देखें
            </button>
          </section>
        )}

        {tab === "cart" && (
          <section>
            <button className="back" onClick={() => setTab("store")}>
              ← वापस
            </button>
            <h1>🛒 मेरा Cart</h1>

            <div className="card">
              <p>आपका Cart अभी खाली है।</p>
            </div>
          </section>
        )}

        {tab === "chat" && (
          <section>
            <button className="back" onClick={() => setTab("home")}>
              ← वापस
            </button>

            <h1>🤖 AI Kisan</h1>

            <div className="chatBox">
              {messages.length === 0 && (
                <p>नमस्ते! खेती से जुड़ा कोई भी सवाल पूछें। 🌾</p>
              )}

              {messages.map((m, i) => (
                <p key={i}>{m}</p>
              ))}
            </div>

            <div className="chatInput">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="अपना सवाल लिखें..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <button onClick={sendMessage}>➤</button>
            </div>
          </section>
        )}

        {tab === "profile" && (
          <section>
            <button className="back" onClick={() => setTab("home")}>
              ← वापस
            </button>

            <h1>👤 प्रोफाइल</h1>

            <div className="profile">
              <div className="avatar">👤</div>
              <h2>किसान साथी उपयोगकर्ता</h2>
              <p>🌾 किसान</p>
              <p>📍 अपना गांव और जिला जोड़ें</p>
              <p>📞 किसान सहायता केंद्र</p>
            </div>
          </section>
        )}

      </main>

      <button className="fab" onClick={() => setTab("chat")}>
        🤖 AI Kisan
      </button>

      <nav className="nav">
        <button onClick={() => setTab("home")}>🏠<span>Home</span></button>
        <button onClick={() => setTab("weather")}>🌤️<span>मौसम</span></button>
        <button onClick={() => setTab("crops")}>🌾<span>फसल</span></button>
        <button onClick={() => setTab("store")}>🛒<span>Store</span></button>
        <button onClick={() => setTab("profile")}>👤<span>Profile</span></button>
      </nav>

    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
