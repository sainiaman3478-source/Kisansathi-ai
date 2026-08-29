import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home,
  Leaf,
  Camera,
  ShoppingCart,
  User,
  MessageCircle,
  CloudSun,
  IndianRupee,
  Landmark,
  ArrowLeft,
  Search,
  MapPin,
  Sprout,
  CalendarDays,
  Droplets,
  Send,
  Plus,
  Minus,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import "./style.css";

type Tab =
  | "home"
  | "crops"
  | "doctor"
  | "store"
  | "profile"
  | "cart"
  | "chat"
  | "weather"
  | "mandi"
  | "scheme";

type Product = {
  id: number;
  name: string;
  price: number;
  emoji: string;
};

const products: Product[] = [
  { id: 1, name: "नीम ऑयल", price: 299, emoji: "🌿" },
  { id: 2, name: "जैविक खाद", price: 499, emoji: "🌱" },
  { id: 3, name: "फसल सुरक्षा किट", price: 699, emoji: "🧴" },
  { id: 4, name: "बीज उपचार किट", price: 399, emoji: "🌾" },
];

function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");

  const addCart = (id: number) => {
    setCart((old) => ({
      ...old,
      [id]: (old[id] || 0) + 1,
    }));
  };

  const removeCart = (id: number) => {
    setCart((old) => {
      const copy = { ...old };

      if (copy[id] > 1) {
        copy[id]--;
      } else {
        delete copy[id];
      }

      return copy;
    });
  };

  const sendMessage = async () => {
    const text = message.trim();

    if (!text) return;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      alert(data.reply || "AI से जवाब नहीं मिला।");
    } catch {
      alert(
        "AI अभी उपलब्ध नहीं है। API/backend configuration जांचें।"
      );
    }

    setMessage("");
  };

  return (
    <div className="app">

      <header>
        <div className="brand">
          🌾 KisanSaathi AI
          <small>
            आपका डिजिटल किसान दोस्त
          </small>
        </div>

        <button
          className="avatar"
          onClick={() => setTab("profile")}
        >
          <User size={20} />
        </button>
      </header>

      <main>

        {tab === "home" && (
          <HomePage setTab={setTab} />
        )}

        {tab === "weather" && (
          <WeatherPage setTab={setTab} />
        )}

        {tab === "doctor" && (
          <DoctorPage setTab={setTab} />
        )}

        {tab === "crops" && (
          <CropsPage setTab={setTab} />
        )}

        {tab === "mandi" && (
          <MandiPage setTab={setTab} />
        )}

        {tab === "scheme" && (
          <SchemePage setTab={setTab} />
        )}

        {tab === "store" && (
          <StorePage
            setTab={setTab}
            addCart={addCart}
          />
        )}

        {tab === "cart" && (
          <CartPage
            setTab={setTab}
            cart={cart}
            addCart={addCart}
            removeCart={removeCart}
          />
        )}

        {tab === "profile" && (
          <ProfilePage setTab={setTab} />
        )}

        {tab === "chat" && (
          <ChatPage
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            setTab={setTab}
          />
        )}

      </main>

      <button
        className="fab"
        onClick={() => setTab("chat")}
      >
        <MessageCircle size={22} />
        <span>AI Kisan</span>
      </button>

      <nav>

        <button
          className={tab === "home" ? "active" : ""}
          onClick={() => setTab("home")}
        >
          <Home size={21} />
          Home
        </button>

        <button
          className={tab === "crops" ? "active" : ""}
          onClick={() => setTab("crops")}
        >
          <Leaf size={21} />
          फसल
        </button>

        <button
          className={tab === "doctor" ? "active" : ""}
          onClick={() => setTab("doctor")}
        >
          <Camera size={21} />
          Doctor
        </button>

        <button
          className={tab === "store" ? "active" : ""}
          onClick={() => setTab("store")}
        >
          <ShoppingCart size={21} />
          Store
        </button>

      </nav>

    </div>
  );
}


/* ================= HOME ================= */

