import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Tab =
  | "home"
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
};

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [name] = useState("Kisan Bhai");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<string[]>([]);

  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const products: Product[] = [
    { id: 1, name: "गेहूं बीज", price: 450 },
    { id: 2, name: "सरसों बीज", price: 380 },
    { id: 3, name: "जैविक खाद", price: 520 },
  ];

  const sendMessage = () => {
    if (!message.trim()) return;

    setChat((c) => [...c, "आप: " + message]);
    setMessage("");

    setTimeout(() => {
      setChat((c) => [...c, "AI किसान: आपकी मदद के लिए मैं यहाँ हूँ।"]);
    }, 400);
  };

  return (
    <div className="app">
      <header>
        <div>
          <div className="brand">🌾 KisanSaathi AI</div>
          <small>Aapka Digital Kisan Dost</small>
        </div>

        <div className="profileTop">👨‍🌾</div>
      </header>

      <main>
        {tab === "home" && (
          <HomePage name={name} setTab={setTab} />
        )}

        {tab === "weather" && (
          <WeatherPage setTab={setTab} />
        )}

        {tab === "crops" && (
          <SimplePage
            title="🌱 मेरी फसल"
            text="अपनी फसल की जानकारी यहाँ जोड़ें।"
            setTab={setTab}
          />
        )}

        {tab === "doctor" && (
          <SimplePage
            title="📷 Crop Doctor"
            text="फसल की फोटो डालकर बीमारी की जानकारी पाएँ।"
            setTab={setTab}
          />
        )}

        {tab === "store" && (
          <StorePage
            products={products}
            cart={cart}
            setCart={setCart}
          />
        )}

        {tab === "profile" && (
          <ProfilePage name={name} setTab={setTab} />
        )}

        {tab === "cart" && (
          <CartPage
            products={products}
            cart={cart}
            setCart={setCart}
          />
        )}

        {tab === "chat" && (
          <ChatPage
            chat={chat}
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            setTab={setTab}
          />
        )}
      </main>

      <button className="fab" onClick={() => setTab("chat")}>
        🤖 AI Kisan
      </button>

      <nav>
        <button onClick={() => setTab("home")}>
          🏠
          <small>Home</small>
        </button>

        <button onClick={() => setTab("crops")}>
          🌱
          <small>Meri Fasal</small>
        </button>

        <button onClick={() => setTab("doctor")}>
          📷
          <small>Crop Doctor</small>
        </button>

        <button onClick={() => setTab("store")}>
          🛒
          <small>Store</small>
        </button>
      </nav>
    </div>
  );
}

/* HOME */

function HomePage({
  name,
  setTab,
}: {
  name: string;
  setTab: (tab: Tab) => void;
}) {
  return (
    <section>
      <div className="hero">
        <h1>Namaste {name} 👋</h1>
        <p>आज खेती में आपकी मदद के लिए तैयार हूँ।</p>

        <button className="weatherBox" onClick={() => setTab("weather")}>
          <span>☀️</span>
          <div>
            <b>28°C · साफ मौसम</b>
            <small>💧 बारिश की संभावना: 20% · Demo Data</small>
          </div>
        </button>
      </div>

      <div className="grid">
        <Card
          icon="📷"
          title="Fasal Check Karein"
          onClick={() => setTab("doctor")}
        />

        <Card
          icon="🤖"
          title="AI Kisan"
          onClick={() => setTab("chat")}
        />

        {/* यही मुख्य FIX है */}
        <Card
          icon="🌦️"
          title="Mausam"
          onClick={() => setTab("weather")}
        />

        <Card
          icon="💰"
          title="Mandi Bhav"
          onClick={() => alert("Mandi Bhav page जल्द आएगा")}
        />

        <Card
          icon="🌱"
          title="Meri Fasal"
          onClick={() => setTab("crops")}
        />

        <Card
          icon="🛒"
          title="Kisan Store"
          onClick={() => setTab("store")}
        />

        <Card
          icon="🏛️"
          title="Sarkari Yojana"
          onClick={() => alert("Sarkari Yojana page जल्द आएगा")}
        />
      </div>

      <div className="advice">
        ⚠️ <b>खेती की सलाह</b>
        <p>
          कल बारिश की संभावना हो सकती है। सिंचाई का निर्णय लेने से पहले
          स्थानीय forecast चेक करें।
        </p>
      </div>
    </section>
  );
}

/* WEATHER */

