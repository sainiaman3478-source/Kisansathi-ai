import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const green = "#2f7d32";

type PageName =
  | "home"
  | "weather"
  | "market"
  | "doctor"
  | "ai"
  | "crop"
  | "schemes"
  | "store"
  | "profile";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  unit: string;
  image: string;
};

const fallbackCrops = [
  ["🌾", "गेहूं", "₹2,450"],
  ["🌾", "धान", "₹2,180"],
  ["🌻", "सरसों", "₹5,650"],
  ["🌱", "कपास", "₹7,200"],
];

async function api(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("API error");
  }

  return response.json();
}

function App() {
  const [tab, setTab] = useState<PageName>("home");

  const [crop, setCrop] = useState("");
  const [question, setQuestion] = useState("");

  const [chat, setChat] = useState(
    "नमस्ते किसान भाई! अपना खेती से जुड़ा सवाल नीचे लिखकर भेजें।"
  );

  const [cart, setCart] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [mandi, setMandi] = useState<any>(null);

  const [farmSaved, setFarmSaved] = useState(false);
  const [farmName, setFarmName] = useState("");
  const [area, setArea] = useState("");

  const go = (page: PageName) => {
    setTab(page);
  };

  useEffect(() => {
    api("/api/products")
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const loadWeather = async () => {
    setLoading(true);

    try {
      const data = await api("/api/weather");
      setWeather(data);
    } catch {
      setWeather(null);
    }

    setLoading(false);
  };

  const loadMandi = async () => {
    setLoading(true);

    try {
      const data = await api("/api/mandi-prices");
      setMandi(data);
    } catch {
      setMandi(null);
    }

    setLoading(false);
  };

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const q = question.trim();

    setLoading(true);
    setChat("🤖 AI Kisan सोच रहा है...");

    try {
      const data = await api("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: q,
          question: q,
        }),
      });

      setChat(
        `🤖 AI Kisan: ${
          data.reply || "अभी जवाब उपलब्ध नहीं है।"
        }`
      );
    } catch {
      setChat(
        "⚠️ AI service से connection नहीं हो पाया। Server/API configuration जांचें।"
      );
    }

    setQuestion("");
    setLoading(false);
  };

  const saveFarm = async () => {
    if (!farmName.trim()) {
      alert("कृपया किसान/फार्म का नाम लिखें।");
      return;
    }

    try {
      await api("/api/farms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: farmName.trim(),
          crop: crop || "गेहूं",
          area: Number(area) || 1,
          unit: "एकड़",
          sowingDate: "",
          soil: "",
          irrigation: "",
        }),
      });

      setFarmSaved(true);
      alert("🌱 फसल की जानकारी सेव हो गई!");
    } catch {
      alert(
        "फसल सेव नहीं हो पाई। Server चालू है या नहीं जांचें।"
      );
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("यह सामान अभी stock में नहीं है।");
      return;
    }

    setCart((old) => [...old, product]);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("पहले सामान cart में डालें।");
      return;
    }

    try {
      setLoading(true);

      const items = cart.map((p) => ({
        productId: p.id,
        quantity: 1,
      }));

      const data = await api("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          paymentMethod: "COD",
          customer: {
            name: farmName || "किसान",
          },
        }),
      });

      alert(
        `✅ Order सफल!\nOrder No: ${data.orderNo}\nकुल: ₹${data.total}\nPayment: COD`
      );

      setCart([]);

      api("/api/products")
        .then(setProducts)
        .catch(() => {});
    } catch {
      alert("❌ Order नहीं हो पाया। Server/API जांचें।");
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <header>
        <span className="logo">🌾</span>

        <div>
          <b>KisanSaathi AI</b>
          <small>आपका डिजिटल किसान साथी</small>
        </div>

        <button
          className="profileBtn"
          onClick={() => go("profile")}
        >
          👤
        </button>
      </header>

      <main>
        {tab === "home" && (
          <Home go={go} />
        )}

        {tab === "weather" && (
          <Weather
            weather={weather}
            loading={loading}
            loadWeather={loadWeather}
            go={go}
          />
        )}

        {tab === "market" && (
          <Market
            mandi={mandi}
            loading={loading}
            loadMandi={loadMandi}
            go={go}
          />
        )}

        {tab === "doctor" && (
          <Doctor
            crop={crop}
            loading={loading}
            setLoading={setLoading}
            go={go}
          />
        )}

        {tab === "ai" && (
          <AI
            question={question}
            setQuestion={setQuestion}
            chat={chat}
            loading={loading}
            sendQuestion={sendQuestion}
            go={go}
          />
        )}

        {tab === "crop" && (
          <Crop
            crop={crop}
            setCrop={setCrop}
            farmName={farmName}
            setFarmName={setFarmName}
            area={area}
            setArea={setArea}
            farmSaved={farmSaved}
            saveFarm={saveFarm}
            go={go}
          />
        )}

        {tab === "schemes" && (
          <Schemes go={go} />
        )}

        {tab === "store" && (
          <Store
            products={products}
            cart={cart}
            addToCart={addToCart}
            placeOrder={placeOrder}
            loading={loading}
            go={go}
          />
        )}

        {tab === "profile" && (
          <Profile go={go} />
        )}
      </main>

      <button
        className="floating"
        onClick={() => go("ai")}
      >
        💬
      </button>

      <nav>
        <Nav
          icon="⌂"
          text="Home"
          active={tab === "home"}
          onClick={() => go("home")}
        />

        <Nav
          icon="🌱"
          text="फसल"
          active={tab === "crop"}
          onClick={() => go("crop")}
        />

        <Nav
          icon="📷"
          text="Doctor"
          active={tab === "doctor"}
          onClick={() => go("doctor")}
        />

        <Nav
          icon="🛒"
          text="Store"
          active={tab === "store"}
          onClick={() => go("store")}
        />
      </nav>
    </div>
  );
}