function HomePage({ setTab }: any) {

  const actions = [
    {
      icon: "📷",
      title: "फसल जांचें",
      sub: "फोटो से फसल की जांच",
      tab: "doctor",
    },
    {
      icon: "🤖",
      title: "AI Kisan",
      sub: "खेती का सवाल पूछें",
      tab: "chat",
    },
    {
      icon: "🌦️",
      title: "मौसम",
      sub: "अपने इलाके का मौसम",
      tab: "weather",
    },
    {
      icon: "💰",
      title: "मंडी भाव",
      sub: "फसल के बाजार भाव",
      tab: "mandi",
    },
    {
      icon: "🌱",
      title: "मेरी फसल",
      sub: "अपनी फसल जोड़ें",
      tab: "crops",
    },
    {
      icon: "🛒",
      title: "Kisan Store",
      sub: "कृषि सामान",
      tab: "store",
    },
    {
      icon: "🏛️",
      title: "सरकारी योजना",
      sub: "किसानों की योजनाएं",
      tab: "scheme",
    },
  ];

  return (
    <>
      <section className="hero">

        <p>
          नमस्ते किसान भाई 👋
        </p>

        <h1>
          आज खेती में आपकी मदद के लिए तैयार हैं।
        </h1>

        <button
          className="weather"
          onClick={() => setTab("weather")}
        >
          <CloudSun size={30} />

          <div>
            <b>🌦️ आज का मौसम</b>
            <small>
              अपने इलाके का मौसम देखें
            </small>
          </div>
        </button>

      </section>

      <div className="grid">

        {actions.map((item: any) => (

          <button
            className="action"
            key={item.title}
            onClick={() => setTab(item.tab)}
          >

            <span>
              {item.icon}
            </span>

            <div>
              <b>{item.title}</b>
              <small>{item.sub}</small>
            </div>

            <b>›</b>

          </button>

        ))}

      </div>

      <div className="warning">
        ⚠️ <b>किसान सलाह</b>
        <p>
          दवा या सिंचाई का फैसला लेने से पहले
          मौसम और फसल की स्थिति जरूर जांचें।
        </p>
      </div>
    </>
  );
}


/* ================= WEATHER ================= */

