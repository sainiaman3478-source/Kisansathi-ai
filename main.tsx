import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Tab =
  | "home"
  | "weather"
  | "crop"
  | "doctor"
  | "mandi"
  | "store"
  | "scheme"
  | "profile"
  | "chat";

type Product = {
  id: number;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: 1, name: "गेहूं बीज", price: 450 },
  { id: 2, name: "सरसों बीज", price: 380 },
  { id: 3, name: "जैविक खाद", price: 520 },
];

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [name] = useState("Kisan Bhai");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const addCart = (id: number) => {
    setCart((old) => ({
      ...old,
      [id]: (old[id] || 0) + 1,
    }));
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages((old) => [
      ...old,
      "आप: " + message,
      "AI Kisan: नमस्ते किसान भाई 👋 मैं आपकी खेती में मदद करने के लिए तैयार हूँ।",
    ]);

    setMessage("");
  };

  return (
    <div className="app">
      <header>
        <div>
          <div className="brand">🌾 KisanSaathi AI</div>
          <small>Aapka Digital Kisan Dost</small>
        </div>
        <div>👨‍🌾</div>
      </header>

      <main>

        {tab === "home" && (
          <Home name={name} setTab={setTab} />
        )}

        {tab === "weather" && (
          <Weather setTab={setTab} />
        )}

        {tab === "crop" && (
          <Crop setTab={setTab} />
        )}

        {tab === "doctor" && (
          <Doctor setTab={setTab} />
        )}

        {tab === "mandi" && (
          <Mandi setTab={setTab} />
        )}

        {tab === "store" && (
          <Store
            setTab={setTab}
            addCart={addCart}
            cart={cart}
          />
        )}

        {tab === "scheme" && (
          <Scheme setTab={setTab} />
        )}

        {tab === "profile" && (
          <Profile name={name} setTab={setTab} />
        )}

        {tab === "chat" && (
          <Chat
            setTab={setTab}
            message={message}
            setMessage={setMessage}
            messages={messages}
            sendMessage={sendMessage}
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

        <button onClick={() => setTab("crop")}>
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

function Home({
  name,
  setTab,
}: {
  name: string;
  setTab: (t: Tab) => void;
}) {
  return (
    <section>

      <div className="hero">
        <h1>Namaste {name} 👋</h1>

        <p>आज खेती में आपकी मदद के लिए तैयार हूँ।</p>

        <button
          className="weatherBox"
          onClick={() => setTab("weather")}
        >
          ☀️
          <div>
            <b>28°C · साफ मौसम</b>
            <small>💧 बारिश की संभावना: 20%</small>
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


      <div className="advice">
        ⚠️ <b>खेती की सलाह</b>

        <p>
          आज मौसम खेती के सामान्य कामों के लिए ठीक है।
          सिंचाई से पहले मौसम जरूर देखें।
        </p>
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

      <span className="cardIcon">
        {icon}
      </span>

      <div>
        <b>{title}</b>
        <small>देखें</small>
      </div>

      <span>›</span>

    </button>
  );
}


/* WEATHER */

function Weather({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  return (
    <section>

      <button
        className="back"
        onClick={() => setTab("home")}
      >
        ← वापस
      </button>

      <div className="page">

        <h1>🌦️ आज का मौसम</h1>

        <div className="bigWeather">
          <span>☀️</span>

          <div>
            <strong>28°C</strong>
            <p>साफ मौसम</p>
          </div>
        </div>


        <div className="weatherGrid">

          <Info title="💧 नमी" value="62%" />

          <Info title="💨 हवा" value="12 km/h" />

          <Info title="🌧️ बारिश" value="20%" />

          <Info title="🌡️ महसूस होगा" value="29°C" />

        </div>


        <div className="advice">
          🌾 <b>किसान सलाह</b>

          <p>
            आज मौसम खेती के सामान्य कामों के लिए अच्छा है।
            बारिश की संभावना बढ़ने पर सिंचाई रोकें।
          </p>
        </div>

      </div>

    </section>
  );
}


function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="info">
      <b>{title}</b>
      <strong>{value}</strong>
    </div>
  );
}


/* CROP */

function Crop({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  return (
    <section>

      <button
        className="back"
        onClick={() => setTab("home")}
      >
        ← वापस
      </button>

      <div className="page">

        <h1>🌱 मेरी फसल</h1>

        <div className="item">
          <b>🌾 गेहूं</b>
          <p>फसल की स्थिति: अच्छी</p>
        </div>

        <div className="item">
          <b>🌻 सरसों</b>
          <p>फसल की स्थिति: सामान्य</p>
        </div>

        <button
          className="mainButton"
          onClick={() => alert("नई फसल जोड़ने का विकल्प जल्द आएगा")}
        >
          + नई फसल जोड़ें
        </button>

      </div>

    </section>
  );
}


/* DOCTOR */

function Doctor({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  return (
    <section>

      <button
        className="back"
        onClick={() => setTab("home")}
      >
        ← वापस
      </button>

      <div className="page">

        <h1>📷 Fasal Check Karein</h1>

        <p>
          अपनी फसल की फोटो लेकर बीमारी की पहचान करें।
        </p>

        <button
          className="mainButton"
          onClick={() =>
            alert("Camera feature जल्द जोड़ा जाएगा")
          }
        >
          📷 फोटो लें
        </button>

        <div className="advice">
          💡 पत्तियों की साफ और नजदीक से फोटो लें।
        </div>

      </div>

    </section>
  );
}


/* MANDI */

function Mandi({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  return (
    <section>

      <button
        className="back"
        onClick={() => setTab("home")}
      >
        ← वापस
      </button>

      <div className="page">

        <h1>💰 आज का मंडी भाव</h1>

        <div className="item">
          <b>🌾 गेहूं</b>
          <strong>₹2,450 / क्विंटल</strong>
        </div>

        <div className="item">
          <b>🌻 सरसों</b>
          <strong>₹5,800 / क्विंटल</strong>
        </div>

        <div className="item">
          <b>🌽 मक्का</b>
          <strong>₹2,100 / क्विंटल</strong>
        </div>

        <small>
          * ये demo prices हैं।
        </small>

      </div>

    </section>
  );
}


/* STORE */

function Store({
  setTab,
  addCart,
  cart,
}: {
  setTab: (t: Tab) => void;
  addCart: (id: number) => void;
  cart: Record<number, number>;
}) {
  return (
    <section>

      <button
        className="back"
        onClick={() => setTab("home")}
      >
        ← वापस
      </button>

      <div className="page">

        <h1>🛒 Kisan Store</h1>

        {products.map((p) => (
          <div className="product" key={p.id}>

            <div>
              <b>{p.name}</b>
              <p>₹{p.price}</p>
            </div>

            <button onClick={() => addCart(p.id)}>
              जोड़ें
            </button>

          </div>
        ))}

        <button
          className="mainButton"
          onClick={() => {
            const total = Object.entries(cart).reduce(
              (sum, [id, qty]) => {
                const p = products.find(
                  (x) => x.id === Number(id)
                );

                return sum + (p ? p.price * qty : 0);
              },
              0
            );

            alert(
              total
                ? `Cart total: ₹${total}`
                : "Cart खाली है"
            );
          }}
        >
          🛒 Cart देखें
        </button>

      </div>

    </section>
  );
}


/* SCHEME */

function Scheme({
  setTab,
}: {
  setTab: (t: Tab) => void;
}) {
  return (
    <section>

      <button
        className="back"
        onClick={() => setTab("home")}
      >
        ← वापस
      </button>

      <div className="page">

        <h1>🏛️ Sarkari Yojana</h1>

        <div className="item">
          <b>🌾 किसान सम्मान निधि</b>
          <p>किसानों के लिए सरकारी सहायता योजना।</p>
        </div>

        <div className="item">
          <b>💧 प्रधानमंत्री कृषि सिंचाई योजना</b>
          <p>सिंचाई सुविधाओं को बढ़ावा देने की योजना।</p>
        </div>

        <div className="item">
          <b>🌱 फसल बीमा योजना</b>
          <p>फसल नुकसान के समय बीमा सहायता।</p>
        </div>

      </div>

    </section>
  );
}


/* PROFILE */

function Profile({
  name,
  setTab,
}: {
  name: string;
  setTab: (t: Tab) => void;
}) {
  return (
    <section>

      <button
        className="back"
        onClick={() => setTab("home")}
      >
        ← वापस
      </button>

      <div className="profileCard">

        <div className="profileAvatar">
          👨‍🌾
        </div>

        <h2>{name}</h2>

        <p>
          किसान साथी उपयोगकर्ता
        </p>

      </div>


      <div className="item">
        👤 <b>नाम</b>
        <p>{name}</p>
      </div>

      <div className="item">
        🌾 <b>मेरी फसल</b>
        <p>फसल की जानकारी जोड़ें</p>
      </div>

      <div className="item">
        📍 <b>स्थान</b>
        <p>अपना गांव और जिला जोड़ें</p>
      </div>

      <div className="item">
        📞 <b>सहायता</b>
        <p>किसान सहायता केंद्र</p>
      </div>

    </section>
  );
}


/* CHAT */

function Chat({
  setTab,
  message,
  setMessage,
  messages,
  sendMessage,
}: {
  setTab: (t: Tab) => void;
  message: string;
  setMessage: (v: string) => void;
  messages: string[];
  sendMessage: () => void;
}) {
  return (
    <section>

      <button
        className="back"
        onClick={() => setTab("home")}
      >
        ← वापस
      </button>

      <div className="page">

        <h1>🤖 AI Kisan</h1>

        <div className="chatBox">

          {messages.length === 0 && (
            <p>
              नमस्ते किसान भाई 👋
              <br />
              खेती से जुड़ा सवाल पूछिए।
            </p>
          )}

          {messages.map((m, i) => (
            <div className="chatMsg" key={i}>
              {m}
            </div>
          ))}

        </div>


        <div className="chatInput">

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            placeholder="अपना सवाल लिखें..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage}>
            ➤
          </button>

        </div>

      </div>

    </section>
  );
}


createRoot(
  document.getElementById("root")!
).render(
  <App />
);