/* ================= HOME ================= */

function Home({
  go,
}: {
  go: (page: PageName) => void;
}) {
  return (
    <>
      <div className="welcome">
        <small>नमस्ते किसान भाई 👋</small>

        <h2>
          आज खेती में आपकी मदद के लिए तैयार हैं।
        </h2>

        <button
          className="weatherBox"
          onClick={() => go("weather")}
        >
          <span className="weatherEmoji">
            ☀️
          </span>

          <div>
            <b>आज का मौसम</b>
            <small>
              अपने इलाके का मौसम देखें
            </small>
          </div>

          <span className="arrow">›</span>
        </button>
      </div>

      <div className="grid">
        <Card
          icon="📷"
          title="फसल जांच"
          text="फोटो से फसल की जांच"
          onClick={() => go("doctor")}
        />

        <Card
          icon="🤖"
          title="AI Kisan"
          text="खेती की सलाह पूछें"
          onClick={() => go("ai")}
        />

        <Card
          icon="🌦️"
          title="मौसम"
          text="अपने इलाके का मौसम"
          onClick={() => go("weather")}
        />

        <Card
          icon="💰"
          title="मंडी भाव"
          text="फसलों के आज के भाव"
          onClick={() => go("market")}
        />

        <Card
          icon="🌱"
          title="मेरी फसल"
          text="अपनी फसल जोड़ें"
          onClick={() => go("crop")}
        />

        <Card
          icon="🛒"
          title="Kisan Store"
          text="खेती का सामान"
          onClick={() => go("store")}
        />

        <Card
          icon="🏛️"
          title="सरकारी योजना"
          text="किसानों की योजनाएं"
          onClick={() => go("schemes")}
        />
      </div>

      <div className="tip">
        ⚠️ <b>किसान सलाह:</b>
        <br />
        दवा या सिंचाई का फैसला लेने से पहले
        मौसम और फसल की स्थिति जरूर जांचें।
      </div>
    </>
  );
}

/* ================= WEATHER ================= */

