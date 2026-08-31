import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://kisansathi-ai-q9b0.onrender.com";

type MandiItem = {
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

function App() {
  const [tab, setTab] = useState("home");

  const [state, setState] = useState("");
  const [commodity, setCommodity] = useState("Paddy(Common)");
  const [market, setMarket] = useState("");

  const [mandi, setMandi] = useState<MandiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  async function loadMandi() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (state.trim()) {
        params.set("state", state.trim());
      }

      if (commodity.trim()) {
        params.set("commodity", commodity.trim());
      }

      if (market.trim()) {
        params.set("market", market.trim());
      }

      params.set("limit", "50");

      const response = await fetch(
        `${API_URL}/api/mandi?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(
          data?.error ||
            "मंडी का data नहीं मिल पाया।"
        );
      }

      setMandi(
        Array.isArray(data.mandi)
          ? data.mandi
          : []
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Real Mandi service से connection नहीं हो पाया।"
      );

      setMandi([]);
    } finally {
      setLoading(false);
    }
  }

  async function askAI() {
    if (!message.trim()) return;

    try {
      setChatLoading(true);
      setReply("");

      const response = await fetch(
        `${API_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: message.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "AI से जवाब नहीं मिला।"
        );
      }

      setReply(
        data?.reply ||
          "AI से जवाब नहीं मिला।"
      );
    } catch (err: any) {
      setReply(
        err?.message ||
          "AI service से connection नहीं हो पाया।"
      );
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "mandi") {
      loadMandi();
    }
  }, [tab]);

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">
        <div>
          <h1>🌾 KisanSaathi</h1>
          <p>किसान का अपना डिजिटल साथी</p>
        </div>
      </header>

      {/* HOME */}

      {tab === "home" && (
        <main className="container">

          <section className="hero">
            <h2>नमस्ते किसान भाई 👨‍🌾</h2>

            <p>
              खेती, मौसम, AI और अब
              <b> Real Mandi Bhav</b>
              एक ही जगह।
            </p>
          </section>

          <div className="cards">

            <button
              className="card"
              onClick={() => setTab("mandi")}
            >
              <div className="icon">💰</div>

              <h3>Real Mandi Bhav</h3>

              <p>
                Government Data.gov.in /
                AGMARKNET से मंडी भाव
              </p>
            </button>

            <button
              className="card"
              onClick={() => setTab("ai")}
            >
              <div className="icon">🤖</div>

              <h3>Kisan AI</h3>

              <p>
                खेती से जुड़े सवाल पूछें
              </p>
            </button>

          </div>

          <section className="info">
            <h3>🌱 KisanSaathi में क्या मिलेगा?</h3>

            <ul>
              <li>✅ Real सरकारी मंडी भाव</li>
              <li>✅ फसल और खेती की जानकारी</li>
              <li>✅ AI से किसान सलाह</li>
              <li>✅ सरल हिंदी में जानकारी</li>
            </ul>
          </section>

        </main>
      )}

      {/* REAL MANDI */}

      {tab === "mandi" && (
        <main className="container">

          <button
            className="back"
            onClick={() => setTab("home")}
          >
            ← वापस
          </button>

          <section className="pageTitle">
            <h2>💰 Real Mandi Bhav</h2>

            <p>
              Government of India -
              Data.gov.in / AGMARKNET
            </p>
          </section>

          <section className="filters">

            <label>
              राज्य
              <input
                value={state}
                onChange={(e) =>
                  setState(e.target.value)
                }
                placeholder="जैसे Andhra Pradesh"
              />
            </label>

            <label>
              फसल
              <input
                value={commodity}
                onChange={(e) =>
                  setCommodity(e.target.value)
                }
                placeholder="जैसे Paddy(Common)"
              />
            </label>

            <label>
              मंडी
              <input
                value={market}
                onChange={(e) =>
                  setMarket(e.target.value)
                }
                placeholder="मंडी का नाम"
              />
            </label>

            <button
              className="primary"
              onClick={loadMandi}
              disabled={loading}
            >
              {loading
                ? "लोड हो रहा है..."
                : "🔎 मंडी भाव देखें"}
            </button>

          </section>

          {error && (
            <div className="error">
              ❌ {error}
            </div>
          )}

          {!loading && !error && mandi.length === 0 && (
            <div className="empty">
              अभी कोई मंडी रिकॉर्ड नहीं मिला।
              <br />
              ऊपर फसल या राज्य बदलकर फिर खोजें।
            </div>
          )}

          {loading && (
            <div className="loading">
              🌾 सरकारी मंडी data लाया जा रहा है...
            </div>
          )}

          <div className="mandiList">

            {mandi.map((item, index) => (
              <article
                className="mandiCard"
                key={`${item.market}-${index}`}
              >

                <div className="mandiTop">

                  <div>
                    <h3>
                      {item.market || "मंडी"}
                    </h3>

                    <p>
                      {item.district}
                      {item.district && item.state
                        ? ", "
                        : ""}
                      {item.state}
                    </p>
                  </div>

                  <span className="date">
                    {item.arrivalDate || "आज"}
                  </span>

                </div>

                <div className="crop">
                  🌾 {item.commodity}
                  {item.variety
                    ? ` • ${item.variety}`
                    : ""}
                </div>

                <div className="prices">

                  <div>
                    <small>न्यूनतम</small>
                    <strong>
                      ₹{item.minPrice}
                    </strong>
                    <span>/ क्विंटल</span>
                  </div>

                  <div>
                    <small>अधिकतम</small>
                    <strong>
                      ₹{item.maxPrice}
                    </strong>
                    <span>/ क्विंटल</span>
                  </div>

                  <div>
                    <small>Modal</small>
                    <strong>
                      ₹{item.modalPrice}
                    </strong>
                    <span>/ क्विंटल</span>
                  </div>

                </div>

                {item.grade && (
                  <div className="grade">
                    Grade: {item.grade}
                  </div>
                )}

              </article>
            ))}

          </div>

          <div className="source">
            🇮🇳 Source: Government of India -
            Data.gov.in / AGMARKNET
          </div>

        </main>
      )}

      {/* AI */}

      {tab === "ai" && (
        <main className="container">

          <button
            className="back"
            onClick={() => setTab("home")}
          >
            ← वापस
          </button>

          <section className="pageTitle">
            <h2>🤖 KisanSaathi AI</h2>

            <p>
              खेती से जुड़ा अपना सवाल पूछें।
            </p>
          </section>

          <section className="chat">

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="जैसे: गेहूं में पीला रोग क्यों हो रहा है?"
              rows={5}
            />

            <button
              className="primary"
              onClick={askAI}
              disabled={
                chatLoading ||
                !message.trim()
              }
            >
              {chatLoading
                ? "AI सोच रहा है..."
                : "🤖 सवाल पूछें"}
            </button>

            {reply && (
              <div className="answer">
                <h3>🌾 KisanSaathi का जवाब</h3>

                <p>{reply}</p>
              </div>
            )}

          </section>

        </main>
      )}

      {/* BOTTOM NAV */}

      <nav className="bottomNav">

        <button
          className={
            tab === "home"
              ? "active"
              : ""
          }
          onClick={() => setTab("home")}
        >
          🏠
          <span>होम</span>
        </button>

        <button
          className={
            tab === "mandi"
              ? "active"
              : ""
          }
          onClick={() => setTab("mandi")}
        >
          💰
          <span>मंडी</span>
        </button>

        <button
          className={
            tab === "ai"
              ? "active"
              : ""
          }
          onClick={() => setTab("ai")}
        >
          🤖
          <span>AI</span>
        </button>

      </nav>

    </div>
  );
}

createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
