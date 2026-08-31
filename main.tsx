import React, { useEffect, useState } from "react";
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
  Plus,
  Minus,
  Search,
  RefreshCw,
  MapPin,
  ArrowLeft
} from "lucide-react";

import "./style.css";

/* =========================
   TYPES
========================= */

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  unit: string;
  image: string;
};

type Farm = {
  id: number;
  name: string;
  crop: string;
  area: number;
  unit: string;
  sowingDate: string;
  soil: string;
  irrigation: string;
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

/* =========================
   RENDER BACKEND
   REAL GOVERNMENT MANDI API
========================= */

const BACKEND_URL =
  "https://kisansathi-ai-q9b0.onrender.com";

/* =========================
   API HELPER
========================= */

const api = async (
  path: string,
  opts?: RequestInit
) => {
  const r = await fetch(
    `${BACKEND_URL}/api${path}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(opts?.headers || {})
      },
      ...opts
    }
  );

  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || "API error");
  }

  return r.json();
};

/* =========================
   APP
========================= */

function App() {
  const [tab, setTab] = useState("home");

  const [products, setProducts] =
    useState<Product[]>([]);

  const [cart, setCart] =
    useState<Record<number, number>>({});

  const [farms, setFarms] =
    useState<Farm[]>([]);

  const [chat, setChat] =
    useState<
      { role: string; text: string }[]
    >([]);

  const [q, setQ] = useState("");

  const [name] =
    useState("Kisan Bhai");

  const [doctor, setDoctor] =
    useState<any>(null);

  /* =========================
     LOAD OLD BACKEND DATA
  ========================= */

  useEffect(() => {
    api("/products")
      .then(setProducts)
      .catch(() => {
        setProducts([]);
      });

    api("/farms")
      .then(setFarms)
      .catch(() => {
        setFarms([]);
      });
  }, []);

  /* =========================
     CART
  ========================= */

  const count = Object.values(cart).reduce(
    (a, b) => a + b,
    0
  );

  const total = Object.entries(cart).reduce(
    (s, [id, n]) => {
      const p = products.find(
        x => x.id === +id
      );

      return (
        s +
        (p
          ? (p.discountPrice || p.price) * n
          : 0)
      );
    },
    0
  );

  /* =========================
     AI CHAT
  ========================= */

  const ask = async () => {
    if (!q.trim()) return;

    const text = q;

    setQ("");

    setChat(c => [
      ...c,
      {
        role: "user",
        text
      }
    ]);

    try {
      const x = await api(
        "/chat",
        {
          method: "POST",
          body: JSON.stringify({
            message: text
          })
        }
      );

      setChat(c => [
        ...c,
        {
          role: "ai",
          text:
            x.reply ||
            "AI से जवाब नहीं मिला।"
        }
      ]);
    } catch {
      setChat(c => [
        ...c,
        {
          role: "ai",
          text:
            "AI service से अभी connection नहीं हो पाया।"
        }
      ]);
    }
  };

  /* =========================
     SCREEN
  ========================= */

  return (
    <div className="app">

      <header>
        <div>
          <div className="brand">
            🌾 KisanSaathi AI
          </div>

          <small>
            Aapka Digital Kisan Dost
          </small>
        </div>

        <div className="avatar">
          👨‍🌾
        </div>
      </header>

      <main>

        {tab === "home" && (
          <HomePage
            name={name}
            setTab={setTab}
          />
        )}

        {tab === "crops" && (
          <Crops
            farms={farms}
            setFarms={setFarms}
          />
        )}

        {tab === "doctor" && (
          <Doctor
            doctor={doctor}
            setDoctor={setDoctor}
          />
        )}

        {tab === "store" && (
          <Store
            products={products}
            cart={cart}
            setCart={setCart}
          />
        )}

        {tab === "profile" && (
          <Profile
            name={name}
            setTab={setTab}
          />
        )}

        {tab === "cart" && (
          <Cart
            products={products}
            cart={cart}
            setCart={setCart}
            total={total}
          />
        )}

        {tab === "chat" && (
          <Chat
            chat={chat}
            q={q}
            setQ={setQ}
            ask={ask}
          />
        )}

        {/* =====================
            REAL MANDI
        ===================== */}

        {tab === "mandi" && (
          <MandiPage
            setTab={setTab}
          />
        )}

      </main>

      <button
        className="fab"
        onClick={() =>
          setTab("chat")
        }
      >
        <MessageCircle size={25} />
        <span>AI Kisan</span>
      </button>

      <nav>

        {[
          [Home, "home", "Home"],
          [Leaf, "crops", "Meri Fasal"],
          [Camera, "doctor", "Crop Doctor"],
          [
            ShoppingCart,
            "store",
            `Store${
              count
                ? ` (${count})`
                : ""
            }`
          ],
          [User, "profile", "Profile"]
        ].map(
          ([I, k, t]: any) => (
            <button
              className={
                tab === k
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab(k)
              }
              key={k}
            >
              <I size={22} />
              <span>{t}</span>
            </button>
          )
        )}

      </nav>

    </div>
  );
}

/* =========================
   HOME
========================= */

function HomePage({
  name,
  setTab
}: any) {
  return (
    <>
      <section className="hero">

        <h1>
          Namaste {name} 👋
        </h1>

        <p>
          आज खेती में आपकी मदद के लिए तैयार हूँ।
        </p>

        <div className="weather">

          <CloudSun />

          <div>
            <b>
              28°C · साफ़ मौसम
            </b>

            <small>
              🌧️ बारिश की संभावना: 20%
            </small>
          </div>

        </div>

      </section>

      <div className="grid">

        <button
          className="action"
          onClick={() =>
            setTab("doctor")
          }
        >
          <span>📸</span>

          <div>
            <b>
              Fasal Check Karein
            </b>
            <small>
              देखें
            </small>
          </div>

          <Camera size={20} />
        </button>

        <button
          className="action"
          onClick={() =>
            setTab("chat")
          }
        >
          <span>🤖</span>

          <div>
            <b>
              AI Kisan
            </b>
            <small>
              पूछें
            </small>
          </div>

          <MessageCircle size={20} />
        </button>

        <button
          className="action"
          onClick={() =>
            setTab("home")
          }
        >
          <span>🌦️</span>

          <div>
            <b>
              Mausam
            </b>
            <small>
              देखें
            </small>
          </div>

          <CloudSun size={20} />
        </button>

        {/* =====================
            IMPORTANT:
            REAL MANDI BUTTON
        ===================== */}

        <button
          className="action"
          onClick={() =>
            setTab("mandi")
          }
        >
          <span>💰</span>

          <div>
            <b>
              Real Mandi Bhav
            </b>

            <small>
              सरकारी भाव देखें
            </small>
          </div>

          <IndianRupee size={20} />
        </button>

        <button
          className="action"
          onClick={() =>
            setTab("crops")
          }
        >
          <span>🌱</span>

          <div>
            <b>
              Meri Fasal
            </b>

            <small>
              देखें
            </small>
          </div>

          <Leaf size={20} />
        </button>

        <button
          className="action"
          onClick={() =>
            setTab("store")
          }
        >
          <span>🛒</span>

          <div>
            <b>
              Kisan Store
            </b>

            <small>
              खरीदें
            </small>
          </div>

          <ShoppingCart size={20} />
        </button>

        <button
          className="action"
          onClick={() =>
            setTab("home")
          }
        >
          <span>🏛️</span>

          <div>
            <b>
              Sarkari Yojana
            </b>

            <small>
              देखें
            </small>
          </div>

          <Landmark size={20} />
        </button>

      </div>

      <section className="card">

        <b>
          🌾 KisanSaathi
        </b>

        <p>
          अब Mandi Bhav में
          Government of India /
          AGMARKNET का real data
          दिखाया जा सकता है।
        </p>

      </section>
    </>
  );
}

/* =========================
   REAL MANDI PAGE
========================= */

function MandiPage({
  setTab
}: any) {

  const [mandi, setMandi] =
    useState<MandiRecord[]>([]);

  const [state, setState] =
    useState("");

  const [commodity, setCommodity] =
    useState("");

  const [market, setMarket] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searched, setSearched] =
    useState(false);

  /* =========================
     LOAD MANDI
  ========================= */

  const loadMandi = async () => {

    setLoading(true);
    setError("");

    try {

      const params =
        new URLSearchParams();

      if (state.trim()) {
        params.set(
          "state",
          state.trim()
        );
      }

      if (commodity.trim()) {
        params.set(
          "commodity",
          commodity.trim()
        );
      }

      if (market.trim()) {
        params.set(
          "market",
          market.trim()
        );
      }

      params.set(
        "limit",
        "50"
      );

      const data =
        await api(
          `/mandi?${params.toString()}`
        );

      if (
        data &&
        Array.isArray(data.mandi)
      ) {

        setMandi(
          data.mandi
        );

      } else {

        setMandi([]);

      }

      setSearched(true);

    } catch (e: any) {

      console.error(e);

      setMandi([]);

      setError(
        "Mandi data अभी नहीं मिल पाया। कृपया दोबारा कोशिश करें।"
      );

    } finally {

      setLoading(false);

    }
  };

  /* =========================
     FIRST LOAD
  ========================= */

  useEffect(() => {
    loadMandi();
  }, []);

  return (
    <>
      <div className="title">

        <button
          onClick={() =>
            setTab("home")
          }
          style={{
            marginBottom: "10px"
          }}
        >
          <ArrowLeft size={18} />
          वापस
        </button>

        <h1>
          💰 Real Mandi Bhav
        </h1>

        <small>
          Government of India · AGMARKNET
        </small>

      </div>

      {/* =====================
          SEARCH CARD
      ===================== */}

      <div className="card">

        <h2>
          🔎 मंडी भाव खोजें
        </h2>

        <label>
          राज्य
        </label>

        <input
          value={state}
          onChange={e =>
            setState(e.target.value)
          }
          placeholder="जैसे: Haryana"
        />

        <label>
          फसल / Commodity
        </label>

        <input
          value={commodity}
          onChange={e =>
            setCommodity(
              e.target.value
            )
          }
          placeholder="जैसे: Wheat या Paddy(Common)"
        />

        <label>
          मंडी
        </label>

        <input
          value={market}
          onChange={e =>
            setMarket(
              e.target.value
            )
          }
          placeholder="जैसे: Karnal"
        />

        <button
          className="primary"
          onClick={loadMandi}
          disabled={loading}
        >

          {loading ? (
            <>
              <RefreshCw
                size={18}
                className="spin"
              />

              Data आ रहा है...
            </>
          ) : (
            <>
              <Search size={18} />

              Real Mandi Bhav देखें
            </>
          )}

        </button>

      </div>

      {/* =====================
          ERROR
      ===================== */}

      {error && (
        <div className="card">

          <div className="warning">
            ⚠️ {error}
          </div>

          <button
            className="secondary"
            onClick={loadMandi}
          >
            🔄 फिर कोशिश करें
          </button>

        </div>
      )}

      {/* =====================
          SOURCE
      ===================== */}

      {searched &&
        !error && (
          <div className="notice">

            🇮🇳
            Government of India -
            Data.gov.in / AGMARKNET

          </div>
        )}

      {/* =====================
          RECORDS
      ===================== */}

      {loading && (
        <div className="card">

          <h2>
            🌾 Real mandi data
          </h2>

          <p>
            Government server से
            data लिया जा रहा है...
          </p>

        </div>
      )}

      {!loading &&
        searched &&
        mandi.length === 0 &&
        !error && (
          <div className="card">

            <h2>
              कोई record नहीं मिला
            </h2>

            <p>
              राज्य या फसल का नाम
              थोड़ा अलग लिखकर
              दोबारा खोजें।
            </p>

          </div>
        )}

      {!loading &&
        mandi.map(
          (item, index) => (

            <div
              className="card"
              key={`${item.state}-${item.market}-${index}`}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "10px"
                }}
              >

                <div>

                  <h2>
                    🌾 {item.commodity}
                  </h2>

                  <p>
                    <MapPin
                      size={15}
                      style={{
                        verticalAlign:
                          "middle"
                      }}
                    />

                    {" "}
                    {item.market}
                  </p>

                  <small>
                    {item.district},{" "}
                    {item.state}
                  </small>

                </div>

                <div
                  style={{
                    textAlign: "right"
                  }}
                >

                  <small>
                    Modal
                  </small>

                  <h2>
                    ₹{item.modalPrice}
                  </h2>

                </div>

              </div>

              <hr />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "10px"
                }}
              >

                <div>
                  <small>
                    न्यूनतम भाव
                  </small>

                  <b>
                    ₹{item.minPrice}
                  </b>
                </div>

                <div>
                  <small>
                    अधिकतम भाव
                  </small>

                  <b>
                    ₹{item.maxPrice}
                  </b>
                </div>

                <div>
                  <small>
                    Variety
                  </small>

                  <b>
                    {item.variety ||
                      "-"}
                  </b>
                </div>

                <div>
                  <small>
                    Grade
                  </small>

                  <b>
                    {item.grade ||
                      "-"}
                  </b>
                </div>

              </div>

              <p>
                📅 Arrival Date:{" "}
                {item.arrivalDate ||
                  "-"}
              </p>

            </div>

          )
        )}

    </>
  );
}

/* =========================
   CROP DOCTOR
========================= */

function Doctor({
  doctor,
  setDoctor
}: any) {

  const [crop, setCrop] =
    useState("गेहूं");

  const [file, setFile] =
    useState<File | null>(null);

  const analyze = async () => {

    try {

      const r =
        await api(
          "/crop/analyze",
          {
            method: "POST",
            body: JSON.stringify({
              cropType: crop
            })
          }
        );

      setDoctor(r);

    } catch {

      setDoctor({
        crop,
        issue:
          "Demo assessment",
        confidence:
          "Low",
        symptoms:
          "फोटो analysis backend में अभी उपलब्ध नहीं है।",
        causes:
          "जानकारी पर्याप्त नहीं है।",
        nextSteps:
          "स्थानीय कृषि विशेषज्ञ से पुष्टि करें।",
        prevention:
          "फसल की नियमित निगरानी करें।"
      });

    }
  };

  return (
    <>
      <Title title="📸 Crop Doctor" />

      <div className="card">

        <label>
          फसल चुनें
        </label>

        <select
          value={crop}
          onChange={e =>
            setCrop(e.target.value)
          }
        >
          <option>
            गेहूं
          </option>

          <option>
            धान
          </option>

          <option>
            टमाटर
          </option>

          <option>
            आलू
          </option>

          <option>
            कपास
          </option>

        </select>

        <label className="upload">

          📷 फोटो चुनें

          <input
            type="file"
            accept="image/*"
            onChange={e =>
              setFile(
                e.target.files?.[0] ||
                  null
              )
            }
          />

        </label>

        {file && (
          <p>
            ✓ {file.name}
          </p>
        )}

        <button
          className="primary"
          onClick={analyze}
        >
          फसल का विश्लेषण करें
        </button>

      </div>

      {doctor && (
        <div className="card">

          <div className="warning">
            AI-based preliminary
            assessment
            <br />
            <b>
              निश्चित diagnosis नहीं है।
            </b>
          </div>

          <h2>
            {doctor.crop}
          </h2>

          <p>
            <b>
              संभावित समस्या:
            </b>{" "}
            {doctor.issue}
          </p>

          <p>
            <b>
              Confidence:
            </b>{" "}
            {doctor.confidence}
          </p>

          <p>
            <b>
              लक्षण:
            </b>{" "}
            {doctor.symptoms}
          </p>

          <p>
            <b>
              संभावित कारण:
            </b>{" "}
            {doctor.causes}
          </p>

          <p>
            <b>
              अगला कदम:
            </b>{" "}
            {doctor.nextSteps}
          </p>

          <p>
            <b>
              रोकथाम:
            </b>{" "}
            {doctor.prevention}
          </p>

        </div>
      )}
    </>
  );
}

/* =========================
   STORE
========================= */

function Store({
  products,
  cart,
  setCart
}: any) {

  return (
    <>
      <Title title="🛒 KisanSaathi Store" />

      <div className="notice">
        🌾 Kheti ki zaroori
        cheezein ek jagah
      </div>

      <input
        className="search"
        placeholder="🔎 उत्पाद खोजें..."
      />

      <div className="chips">

        <span>
          🌱 Seeds
        </span>

        <span>
          🌾 Fertilizers
        </span>

        <span>
          🧰 Tools
        </span>

        <span>
          💧 Irrigation
        </span>

      </div>

      {products.length === 0 && (
        <div className="card">
          <p>
            Store data अभी उपलब्ध
            नहीं है।
          </p>
        </div>
      )}

      <div className="products">

        {products.map(
          (p: Product) => (

            <div
              className="product"
              key={p.id}
            >

              <div className="pimg">
                {p.image}
              </div>

              <small>
                {p.category}
              </small>

              <b>
                {p.name}
              </b>

              <div className="price">

                ₹
                {p.discountPrice ||
                  p.price}

                <del>
                  {p.discountPrice
                    ? ` ₹${p.price}`
                    : ""}
                </del>

              </div>

              <small>
                {p.stock > 0
                  ? "✓ उपलब्ध"
                  : "Out of stock"}

                {" · "}

                {p.unit}
              </small>

              <button
                disabled={!p.stock}
                className="primary"
                onClick={() =>
                  setCart(
                    (c: any) => ({
                      ...c,
                      [p.id]:
                        (c[p.id] ||
                          0) + 1
                    })
                  )
                }
              >
                + Cart
              </button>

            </div>
          )
        )}

      </div>
    </>
  );
}

/* =========================
   CART
========================= */

function Cart({
  products,
  cart,
  setCart,
  total
}: any) {

  const [placed, setPlaced] =
    useState(false);

  const checkout = async () => {

    const items =
      Object.entries(cart).map(
        ([productId, quantity]) => ({
          productId: +productId,
          quantity
        })
      );

    try {

      await api(
        "/orders",
        {
          method: "POST",
          body: JSON.stringify({
            items,
            paymentMethod:
              "COD",
            customer: {
              name:
                "Kisan Bhai",
              mobile: "",
              address: "",
              village: "",
              district: "",
              state: "",
              pin: ""
            }
          })
        }
      );

      setPlaced(true);
      setCart({});

    } catch (e: any) {

      alert(
        "Order place nahi hua: " +
        e.message
      );

    }
  };

  return (
    <>
      <Title title="🛒 Cart" />

      {placed ? (
        <div className="card success">

          <h2>
            🎉 Order Placed
          </h2>

          <p>
            Order save ho gaya.
          </p>

        </div>
      ) : (
        <>
          <div>

            {Object.entries(cart).map(
              ([id, n]: any) => {

                const p =
                  products.find(
                    (x: Product) =>
                      x.id === +id
                  );

                if (!p) return null;

                return (
                  <div
                    className="cartrow"
                    key={id}
                  >

                    <span>
                      {p.image}{" "}
                      {p.name}
                    </span>

                    <b>
                      ×{n}
                    </b>

                    <button
                      onClick={() =>
                        setCart(
                          (c: any) => ({
                            ...c,
                            [id]:
                              Math.max(
                                0,
                                c[id] - 1
                              )
                          })
                        )
                      }
                    >
                      <Minus
                        size={16}
                      />
                    </button>

                  </div>
                );
              }
            )}

          </div>

          <div className="card totals">

            <p>
              Subtotal{" "}
              <b>
                ₹{total}
              </b>
            </p>

            <p>
              Delivery{" "}
              <b>
                ₹0
              </b>
            </p>

            <h2>
              Total{" "}
              <b>
                ₹{total}
              </b>
            </h2>

            <button
              className="primary"
              disabled={!total}
              onClick={checkout}
            >
              COD से Order करें
            </button>

          </div>
        </>
      )}
    </>
  );
}

/* =========================
   CROPS
========================= */

function Crops({
  farms,
  setFarms
}: any) {

  const [open, setOpen] =
    useState(false);

  const [f, setF] =
    useState({
      name: "मेरा खेत",
      crop: "गेहूं",
      area: 1,
      unit: "एकड़",
      sowingDate: "",
      soil: "दोमट",
      irrigation: "नहर"
    });

  const save = async () => {

    try {

      const x =
        await api(
          "/farms",
          {
            method: "POST",
            body:
              JSON.stringify(f)
          }
        );

      setFarms([
        ...farms,
        x
      ]);

      setOpen(false);

    } catch {

      setFarms([
        ...farms,
        {
          ...f,
          id:
            Date.now()
        }
      ]);

      setOpen(false);
    }
  };

  return (
    <>
      <Title title="🌱 Meri Fasal" />

      <button
        className="primary"
        onClick={() =>
          setOpen(!open)
        }
      >
        + नया खेत जोड़ें
      </button>

      {open && (
        <div className="card">

          {Object.keys(f).map(
            k => (
              <input
                key={k}
                placeholder={k}
                value={
                  (f as any)[k]
                }
                onChange={e =>
                  setF({
                    ...f,
                    [k]:
                      e.target.value
                  })
                }
              />
            )
          )}

          <button
            className="primary"
            onClick={save}
          >
            सेव करें
          </button>

        </div>
      )}

      {farms.map(
        (x: any) => (
          <div
            className="card"
            key={x.id}
          >

            <h2>
              🌾 {x.name}
            </h2>

            <p>
              {x.crop} ·{" "}
              {x.area}{" "}
              {x.unit}
            </p>

            <p>
              मिट्टी: {x.soil}
              {" · "}
              सिंचाई:{" "}
              {x.irrigation}
            </p>

            <span className="tag">
              स्वस्थ · Demo
            </span>

          </div>
        )
      )}
    </>
  );
}

/* =========================
   CHAT
========================= */

function Chat({
  chat,
  q,
  setQ,
  ask
}: any) {

  return (
    <>
      <Title title="🤖 AI Kisan" />

      <div className="chat">

        {chat.length === 0 && (
          <div className="ai">

            नमस्ते! मैं
            KisanSaathi AI हूँ।
            खेती से जुड़ा सवाल
            पूछिए।

          </div>
        )}

        {chat.map(
          (m: any, i: number) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "user"
                  : "ai"
              }
            >
              {m.text}
            </div>
          )
        )}

      </div>

      <div className="composer">

        <input
          value={q}
          onChange={e =>
            setQ(e.target.value)
          }
          onKeyDown={e =>
            e.key === "Enter" &&
            ask()
          }
          placeholder="जैसे: गेहूं की पत्तियां पीली हैं..."
        />

        <button onClick={ask}>
          ➤
        </button>

      </div>
    </>
  );
}

/* =========================
   PROFILE
========================= */

function Profile({
  name,
  setTab
}: any) {

  return (
    <>
      <Title title="👤 Profile" />

      <div className="profile card">

        <div className="bigavatar">
          👨‍🌾
        </div>

        <h2>
          {name}
        </h2>

        <p>
          📍 भारत · Hindi
        </p>

      </div>

      <div className="card">

        <button
          onClick={() =>
            setTab("crops")
          }
        >
          🌱 मेरे खेत
        </button>

        <button
          onClick={() =>
            setTab("cart")
          }
        >
          🛒 मेरे Orders / Cart
        </button>

        <button>
          📖 Khet Diary
        </button>

        <button
          onClick={() =>
            setTab("mandi")
          }
        >
          💰 Real Mandi Bhav
        </button>

        <button>
          🏛️ Sarkari Yojana
        </button>

      </div>
    </>
  );
}

/* =========================
   TITLE
========================= */

function Title({
  title
}: any) {

  return (
    <div className="title">

      <h1>
        {title}
      </h1>

      <small>
        सरल भाषा · किसान के लिए
      </small>

    </div>
  );
}

/* =========================
   START
========================= */

createRoot(
  document.getElementById("root")!
).render(
  <App />
);