function Weather({
  weather,
  loading,
  loadWeather,
  go,
}: {
  weather: any;
  loading: boolean;
  loadWeather: () => void;
  go: (page: PageName) => void;
}) {
  useEffect(() => {
    if (!weather) {
      loadWeather();
    }
  }, []);

  const current = weather?.current;

  return (
    <Page
      title="मौसम"
      back={() => go("home")}
    >
      <div className="location">
        📍 आपका इलाका

        <button onClick={loadWeather}>
          ↻
        </button>
      </div>

      <div className="weatherMain">
        <div className="bigWeather">
          ☀️
        </div>

        <section>
          <small>अभी का मौसम</small>

          <strong>
            {current?.temperature ?? "--"}°C
          </strong>

          <b>
            {current
              ? "मौसम की जानकारी"
              : "जानकारी लोड हो रही है"}
          </b>
        </section>
      </div>

      <div className="grid">
        <Info
          icon="💧"
          title="नमी"
          value={
            current
              ? `${current.humidity}%`
              : "--"
          }
        />

        <Info
          icon="🌧️"
          title="बारिश की संभावना"
          value={
            current
              ? `${current.rainProbability}%`
              : "--"
          }
        />

        <Info
          icon="🌬️"
          title="हवा"
          value={
            current
              ? `${current.wind} km/h`
              : "--"
          }
        />

        <Info
          icon="🌡️"
          title="तापमान"
          value={
            current
              ? `${current.temperature}°C`
              : "--"
          }
        />
      </div>

      <div className="box">
        <h3>📅 अगले 3 दिन</h3>

        {weather?.forecast?.length ? (
          weather.forecast.map((x: any) => (
            <p key={x.day}>
              {x.day}

              <span>
                🌦️ {x.temp}°C / बारिश{" "}
                {x.rain}%
              </span>
            </p>
          ))
        ) : (
          <p>
            मौसम की जानकारी उपलब्ध नहीं है।
          </p>
        )}
      </div>

      {weather?.demo && (
        <div className="tip">
          ⚠️ अभी Weather API demo mode में है।
          Live weather service जोड़ने पर वास्तविक
          मौसम आएगा।
        </div>
      )}

      {loading && (
        <div className="loading">
          लोड हो रहा है...
        </div>
      )}
    </Page>
  );
}

/* ================= MARKET ================= */

function Market({
  mandi,
  loading,
  loadMandi,
  go,
}: {
  mandi: any;
  loading: boolean;
  loadMandi: () => void;
  go: (page: PageName) => void;
}) {
  useEffect(() => {
    if (!mandi) {
      loadMandi();
    }
  }, []);

  return (
    <Page
      title="मंडी भाव"
      back={() => go("home")}
    >
      <div className="search">
        🔍 फसल खोजें...
      </div>

      <button
        className="greenBtn"
        onClick={loadMandi}
      >
        📊 मंडी भाव अपडेट करें
      </button>

      <div className="box">
        {mandi?.data?.length ? (
          mandi.data.map(
            (x: any, index: number) => (
              <div
                className="market"
                key={index}
              >
                <span>
                  🌾 <b>{x.crop}</b>
                  <small>
                    {x.mandi}
                  </small>
                </span>

                <strong>
                  ₹{x.modal}
                </strong>
              </div>
            )
          )
        ) : (
          fallbackCrops.map((c) => (
            <div
              className="market"
              key={c[1]}
            >
              <span>
                {c[0]} <b>{c[1]}</b>

                <small>
                  Demo भाव
                </small>
              </span>

              <strong>
                {c[2]}
              </strong>
            </div>
          ))
        )}
      </div>

      <div className="tip">
        ⚠️ मंडी भाव स्थान और मंडी के अनुसार
        बदल सकते हैं।

        {mandi?.demo && (
          <>
            <br />
            अभी live mandi feed configure नहीं है।
          </>
        )}
      </div>

      {loading && (
        <div className="loading">
          मंडी भाव लोड हो रहे हैं...
        </div>
      )}
    </Page>
  );
}

/* ================= DOCTOR ================= */

function Doctor({
  crop,
  loading,
  setLoading,
  go,
}: {
  crop: string;
  loading: boolean;
  setLoading: (x: boolean) => void;
  go: (page: PageName) => void;
}) {
  const [image, setImage] =
    useState<File | null>(null);

  const [result, setResult] =
    useState<any>(null);

  const analyze = async () => {
    if (!image) {
      alert("पहले फसल की फोटो चुनें।");
      return;
    }

    setLoading(true);

    try {
      const data = await api(
        "/api/crop/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cropType: crop || "फसल",
            imageName: image.name,
          }),
        }
      );

      setResult(data);
    } catch {
      alert(
        "फसल जांच service से connection नहीं हुआ।"
      );
    }

    setLoading(false);
  };

  return (
    <Page
      title="Crop Doctor"
      back={() => go("home")}
    >
      <div className="doctor">
        <div className="bigIcon">
          📷
        </div>

        <h2>
          अपनी फसल की जांच करें
        </h2>

        <p>
          पत्ते या फसल की साफ फोटो चुनें
        </p>

        <label className="upload">
          📷 फोटो चुनें

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(
                e.target.files?.[0] ||
                  null
              )
            }
          />
        </label>

        {image && (
          <div className="selectedFile">
            📁 {image.name}
          </div>
        )}

        <button
          className="greenBtn"
          onClick={analyze}
          disabled={loading}
        >
          {loading
            ? "जांच हो रही है..."
            : "🔍 फसल की जांच करें"}
        </button>
      </div>

      {result && (
        <div className="box result">
          <h3>
            🌱 जांच परिणाम
          </h3>

          <p>
            <b>समस्या:</b>{" "}
            {result.issue}
          </p>

          <p>
            <b>लक्षण:</b>{" "}
            {result.symptoms}
          </p>

          <p>
            <b>संभावित कारण:</b>{" "}
            {result.causes}
          </p>

          <p>
            <b>अगला कदम:</b>{" "}
            {result.nextSteps}
          </p>

          <p>
            <b>रोकथाम:</b>{" "}
            {result.prevention}
          </p>

          <div className="tip">
            ⚠️ यह demo/प्रारंभिक अनुमान हो सकता है।
            दवा देने से पहले विशेषज्ञ या विश्वसनीय
            कृषि सलाह से पुष्टि करें।
          </div>
        </div>
      )}
    </Page>
  );
}