function WeatherPage({ setTab }: any) {

  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");

  const loadWeather = () => {

    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("आपके फोन में Location उपलब्ध नहीं है।");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${lat}` +
            `&longitude=${lon}` +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
            "&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max" +
            "&timezone=auto" +
            "&forecast_days=3";

          const res = await fetch(url);

          if (!res.ok) {
            throw new Error("Weather failed");
          }

          const data = await res.json();

          setWeather(data);

          setLocation(
            `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
          );

        } catch {

          setError(
            "मौसम की जानकारी नहीं मिल पाई।"
          );

        }

        setLoading(false);

      },

      () => {

        setError(
          "Location की अनुमति दें।"
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

  const text = (code: number) => {

    if (code === 0) return "साफ आसमान";
    if (code <= 3) return "आंशिक बादल";
    if (code <= 48) return "कोहरा";
    if (code <= 57) return "बूंदाबांदी";
    if (code <= 67) return "बारिश";
    if (code <= 77) return "बर्फ";
    if (code <= 82) return "तेज बारिश";
    if (code <= 86) return "बारिश / बर्फ";

    return "गरज के साथ बारिश";
  };

  const emoji = (code: number) => {

    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";

    return "⛈️";
  };

  return (
    <Page
      title="मौसम"
      setTab={setTab}
    >

      {!weather && !loading && (

        <div className="card">

          <div
            style={{
              fontSize: 60,
              textAlign: "center",
            }}
          >
            🌦️
          </div>

          <h2>
            अपने इलाके का मौसम देखें
          </h2>

          <p>
            Location की अनुमति देकर live मौसम
            और अगले 3 दिनों का forecast देखें।
          </p>

          <button
            className="primary"
            onClick={loadWeather}
          >
            📍 मेरा मौसम देखें
          </button>

        </div>

      )}

      {loading && (

        <div className="card success">

          <div style={{ fontSize: 50 }}>
            ⏳
          </div>

          <h2>
            मौसम पता कर रहे हैं...
          </h2>

        </div>

      )}

      {error && (

        <div className="warning">

          ⚠️ {error}

          <button
            className="primary"
            onClick={loadWeather}
          >
            🔄 फिर कोशिश करें
          </button>

        </div>

      )}

      {weather && (

        <>

          <div className="notice">
            <MapPin size={16} />
            {location}

            <button
              className="secondary"
              onClick={loadWeather}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          <div className="card">

            <div
              style={{
                fontSize: 60,
                textAlign: "center",
              }}
            >
              {emoji(
                weather.current.weather_code
              )}
            </div>

            <h1 style={{ textAlign: "center" }}>
              {Math.round(
                weather.current.temperature_2m
              )}°C
            </h1>

            <p style={{ textAlign: "center" }}>
              {text(
                weather.current.weather_code
              )}
            </p>

          </div>

          <div className="grid">

            <Info
              icon={<Droplets />}
              title="नमी"
              value={
                `${weather.current.relative_humidity_2m}%`
              }
            />

            <Info
              icon={<CloudSun />}
              title="बारिश"
              value={
                `${weather.daily.precipitation_probability_max[0]}%`
              }
            />

            <Info
              icon={<Sprout />}
              title="हवा"
              value={
                `${Math.round(
                  weather.current.wind_speed_10m
                )} km/h`
              }
            />

            <Info
              icon={<CloudSun />}
              title="महसूस"
              value={
                `${Math.round(
                  weather.current.apparent_temperature
                )}°C`
              }
            />

          </div>

          <div className="card">

            <h3>
              📅 अगले 3 दिन
            </h3>

            {weather.daily.time.map(
              (day: string, i: number) => (

                <div
                  key={day}
                  className="cartrow"
                >

                  <span>
                    <b>
                      {i === 0
                        ? "आज"
                        : i === 1
                        ? "कल"
                        : "परसों"}
                    </b>

                    <small>
                      {text(
                        weather.daily.weather_code[i]
                      )}
                    </small>
                  </span>

                  <b>
                    {emoji(
                      weather.daily.weather_code[i]
                    )}
                  </b>

                  <b>
                    {Math.round(
                      weather.daily.temperature_2m_max[i]
                    )}°
                    /
                    {Math.round(
                      weather.daily.temperature_2m_min[i]
                    )}°
                  </b>

                </div>

              )
            )}

          </div>

        </>

      )}

    </Page>
  );
}


/* ================= CROP DOCTOR ================= */

function DoctorPage({ setTab }: any) {

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const selectPhoto = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const selected = e.target.files?.[0];

    if (!selected) return;

    setFile(selected);
    setPreview(
      URL.createObjectURL(selected)
    );

    setResult("");
  };

  const analyze = async () => {

    if (!file) return;

    setLoading(true);
    setResult("");

    try {

      const form = new FormData();

      form.append("image", file);

      const response = await fetch(
        "/api/doctor",
        {
          method: "POST",
          body: form,
        }
      );

      const data = await response.json();

      setResult(
        data.result ||
        "फसल की जांच पूरी नहीं हो सकी।"
      );

    } catch {

      setResult(
        "Crop Doctor अभी उपलब्ध नहीं है।"
      );

    }

    setLoading(false);
  };

  return (
    <Page
      title="Crop Doctor"
      setTab={setTab}
    >

      <div className="card">

        <div
          style={{
            fontSize: 55,
            textAlign: "center",
          }}
        >
          📷
        </div>

        <h2>
          अपनी फसल की जांच करें
        </h2>

        <p>
          पत्ते या फसल की साफ फोटो चुनें।
        </p>

        <label className="primary">
          📷 फोटो चुनें

          <input
            type="file"
            accept="image/*"
            hidden
            onChange={selectPhoto}
          />
        </label>

        {preview && (

          <>

            <img
              src={preview}
              alt="Crop"
              style={{
                width: "100%",
                borderRadius: 16,
                marginTop: 15,
              }}
            />

            <button
              className="primary"
              disabled={loading}
              onClick={analyze}
            >
              {loading
                ? "जांच हो रही है..."
                : "🔍 फसल की जांच करें"}
            </button>

          </>

        )}

      </div>

      {result && (

        <div className="card">

          <h3>
            🌱 जांच का परिणाम
          </h3>

          <p style={{ whiteSpace: "pre-wrap" }}>
            {result}
          </p>

        </div>

      )}

    </Page>
  );
}


/* ================= CROPS ================= */