function WeatherPage({
  setTab,
}: {
  setTab: (tab: Tab) => void;
}) {
  return (
    <section>
      <button className="back" onClick={() => setTab("home")}>
        ← वापस
      </button>

      <div className="weatherPage">
        <h1>🌦️ आज का मौसम</h1>

        <div className="bigWeather">
          <div className="sun">☀️</div>
          <div>
            <strong>28°C</strong>
            <p>साफ मौसम</p>
          </div>
        </div>

        <div className="weatherCards">
          <div>
            💧
            <b>नमी</b>
            <span>62%</span>
          </div>

          <div>
            💨
            <b>हवा</b>
            <span>12 km/h</span>
          </div>

          <div>
            🌧️
            <b>बारिश</b>
            <span>20%</span>
          </div>

          <div>
            🌡️
            <b>महसूस होगा</b>
            <span>29°C</span>
          </div>
        </div>

        <div className="forecast">
          <h3>अगले दिन</h3>

          <div className="forecastRow">
            <span>आज</span>
            <span>☀️</span>
            <b>28° / 21°</b>
          </div>

          <div className="forecastRow">
            <span>कल</span>
            <span>🌦️</span>
            <b>27° / 20°</b>
          </div>

          <div className="forecastRow">
            <span>परसों</span>
            <span>☀️</span>
            <b>29° / 21°</b>
          </div>
        </div>

        <div className="advice">
          🌾 <b>किसान सलाह</b>
          <p>
            आज मौसम खेती के सामान्य कामों के लिए ठीक है। बारिश की संभावना
            बढ़ने पर सिंचाई रोकने पर विचार करें।
          </p>
        </div>
      </div>
    </section>
  );
}

/* CARD */

function Card({
  icon,
  title,
  onClick,
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

      <span>›</span>
    </button>
  );
}

/* SIMPLE PAGE */

function SimplePage({
  title,
  text,
  setTab,
}: {
  title: string;
  text: string;
  setTab: (tab: Tab) => void;
}) {
  return (
    <section>
      <button className="back" onClick={() => setTab("home")}>
        ← वापस
      </button>

      <div className="simplePage">
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  );
}

/* STORE */

function StorePage({
  products,
  cart,
  setCart,
}: {
  products: Product[];
  cart: Record<number, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<number, number>>>;
}) {
  const add = (id: number) => {
    setCart((c) => ({
      ...c,
      [id]: (c[id] || 0) + 1,
    }));
  };

  return (
    <section>
      <div className="pageTitle">
        <h1>🛒 Kisan Store</h1>
      </div>

      {products.map((p) => (
        <div className="product" key={p.id}>
          <div>
            <b>{p.name}</b>
            <p>₹{p.price}</p>
          </div>

          <button onClick={() => add(p.id)}>
            जोड़ें
          </button>
        </div>
      ))}
    </section>
  );
}

/* CART */

function CartPage({
  products,
  cart,
  setCart,
}: {
  products: Product[];
  cart: Record<number, number>;
  setCart: React.Dispatch<React.SetStateAction<Record<number, number>>>;
}) {
  return (
    <section>
      <div className="pageTitle">
        <h1>🛒 मेरा Cart</h1>
      </div>

      {products.map((p) => {
        const qty = cart[p.id] || 0;

        if (!qty) return null;

        return (
          <div className="product" key={p.id}>
            <b>{p.name}</b>
            <span>
              {qty} × ₹{p.price}
            </span>

            <button
              onClick={() =>
                setCart((c) => ({
                  ...c,
                  [p.id]: Math.max(0, qty - 1),
                }))
              }
            >
              −
            </button>
          </div>
        );
      })}
    </section>
  );
}

/* PROFILE */

function ProfilePage({
  name,
  setTab,
}: {
  name: string;
  setTab: (tab: Tab) => void;
}) {
  return (
    <section>
      <button className="back" onClick={() => setTab("home")}>
        ← वापस
      </button>

      <div className="profileCard">
        <div className="profileAvatar">👨‍🌾</div>

        <h2>{name}</h2>
        <p>किसान साथी उपयोगकर्ता</p>
      </div>

      <div className="section">
        <div className="profileItem">
          <span>👤</span>
          <div>
            <b>नाम</b>
            <p>{name}</p>
          </div>
        </div>

        <div className="profileItem">
          <span>🌾</span>
          <div>
            <b>मेरी फसल</b>
            <p>फसल की जानकारी जोड़ें</p>
          </div>
        </div>

        <div className="profileItem">
          <span>📍</span>
          <div>
            <b>स्थान</b>
            <p>अपना गांव और जिला जोड़ें</p>
          </div>
        </div>

        <div className="profileItem">
          <span>📞</span>
          <div>
            <b>सहायता</b>
            <p>किसान सहायता केंद्र</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* CHAT */

function ChatPage({
  chat,
  message,
  setMessage,
  sendMessage,
  setTab,
}: {
  chat: string[];
  message: string;
  setMessage: (v: string) => void;
  sendMessage: () => void;
  setTab: (tab: Tab) => void;
}) {
  return (
    <section>
      <button className="back" onClick={() => setTab("home")}>
        ← वापस
      </button>

      <div className="chatPage">
        <h1>🤖 AI Kisan</h1>

        <div className="chatBox">
          {chat.length === 0 && (
            <p>नमस्ते किसान भाई 👋 मैं आपकी खेती में मदद कर सकता हूँ।</p>
          )}

          {chat.map((x, i) => (
            <div className="chatMsg" key={i}>
              {x}
            </div>
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
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <App />
);