/* ================= AI ================= */

function AI({
  question,
  setQuestion,
  chat,
  loading,
  sendQuestion,
  go,
}: {
  question: string;
  setQuestion: (x: string) => void;
  chat: string;
  loading: boolean;
  sendQuestion: () => void;
  go: (page: PageName) => void;
}) {
  return (
    <Page
      title="AI Kisan"
      back={() => go("home")}
    >
      <div className="aiHead">
        <div className="aiIcon">
          🤖
        </div>

        <h2>AI Kisan</h2>

        <p>
          खेती, मौसम, फसल और मंडी से जुड़े
          सवाल पूछें
        </p>
      </div>

      <div className="chips">
        <button
          onClick={() =>
            setQuestion(
              "गेहूं में कौन सी खाद डालें?"
            )
          }
        >
          गेहूं में कौन सी खाद डालें?
        </button>

        <button
          onClick={() =>
            setQuestion(
              "आज बारिश होगी?"
            )
          }
        >
          आज बारिश होगी?
        </button>

        <button
          onClick={() =>
            setQuestion(
              "धान की खेती के लिए सलाह"
            )
          }
        >
          धान की खेती के लिए सलाह
        </button>
      </div>

      <div className="chat">
        {chat}
      </div>

      <div className="inputRow">
        <input
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendQuestion();
            }
          }}
          placeholder="अपना सवाल लिखें..."
        />

        <button
          onClick={sendQuestion}
          disabled={loading}
        >
          {loading ? "…" : "➤"}
        </button>
      </div>

      <div className="tip">
        💡 फसल का नाम, फसल की उम्र, मिट्टी और
        समस्या बताने पर सलाह ज्यादा उपयोगी हो सकती है।
      </div>
    </Page>
  );
}

/* ================= CROP ================= */

function Crop({
  crop,
  setCrop,
  farmName,
  setFarmName,
  area,
  setArea,
  farmSaved,
  saveFarm,
  go,
}: {
  crop: string;
  setCrop: (x: string) => void;
  farmName: string;
  setFarmName: (x: string) => void;
  area: string;
  setArea: (x: string) => void;
  farmSaved: boolean;
  saveFarm: () => void;
  go: (page: PageName) => void;
}) {
  return (
    <Page
      title="मेरी फसल"
      back={() => go("home")}
    >
      <div className="box">
        <h2>
          🌱 अपनी फसल जोड़ें
        </h2>

        <input
          className="fullInput"
          value={crop}
          onChange={(e) =>
            setCrop(e.target.value)
          }
          placeholder="गेहूं, धान, कपास..."
        />

        <input
          className="fullInput"
          value={farmName}
          onChange={(e) =>
            setFarmName(e.target.value)
          }
          placeholder="किसान / खेत का नाम"
        />

        <input
          className="fullInput"
          value={area}
          onChange={(e) =>
            setArea(e.target.value)
          }
          type="number"
          placeholder="क्षेत्रफल (एकड़)"
        />

        <button
          className="greenBtn"
          onClick={saveFarm}
        >
          💾 फसल सेव करें
        </button>

        {farmSaved && (
          <div className="success">
            ✅ आपकी फसल की जानकारी सेव है।
          </div>
        )}
      </div>

      <div className="box">
        <h3>
          📍 खेत की जानकारी
        </h3>

        <p>
          आगे चलकर गांव, मिट्टी, सिंचाई और बुवाई
          की तारीख भी जोड़ी जा सकती है।
        </p>
      </div>
    </Page>
  );
}

/* ================= SCHEMES ================= */