function CropsPage({ setTab }: any) {

  const [crop, setCrop] = useState("");
  const [saved, setSaved] = useState("");

  const save = () => {

    if (!crop.trim()) return;

    setSaved(crop.trim());

    localStorage.setItem(
      "kisan_crop",
      crop.trim()
    );
  };

  return (
    <Page
      title="मेरी फसल"
      setTab={setTab}
    >

      <div className="card">

        <h2>
          🌱 अपनी फसल जोड़ें
        </h2>

        <input
          placeholder="गेहूं, धान, कपास..."
          value={crop}
          onChange={(e) =>
            setCrop(e.target.value)
          }
        />

        <button
          className="primary"
          onClick={save}
        >
          फसल सेव करें
        </button>

        {saved && (

          <div className="notice">

            🌾 <b>{saved}</b>

            <p>
              आपकी फसल सेव हो गई।
            </p>

          </div>

        )}

      </div>

      <div className="card">

        <h3>
          📍 खेत की जानकारी
        </h3>

        <p>
          गांव, क्षेत्रफल और सिंचाई की
          जानकारी बाद में जोड़ सकते हैं।
        </p>

      </div>

    </Page>
  );
}


/* ================= MANDI ================= */

function MandiPage({ setTab }: any) {

  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMandi = async () => {

    setLoading(true);

    try {

      const response = await fetch(
        `/api/mandi?crop=${encodeURIComponent(
          search
        )}`
      );

      const result = await response.json();

      setData(result.data || []);

    } catch {

      setData([]);

    }

    setLoading(false);
  };

  const demo = [
    ["गेहूं", "₹2,450"],
    ["धान", "₹2,180"],
    ["सरसों", "₹5,650"],
    ["कपास", "₹7,200"],
  ];

  return (
    <Page
      title="मंडी भाव"
      setTab={setTab}
    >

      <div className="card">

        <div className="search">
          <Search size={20} />

          <input
            placeholder="फसल खोजें..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <button
          className="primary"
          onClick={loadMandi}
        >
          {loading
            ? "भाव खोज रहे हैं..."
            : "🔎 मंडी भाव देखें"}
        </button>

      </div>

      {(data.length
        ? data
        : demo
      ).map((item: any, index: number) => {

        const name =
          Array.isArray(item)
            ? item[0]
            : item.commodity ||
              item.crop ||
              "फसल";

        const price =
          Array.isArray(item)
            ? item[1]
            : item.modal_price ||
              item.price ||
              "उपलब्ध नहीं";

        return (

          <div
            className="cartrow"
            key={index}
          >

            <span>
              🌾 <b>{name}</b>

              <small>
                आज का भाव
              </small>
            </span>

            <strong>
              {String(price).startsWith("₹")
                ? price
                : `₹${price}`}
            </strong>

          </div>

        );
      })}

      <div className="warning">
        ⚠️ मंडी भाव स्थान और मंडी के अनुसार
        बदल सकते हैं। बिक्री से पहले स्थानीय
        मंडी में पुष्टि करें।
      </div>

    </Page>
  );
}


/* ================= SCHEMES ================= */