function Schemes({
  go,
}: {
  go: (page: PageName) => void;
}) {
  const schemes = [
    [
      "🌾",
      "PM-KISAN",
      "किसानों के लिए आर्थिक सहायता",
      "https://pmkisan.gov.in/",
    ],
    [
      "🛡️",
      "प्रधानमंत्री फसल बीमा योजना",
      "फसल नुकसान से सुरक्षा",
      "https://pmfby.gov.in/",
    ],
    [
      "💳",
      "किसान क्रेडिट कार्ड (KCC)",
      "कृषि के लिए ऋण सुविधा",
      "https://www.jansuraksha.gov.in/",
    ],
    [
      "👨‍🌾",
      "PM किसान मानधन योजना",
      "किसानों के लिए पेंशन योजना",
      "https://maandhan.in/",
    ],
    [
      "🧪",
      "Soil Health Card",
      "मिट्टी की जांच और पोषक तत्वों की जानकारी",
      "https://soilhealth.dac.gov.in/",
    ],
    [
      "🏗️",
      "Agriculture Infrastructure Fund",
      "कृषि इंफ्रास्ट्रक्चर सहायता",
      "https://agriinfra.dac.gov.in/",
    ],
    [
      "🌱",
      "परंपरागत कृषि विकास योजना",
      "जैविक खेती को बढ़ावा",
      "https://pgsindia-ncof.gov.in/",
    ],
    [
      "📈",
      "e-NAM",
      "ऑनलाइन कृषि मंडी प्लेटफॉर्म",
      "https://www.enam.gov.in/",
    ],
    [
      "🔎",
      "MyScheme",
      "सरकारी योजनाएं खोजें",
      "https://www.myscheme.gov.in/",
    ],
  ];

  return (
    <Page
      title="सरकारी योजना"
      back={() => go("home")}
    >
      <div className="schemeIntro">
        🏛️

        <div>
          <b>
            किसानों के लिए सरकारी योजनाएं
          </b>

          <small>
            महत्वपूर्ण योजनाओं की जानकारी
          </small>
        </div>
      </div>

      {schemes.map((x) => (
        <div
          className="scheme"
          key={x[1]}
        >
          <span className="schemeIcon">
            {x[0]}
          </span>

          <div className="schemeText">
            <b>{x[1]}</b>

            <small>{x[2]}</small>

            <a
              href={x[3]}
              target="_blank"
              rel="noopener noreferrer"
              className="official"
            >
              🌐 Official Website ↗
            </a>
          </div>
        </div>
      ))}

      <div className="tip">
        ⚠️ आवेदन करने से पहले संबंधित Official
        Government Website पर जानकारी जरूर जांचें।
      </div>
    </Page>
  );
}

/* ================= STORE ================= */

function Store({
  products,
  cart,
  addToCart,
  placeOrder,
  loading,
  go,
}: {
  products: Product[];
  cart: Product[];
  addToCart: (p: Product) => void;
  placeOrder: () => void;
  loading: boolean;
  go: (page: PageName) => void;
}) {
  return (
    <Page
      title="Kisan Store"
      back={() => go("home")}
    >
      <div className="storeGrid">
        {products.length > 0
          ? products.map((p) => (
              <div
                className="product"
                key={p.id}
              >
                <div className="productIcon">
                  {p.image || "🌱"}
                </div>

                <b>{p.name}</b>

                <strong>
                  ₹
                  {p.discountPrice ??
                    p.price}
                </strong>

                <small>
                  {p.unit} • Stock:{" "}
                  {p.stock}
                </small>

                <button
                  onClick={() =>
                    addToCart(p)
                  }
                  disabled={
                    p.stock <= 0
                  }
                >
                  {p.stock > 0
                    ? "🛒 कार्ट में डालें"
                    : "Out of Stock"}
                </button>
              </div>
            ))
          : [
              ["🌿", "नीम ऑयल", "₹299"],
              ["🌱", "जैविक खाद", "₹499"],
              [
                "🧴",
                "फसल सुरक्षा किट",
                "₹699",
              ],
              [
                "🌾",
                "बीज उपचार किट",
                "₹399",
              ],
            ].map((x) => (
              <div
                className="product"
                key={x[1]}
              >
                <div className="productIcon">
                  {x[0]}
                </div>

                <b>{x[1]}</b>

                <strong>{x[2]}</strong>

                <button
                  onClick={() =>
                    alert(
                      "Demo product cart में जोड़ दिया गया।"
                    )
                  }
                >
                  🛒 कार्ट में डालें
                </button>
              </div>
            ))}
      </div>

      <div className="box">
        <h3>
          🛒 आपका कार्ट
        </h3>

        {cart.length === 0 ? (
          <p>
            अभी cart खाली है।
          </p>
        ) : (
          <>
            {cart.map((p, i) => (
              <p
                key={`${p.id}-${i}`}
              >
                {p.name}

                <span>
                  ₹
                  {p.discountPrice ??
                    p.price}
                </span>
              </p>
            ))}

            <button
              className="greenBtn"
              onClick={placeOrder}
              disabled={loading}
            >
              {loading
                ? "Order हो रहा है..."
                : "🛍️ COD Order करें"}
            </button>

            <div className="tip">
              💵 Payment Method:{" "}
              <b>Cash on Delivery (COD)</b>
            </div>
          </>
        )}
      </div>
    </Page>
  );
}