function SchemePage({ setTab }: any) {

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
      text: "सिंचाई सुविधा को बढ़ावा",
      url: "https://pmksy.gov.in/",
    },
    {
      icon: "🌱",
      title: "प्रधानमंत्री फसल बीमा योजना",
      text: "फसल नुकसान से सुरक्षा",
      url: "https://pmfby.gov.in/",
    },
  ];

  return (
    <Page
      title="सरकारी योजना"
      setTab={setTab}
    >

      {schemes.map((scheme) => (

        <div
          className="card"
          key={scheme.title}
        >

          <h2>
            {scheme.icon} {scheme.title}
          </h2>

          <p>
            {scheme.text}
          </p>

          <a
            href={scheme.url}
            target="_blank"
            rel="noreferrer"
            className="secondary"
            style={{
              display: "block",
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            Official Website
            <ExternalLink
              size={15}
              style={{
                marginLeft: 6,
                verticalAlign: "middle",
              }}
            />
          </a>

        </div>

      ))}

    </Page>
  );
}


/* ================= STORE ================= */

function StorePage({
  setTab,
  addCart,
}: any) {

  return (
    <Page
      title="Kisan Store"
      setTab={setTab}
    >

      <div className="products">

        {products.map((product) => (

          <div
            className="product"
            key={product.id}
          >

            <div className="pimg">
              {product.emoji}
            </div>

            <b>
              {product.name}
            </b>

            <div className="price">
              ₹{product.price}
            </div>

            <button
              className="primary"
              onClick={() =>
                addCart(product.id)
              }
            >
              कार्ट में डालें
            </button>

          </div>

        ))}

      </div>

      <button
        className="primary"
        onClick={() => setTab("cart")}
      >
        🛒 कार्ट देखें
      </button>

    </Page>
  );
}


/* ================= CART ================= */

function CartPage({
  setTab,
  cart,
  addCart,
  removeCart,
}: any) {

  const items = products.filter(
    (p) => cart[p.id]
  );

  const total = items.reduce(
    (sum, p) =>
      sum + p.price * cart[p.id],
    0
  );

  if (!items.length) {

    return (
      <Page
        title="कार्ट"
        setTab={setTab}
      >

        <div className="card success">

          <div style={{ fontSize: 60 }}>
            🛒
          </div>

          <h2>
            कार्ट खाली है
          </h2>

          <button
            className="primary"
            onClick={() => setTab("store")}
          >
            Store देखें
          </button>

        </div>

      </Page>
    );
  }

  return (
    <Page
      title="कार्ट"
      setTab={setTab}
    >

      {items.map((p) => (

        <div
          className="cartrow"
          key={p.id}
        >

          <span>
            {p.emoji} <b>{p.name}</b>

            <small>
              ₹{p.price} × {cart[p.id]}
            </small>
          </span>

          <button
            onClick={() =>
              removeCart(p.id)
            }
          >
            <Minus size={16} />
          </button>

          <b>
            {cart[p.id]}
          </b>

          <button
            onClick={() =>
              addCart(p.id)
            }
          >
            <Plus size={16} />
          </button>

        </div>

      ))}

      <div className="card totals">

        <p>
          <span>कुल राशि</span>
          <b>₹{total}</b>
        </p>

        <button
          className="primary"
          onClick={() =>
            alert(
              `ऑर्डर की कुल राशि ₹${total} है।`
            )
          }
        >
          ऑर्डर करें
        </button>

      </div>

    </Page>
  );
}


/* ================= PROFILE ================= */

    function ProfilePage({ setTab }: any) {
  const [name, setName] = useState(
    localStorage.getItem("kisan_name") || "किसान भाई"
  );

  const [village, setVillage] = useState(
    localStorage.getItem("kisan_village") || ""
  );

  const [district, setDistrict] = useState(
    localStorage.getItem("kisan_district") || ""
  );

  const [state, setState] = useState(
    localStorage.getItem("kisan_state") || ""
  );

  const [saved, setSaved] = useState(false);

  const saveProfile = () => {
    localStorage.setItem("kisan_name", name);
    localStorage.setItem("kisan_village", village);
    localStorage.setItem("kisan_district", district);
    localStorage.setItem("kisan_state", state);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <Page title="प्रोफाइल" setTab={setTab}>

      <div className="card success">

        <div className="bigavatar">
          👨‍🌾
        </div>

        <h2>{name}</h2>

        <p>
          KisanSaathi उपयोगकर्ता
        </p>

      </div>

      <div className="card">

        <h3>👤 किसान की जानकारी</h3>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="अपना नाम लिखें"
        />

        <input
          value={village}
          onChange={(e) => setVillage(e.target.value)}
          placeholder="गांव का नाम"
        />

        <input
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="जिला"
        />

        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="राज्य"
        />

        <button
          className="primary"
          onClick={saveProfile}
        >
          💾 जानकारी सेव करें
        </button>

        {saved && (
          <div className="notice" style={{ marginTop: 10 }}>
            ✅ आपकी जानकारी सेव हो गई।
          </div>
        )}

      </div>

      <div className="card">

        <h3>📍 मेरा पता</h3>

        {village || district || state ? (
          <p>
            {village && (
              <>
                <b>गांव:</b> {village}
                <br />
              </>
            )}

            {district && (
              <>
                <b>जिला:</b> {district}
                <br />
              </>
            )}

            {state && (
              <>
                <b>राज्य:</b> {state}
              </>
            )}
          </p>
        ) : (
          <p>
            अभी पता नहीं जोड़ा गया है।
          </p>
        )}

      </div>

      <div className="card">

        <h3>🌾 मेरी फसल</h3>

        <button
          className="secondary"
          onClick={() => setTab("crops")}
        >
          फसल की जानकारी जोड़ें
        </button>

      </div>

      <div className="card">

        <h3>🌦️ मौसम</h3>

        <p>
          आपके live location से मौसम की जानकारी
          देखी जा सकती है।
        </p>

        <button
          className="secondary"
          onClick={() => setTab("weather")}
        >
          मौसम देखें
        </button>

      </div>

    </Page>
  );
}            