/* ================= PROFILE ================= */

function Profile({
  go,
}: {
  go: (page: PageName) => void;
}) {
  return (
    <Page
      title="प्रोफाइल"
      back={() => go("home")}
    >
      <div className="box profileBox">
        <div className="profileIcon">
          👤
        </div>

        <h2>
          किसान प्रोफाइल
        </h2>

        <input
          className="fullInput"
          placeholder="किसान का नाम"
        />

        <input
          className="fullInput"
          placeholder="गांव का नाम"
        />

        <input
          className="fullInput"
          placeholder="जिला"
        />

        <button
          className="greenBtn"
          onClick={() =>
            alert(
              "प्रोफाइल backend में सेव करने का अगला चरण जोड़ा जा सकता है।"
            )
          }
        >
          💾 प्रोफाइल सेव करें
        </button>
      </div>
    </Page>
  );
}

/* ================= COMMON ================= */

function Page({
  title,
  children,
  back,
}: {
  title: string;
  children: React.ReactNode;
  back?: () => void;
}) {
  return (
    <>
      <div className="pageTitle">
        {back && (
          <button onClick={back}>
            ←
          </button>
        )}

        <h3>{title}</h3>
      </div>

      {children}
    </>
  );
}

function Card({
  icon,
  title,
  text,
  onClick,
}: {
  icon: string;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      className="card"
      onClick={onClick}
    >
      <span>{icon}</span>

      <div>
        <b>{title}</b>
        <small>{text}</small>
      </div>

      <i>›</i>
    </button>
  );
}

function Info({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string;
}) {
  return (
    <div className="info">
      <span>{icon}</span>

      <small>{title}</small>

      <b>{value}</b>
    </div>
  );
}

function Nav({
  icon,
  text,
  active,
  onClick,
}: {
  icon: string;
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? "active" : ""}
      onClick={onClick}
    >
      {icon}

      <small>{text}</small>
    </button>
  );
}

/* ================= CSS ================= */

const css = `
*{
  box-sizing:border-box;
}

html,
body,
#root{
  margin:0;
  padding:0;
  width:100%;
  min-height:100%;
}

body{
  background:#f3f6f1;
  font-family:Arial,sans-serif;
  color:#172018;
  overflow-x:hidden;
}

button,
input{
  font:inherit;
}

button{
  border:0;
  background:none;
  cursor:pointer;
}

button:disabled{
  opacity:.6;
  cursor:not-allowed;
}

.app{
  width:100%;
  max-width:720px;
  margin:auto;
  min-height:100vh;
  padding-bottom:82px;
}

header{
  width:calc(100% - 24px);
  height:64px;
  background:white;
  margin:0 12px 12px;
  padding:10px 14px;
  display:flex;
  align-items:center;
  gap:10px;
  box-shadow:0 2px 8px #00000008;
  border-radius:0 0 12px 12px;
}

.logo{
  font-size:25px;
  background:#edf7e8;
  padding:7px;
  border-radius:12px;
}

header div{
  flex:1;
}

header b{
  display:block;
  font-size:16px;
}

header small{
  display:block;
  font-size:9px;
  color:#777;
  margin-top:2px;
}

.profileBtn{
  background:#edf7e8;
  border-radius:50%;
  padding:9px;
  font-size:17px;
}

main{
  width:100%;
  padding:0 12px;
}

.welcome{
  background:linear-gradient(135deg,#e4f7dc,#f8fcf5);
  padding:20px;
  border-radius:18px;
  margin-bottom:12px;
}

.welcome small{
  color:#4b754c;
}

.welcome h2{
  font-size:22px;
  margin:8px 0 14px;
  line-height:1.3;
}

.weatherBox{
  background:white;
  border-radius:15px;
  padding:15px;
  width:100%;
  display:flex;
  align-items:center;
  text-align:left;
  gap:12px;
  box-shadow:0 2px 8px #00000008;
}

.weatherEmoji{
  font-size:27px;
}

.weatherBox div{
  flex:1;
}

.weatherBox b{
  display:block;
  font-size:15px;
}

.weatherBox small{
  display:block;
  font-size:10px;
  margin-top:4px;
}

.arrow{
  font-size:22px;
}

.grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

.card{
  background:white;
  border-radius:15px;
  padding:15px 12px;
  display:flex;
  align-items:center;
  text-align:left;
  min-height:76px;
  box-shadow:0 2px 8px #00000008;
}

.card>span{
  font-size:25px;
  margin-right:9px;
}

.card div{
  flex:1;
}

.card b{
  font-size:14px;
  display:block;
}

.card small{
  font-size:9px;
  color:#777;
  display:block;
  margin-top:4px;
}

.card i{
  font-style:normal;
  font-size:20px;
}

.tip{
  background:#fff4c9;
  padding:12px;
  margin-top:12px;
  border-radius:11px;
  font-size:10px;
  color:#665b2a;
  line-height:1.5;
}

.pageTitle{
  display:flex;
  align-items:center;
  gap:8px;
  margin:10px 0 12px;
}

.pageTitle button{
  background:white;
  border-radius:12px;
  padding:8px 11px;
  font-size:19px;
}

.pageTitle h3{
  margin:0;
  font-size:18px;
}

.location,
.search{
  background:white;
  border-radius:11px;
  padding:13px;
  margin-bottom:10px;
  font-size:12px;
  color:#777;
}

.location button{
  float:right;
  font-size:18px;
}

.weatherMain{
  background:linear-gradient(135deg,#dff5d8,#fff);
  border-radius:18px;
  padding:22px;
  display:flex;
  gap:22px;
  align-items:center;
}

.bigWeather{
  font-size:55px;
}

.weatherMain small{
  display:block;
  color:#666;
}

.weatherMain strong{
  display:block;
  font-size:30px;
  margin:5px 0;
}

.weatherMain b{
  font-size:17px;
}

.info{
  background:white;
  border-radius:13px;
  padding:14px;
  margin-top:10px;
}

.info span{
  display:block;
  font-size:20px;
}

.info small{
  display:block;
  color:#777;
  margin-top:3px;
}

.info b{
  font-size:14px;
}

.box,
.doctor,
.aiHead{
  background:white;
  border-radius:15px;
  padding:16px;
  margin-top:10px;
  box-shadow:0 2px 8px #00000008;
}

.box h2{
  margin-top:0;
  font-size:19px;
}

.box p{
  border-bottom:1px solid #eee;
  padding:9px 0;
  font-size:12px;
  line-height:1.5;
}

.box p:last-child{
  border-bottom:0;
}

.box p span{
  float:right;
}

.greenBtn{
  background:${green};
  color:white;
  border-radius:10px;
  width:100%;
  padding:12px;
  margin:6px 0;
  font-weight:bold;
  box-shadow:0 2px 5px #0002;
}

.doctor{
  text-align:center;
}

.bigIcon{
  font-size:50px;
}

.doctor p{
  font-size:11px;
  color:#777;
}

.upload{
  display:block;
  background:#e9f5e4;
  padding:13px;
  border-radius:10px;
  font-weight:bold;
  margin-bottom:8px;
}

.upload input{
  display:block;
  width:100%;
  margin-top:9px;
}

.market{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:12px 0;
  border-bottom:1px solid #eee;
  font-size:12px;
}

.market:last-child{
  border-bottom:0;
}

.market small{
  display:block;
  color:#777;
  font-size:9px;
  margin-top:3px;
}

.market strong{
  color:${green};
  font-size:14px;
}

.aiHead{
  text-align:center;
  background:linear-gradient(135deg,#e1f6dc,#fff);
}

.aiIcon{
  font-size:45px;
}

.aiHead h2{
  margin:6px;
}

.aiHead p{
  font-size:11px;
  color:#777;
}

.chips{
  display:flex;
  gap:6px;
  overflow-x:auto;
  padding:9px 0;
}

.chips button{
  background:white;
  border-radius:15px;
  padding:9px 11px;
  font-size:10px;
  white-space:nowrap;
  box-shadow:0 2px 6px #00000008;
}

.chat{
  background:white;
  border-radius:12px;
  padding:15px;
  font-size:12px;
  min-height:70px;
  line-height:1.5;
}

.inputRow{
  display:flex;
  background:white;
  border-radius:12px;
  margin-top:9px;
  padding:5px;
}

.inputRow input{
  border:0;
  outline:0;
  flex:1;
  padding:9px;
  min-width:0;
}

.inputRow button{
  background:${green};
  color:white;
  border-radius:9px;
  width:44px;
}

.fullInput{
  width:100%;
  padding:12px;
  border:1px solid #ddd;
  border-radius:10px;
  outline:none;
  margin-bottom:9px;
}

.schemeIntro{
  display:flex;
  gap:12px;
  align-items:center;
  background:#e9f7e4;
  padding:14px;
  border-radius:13px;
  margin-bottom:9px;
}

.schemeIntro div{
  flex:1;
}

.schemeIntro b{
  display:block;
  font-size:14px;
}

.schemeIntro small{
  display:block;
  color:#777;
  font-size:9px;
  margin-top:4px;
}

.scheme{
  display:flex;
  align-items:flex-start;
  gap:11px;
  background:white;
  border-radius:13px;
  padding:13px;
  margin:8px 0;
  box-shadow:0 2px 7px #00000008;
}

.schemeIcon{
  background:#edf7e8;
  width:38px;
  height:38px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:10px;
  font-size:21px;
  flex-shrink:0;
}

.schemeText{
  flex:1;
}

.schemeText b{
  display:block;
  font-size:13px;
}

.schemeText small{
  display:block;
  color:#777;
  font-size:9px;
  margin-top:3px;
  line-height:1.4;
}

.official{
  display:inline-block;
  background:#edf7e8;
  color:${green};
  text-decoration:none;
  font-size:8px;
  padding:5px 8px;
  border-radius:7px;
  margin-top:7px;
}

.storeGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

.product{
  background:white;
  border-radius:14px;
  padding:9px;
  box-shadow:0 2px 7px #00000008;
}

.productIcon{
  height:90px;
  background:#edf7e8;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:42px;
}

.product b,
.product strong{
  display:block;
  font-size:12px;
  margin:6px 0;
}

.product strong{
  color:${green};
}

.product small{
  display:block;
  color:#777;
  font-size:9px;
  margin-bottom:7px;
}

.product button{
  width:100%;
  background:${green};
  color:white;
  border-radius:8px;
  padding:9px;
  font-size:10px;
}

.profileBox{
  text-align:center;
}

.profileIcon{
  font-size:45px;
  margin-bottom:5px;
}

.profileBox h2{
  margin-bottom:16px;
}

.success{
  background:#e8f7e4;
  color:${green};
  padding:10px;
  border-radius:9px;
  font-size:11px;
}

.loading{
  text-align:center;
  padding:15px;
  color:#777;
  font-size:11px;
}

.selectedFile{
  background:#f2f6f0;
  padding:8px;
  border-radius:8px;
  margin:8px 0;
  font-size:10px;
}

.result{
  line-height:1.5;
}

.floating{
  position:fixed;
  right:20px;
  bottom:76px;
  background:${green};
  color:white;
  border-radius:50%;
  width:48px;
  height:48px;
  font-size:20px;
  box-shadow:0 3px 12px #0004;
  z-index:10;
}

nav{
  position:fixed;
  bottom:0;
  left:50%;
  transform:translateX(-50%);
  width:100%;
  max-width:720px;
  height:68px;
  background:white;
  display:grid;
  grid-template-columns:repeat(4,1fr);
  box-shadow:0 -2px 12px #00000010;
  z-index:20;
}

nav button{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  color:#777;
  font-size:20px;
}

nav button small{
  font-size:9px;
  margin-top:4px;
}

nav .active{
  color:${green};
}

@media(max-width:420px){
  header{
    height:60px;
  }

  header b{
    font-size:14px;
  }

  .welcome{
    padding:16px;
  }

  .welcome h2{
    font-size:19px;
  }

  .card{
    min-height:70px;
    padding:12px 9px;
  }

  .card>span{
    font-size:21px;
  }

  .card b{
    font-size:12px;
  }

  .card small{
    font-size:8px;
  }

  .tip{
    font-size:9px;
  }
}

@media(max-width:350px){
  main{
    padding:0 9px;
  }

  .grid{
    gap:7px;
  }

  .card{
    padding:10px 7px;
  }

  .card>span{
    margin-right:5px;
  }
}
`;

const style = document.createElement("style");

style.innerHTML = css;

document.head.appendChild(style);

createRoot(
  document.getElementById("root")!
).render(
  <App />
);
