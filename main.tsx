import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const green = "#2f7d32";

const crops = [
  ["🌾", "गेहूं", "₹2,450"],
  ["🌾", "धान", "₹2,180"],
  ["🌻", "सरसों", "₹5,650"],
  ["🌱", "कपास", "₹7,200"],
];

function App() {
  const [tab, setTab] = useState("home");
  const [crop, setCrop] = useState("");
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState(
    "नमस्ते किसान भाई! अपना सवाल नीचे लिखकर भेजें।"
  );
  const [cart, setCart] = useState<string[]>([]);

  const [name, setName] = useState(
    localStorage.getItem("farmerName") || "किसान भाई"
  );

  const go = (page: string) => setTab(page);

  const sendQuestion = () => {
    if (!question.trim()) return;

    setChat(
      "🤖 AI Kisan: आपकी समस्या समझ रहा हूँ। फसल, मौसम और मिट्टी की जानकारी के आधार पर सही सलाह दी जाएगी।"
    );

    setQuestion("");
  };

  const Home = () => (
    <>
      <div className="welcome">
        <small>नमस्ते {name} 👋</small>
        <h2>आज खेती में आपकी मदद के लिए तैयार हैं।</h2>

        <button className="weatherBox" onClick={() => go("weather")}>
          ☀️
          <div>
            <b>आज का मौसम</b>
            <small>अपने इलाके का मौसम देखें</small>
          </div>
          <span>›</span>
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
        दवा या सिंचाई के फैसला लेने से पहले मौसम और फसल की स्थिति जरूर जांचें।
      </div>
    </>
  );

  const Weather = () => (
    <Page title="मौसम" back onBack={() => go("home")}>
      <div className="location">📍 30.17°, 77.61°　　↻</div>

      <div className="weatherMain">
        <div>☀️</div>

        <section>
          <small>अभी का मौसम</small>
          <strong>30°C</strong>
          <b>साफ आसमान</b>
        </section>
      </div>

      <div className="grid">
        <Info icon="💧" title="नमी" value="81%" />
        <Info icon="☀️" title="बादल" value="75%" />
        <Info icon="🌬️" title="हवा" value="7 km/h" />
        <Info icon="🌡️" title="महसूस" value="37°C" />
      </div>

      <div className="box">
        <h3>📅 अगले 3 दिन</h3>
        <p>
          आज <span>⛈️ 33° / 26°</span>
        </p>
        <p>
          कल <span>⛈️ 31° / 25°</span>
        </p>
        <p>
          परसों <span>⛈️ 31° / 25°</span>
        </p>
      </div>
    </Page>
  );

  const Market = () => (
    <Page title="मंडी भाव" back onBack={() => go("home")}>
      <div className="search">🔍　फसल खोजें...</div>

      <button className="greenBtn">📊 मंडी भाव देखें</button>

      <div className="box">
        {crops.map((c) => (
          <div className="market" key={c[1]}>
            <span>
              {c[0]} <b>{c[1]}</b>
              <small>आज का भाव</small>
            </span>

            <strong>{c[2]}</strong>
          </div>
        ))}
      </div>

      <div className="tip">
        ⚠️ मंडी भाव स्थान और मंडी के अनुसार बदल सकते हैं।
      </div>
    </Page>
  );

  const Doctor = () => (
    <Page title="Crop Doctor" back onBack={() => go("home")}>
      <div className="doctor">
        <div className="bigIcon">📷</div>

        <h2>अपनी फसल की जांच करें</h2>

        <p>पत्ते या फसल की साफ फोटो चुनें</p>

        <label className="upload">
          📷 फोटो चुनें
          <input type="file" accept="image/*" />
        </label>

        <button className="greenBtn">
          🔍 फसल की जांच करें
        </button>
      </div>
    </Page>
  );

  const AI = () => (
    <Page title="AI Kisan" back onBack={() => go("home")}>
      <div className="aiHead">
        <div>🤖</div>
        <h2>AI Kisan</h2>

        <p>
          खेती, मौसम, फसल और मंडी से जुड़े सवाल पूछें
        </p>
      </div>

      <div className="chips">
        <button
          onClick={() =>
            setQuestion("गेहूं में कौन सी खाद डालें?")
          }
        >
          गेहूं में कौन सी खाद डालें?
        </button>

        <button
          onClick={() =>
            setQuestion("आज बारिश होगी?")
          }
        >
          आज बारिश होगी?
        </button>

        <button
          onClick={() =>
            setQuestion("धान की खेती के लिए सलाह")
          }
        >
          धान की खेती के लिए सलाह
        </button>
      </div>

      <div className="chat">{chat}</div>

      <div className="inputRow">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="अपना सवाल लिखें..."
        />

        <button onClick={sendQuestion}>➤</button>
      </div>
    </Page>
  );

  const Crop = () => (
    <Page title="मेरी फसल" back onBack={() => go("home")}>
      <div className="box">
        <h2>🌱 अपनी फसल जोड़ें</h2>

        <input
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          placeholder="गेहूं, धान, कपास..."
        />

        <button
          className="greenBtn"
          onClick={() => alert("फसल सेव हो गई")}
        >
          💾 फसल सेव करें
        </button>
      </div>

      <div className="box">
        <h3>📍 खेत की जानकारी</h3>

        <p>
          गांव, क्षेत्रफल और सिंचाई की जानकारी बाद में जोड़ सकते हैं।
        </p>
      </div>
    </Page>
  );

  const Schemes = () => (
    <Page
      title="सरकारी योजना"
      back
      onBack={() => go("home")}
    >
      {[
        [
          "🌾",
          "PM-KISAN",
          "किसानों के लिए आर्थिक सहायता",
        ],
        [
          "💧",
          "प्रधानमंत्री कृषि सिंचाई योजना",
          "सिंचाई सुविधा का बढ़ावा",
        ],
        [
          "🌱",
          "प्रधानमंत्री फसल बीमा योजना",
          "फसल नुकसान से सुरक्षा",
        ],
      ].map((x) => (
        <div className="scheme" key={x[1]}>
          <span>{x[0]}</span>

          <div>
            <b>{x[1]}</b>
            <small>{x[2]}</small>
          </div>

          <span>↗</span>
        </div>
      ))}
    </Page>
  );

  const Store = () => (
    <Page title="Kisan Store" back onBack={() => go("home")}>
      <div className="storeGrid">
        {[
          ["🌿", "नीम ऑयल", "₹299"],
          ["🌱", "जैविक खाद", "₹499"],
          ["🧴", "फसल सुरक्षा किट", "₹699"],
          ["🌾", "बीज उपचार किट", "₹399"],
        ].map((x) => (
          <div className="product" key={x[1]}>
            <div className="productIcon">{x[0]}</div>

            <b>{x[1]}</b>

            <strong>{x[2]}</strong>

            <button
              onClick={() =>
                setCart([...cart, x[1]])
              }
            >
              🛒 कार्ट में डालें
            </button>
          </div>
        ))}
      </div>

      <button className="greenBtn">
        🛒 कार्ट देखें ({cart.length})
      </button>
    </Page>
  );

  const Profile = () => {
    const [edit, setEdit] = useState(false);

    const [village, setVillage] = useState(
      localStorage.getItem("village") || ""
    );

    const [district, setDistrict] = useState(
      localStorage.getItem("district") || ""
    );

    const [mobile, setMobile] = useState(
      localStorage.getItem("mobile") || ""
    );

    const saveProfile = () => {
      localStorage.setItem("farmerName", name);
      localStorage.setItem("village", village);
      localStorage.setItem("district", district);
      localStorage.setItem("mobile", mobile);

      setName(name.trim() || "किसान भाई");
      setEdit(false);
    };

    return (
      <>
        <div className="pageTitle">
          <button onClick={() => go("home")}>←</button>
          <h3>प्रोफाइल</h3>
        </div>

        <div className="profileBox">
          <div className="profileIcon">👤</div>

          {!edit ? (
            <>
              <h1>{name}</h1>

              {village || district ? (
                <p>
                  📍 {village}
                  {village && district ? ", " : ""}
                  {district}
                </p>
              ) : (
                <p>अपनी जानकारी जोड़ें</p>
              )}

              {mobile && <p>📱 {mobile}</p>}

              <div className="savedCrop">
                🌱 {crop ? crop : "0 फसल सेव है"}
              </div>

              <button
                className="greenBtn"
                onClick={() => setEdit(true)}
              >
                ✏️ प्रोफाइल एडिट करें
              </button>
            </>
          ) : (
            <>
              <h2>प्रोफाइल एडिट करें</h2>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="आपका नाम"
              />

              <input
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="गाँव का नाम"
              />

              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="जिला"
              />

              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="मोबाइल नंबर"
                type="tel"
              />

              <button
                className="greenBtn"
                onClick={saveProfile}
              >
                💾 प्रोफाइल सेव करें
              </button>

              <button
                className="cancelBtn"
                onClick={() => setEdit(false)}
              >
                वापस जाएँ
              </button>
            </>
          )}
        </div>

        <div className="box">
          <h2>🏛️ सरकारी योजनाएँ</h2>

          <div className="profileList">
            🌾 <b>PM-KISAN</b>
            <small>किसानों के लिए आर्थिक सहायता</small>
          </div>

          <div className="profileList">
            💧 <b>कृषि सिंचाई योजना</b>
            <small>सिंचाई सुविधा को बढ़ावा</small>
          </div>

          <div className="profileList">
            🌱 <b>फसल बीमा योजना</b>
            <small>फसल नुकसान से सुरक्षा</small>
          </div>
        </div>

        <div className="box">
          <h2>ℹ️ ऐप की स्थिति</h2>

          <p>
            KisanSaathi AI आपकी खेती से जुड़ी जानकारी,
            मौसम, फसल और मंडी की जानकारी में मदद करता है।
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="app">
      <header>
        <span>🌾</span>

        <div>
          <b>KisanSaathi AI</b>
          <small>आपका डिजिटल किसान साथी</small>
        </div>

        <button onClick={() => go("profile")}>👤</button>
      </header>

      <main>
        {tab === "home" && <Home />}
        {tab === "weather" && <Weather />}
        {tab === "market" && <Market />}
        {tab === "doctor" && <Doctor />}
        {tab === "ai" && <AI />}
        {tab === "crop" && <Crop />}
        {tab === "schemes" && <Schemes />}
        {tab === "store" && <Store />}
        {tab === "profile" && <Profile />}
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

function Page({
  title,
  children,
  back,
  onBack,
}: any) {
  return (
    <>
      <div className="pageTitle">
        {back && (
          <button onClick={onBack}>←</button>
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
}: any) {
  return (
    <button className="card" onClick={onClick}>
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
}: any) {
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
}: any) {
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

const css = `
*{box-sizing:border-box}

body{
  margin:0;
  background:#f3f6f1;
  font-family:Arial,sans-serif;
  color:#172018
}

button,input{
  font:inherit
}

button{
  border:0;
  background:none;
  cursor:pointer
}

.app{
  max-width:520px;
  margin:auto;
  min-height:100vh;
  padding-bottom:78px
}

header{
  height:62px;
  background:white;
  margin:0 12px 12px;
  padding:10px 14px;
  display:flex;
  align-items:center;
  gap:9px;
  box-shadow:0 2px 8px #00000008
}

header>span{
  font-size:25px;
  background:#edf7e8;
  padding:7px;
  border-radius:12px
}

header div{
  flex:1
}

header b{
  display:block;
  font-size:13px
}

header small{
  font-size:8px;
  color:#777
}

header button{
  background:#edf7e8;
  border-radius:50%;
  padding:8px
}

main{
  padding:0 12px
}

.welcome{
  background:linear-gradient(135deg,#e4f7dc,#f8fcf5);
  padding:18px;
  border-radius:18px;
  margin-bottom:10px
}

.welcome small{
  color:#4b754c
}

.welcome h2{
  font-size:19px;
  margin:7px 0 13px
}

.weatherBox{
  background:white;
  border-radius:14px;
  padding:13px;
  width:100%;
  display:flex;
  align-items:center;
  text-align:left;
  gap:10px
}

.weatherBox div{
  flex:1
}

.weatherBox small{
  display:block;
  font-size:9px;
  margin-top:3px
}

.grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px
}

.card{
  background:white;
  border-radius:14px;
  padding:14px 10px;
  display:flex;
  align-items:center;
  text-align:left;
  min-height:62px;
  box-shadow:0 2px 7px #00000008
}

.card>span{
  font-size:20px;
  margin-right:8px
}

.card div{
  flex:1
}

.card b{
  font-size:12px;
  display:block
}

.card small{
  font-size:8px;
  color:#777
}

.card i{
  font-style:normal
}

.tip{
  background:#fff4c9;
  padding:11px;
  margin-top:10px;
  border-radius:10px;
  font-size:9px;
  color:#665b2a
}

.pageTitle{
  display:flex;
  align-items:center;
  gap:7px;
  margin:10px 0
}

.pageTitle button{
  background:white;
  border-radius:12px;
  padding:8px;
  font-size:18px
}

.pageTitle h3{
  margin:0;
  font-size:16px
}

.location,.search{
  background:white;
  border-radius:11px;
  padding:12px;
  margin-bottom:9px;
  font-size:11px;
  color:#777
}

.weatherMain{
  background:linear-gradient(135deg,#dff5d8,#fff);
  border-radius:18px;
  padding:20px;
  display:flex;
  gap:20px;
  align-items:center
}

.weatherMain>div{
  font-size:48px
}

.weatherMain small{
  display:block;
  color:#666
}

.weatherMain strong{
  display:block;
  font-size:27px;
  margin:5px 0
}

.weatherMain b{
  font-size:18px
}

.info{
  background:white;
  border-radius:13px;
  padding:13px;
  margin-top:8px
}

.info span{
  display:block
}

.info small{
  display:block;
  color:#777
}

.info b{
  font-size:13px
}

.box,.doctor,.aiHead{
  background:white;
  border-radius:15px;
  padding:14px;
  margin-top:9px
}

.box p{
  border-bottom:1px solid #eee;
  padding:8px 0;
  font-size:11px
}

.box p span{
  float:right
}

.greenBtn{
  background:${green};
  color:white;
  border-radius:9px;
  width:100%;
  padding:10px;
  margin:5px 0;
  font-weight:bold
}

.doctor{
  text-align:center
}

.bigIcon{
  font-size:40px
}

.doctor p{
  font-size:10px;
  color:#777
}

.upload{
  display:block;
  background:#e9f5e4;
  padding:12px;
  border-radius:10px;
  font-weight:bold
}

.upload input{
  display:block;
  width:100%;
  margin-top:8px
}

.market{
  display:flex;
  justify-content:space-between;
  padding:11px 0;
  border-bottom:1px solid #eee;
  font-size:11px
}

.market small{
  display:block;
  color:#777
}

.aiHead{
  text-align:center;
  background:linear-gradient(135deg,#e1f6dc,#fff)
}

.aiHead>div{
  font-size:35px
}

.aiHead h2{
  margin:5px
}

.aiHead p{
  font-size:10px;
  color:#777
}

.chips{
  display:flex;
  gap:5px;
  overflow:auto;
  padding:8px 0
}

.chips button{
  background:white;
  border-radius:14px;
  padding:8px;
  font-size:9px;
  white-space:nowrap
}

.chat{
  background:white;
  border-radius:12px;
  padding:15px;
  font-size:11px;
  min-height:65px
}

.inputRow{
  display:flex;
  background:white;
  border-radius:12px;
  margin-top:8px;
  padding:5px
}

.inputRow input{
  border:0;
  outline:0;
  flex:1;
  padding:8px
}

.inputRow button{
  background:${green};
  color:white;
  border-radius:9px;
  width:42px
}

.scheme{
  display:flex;
  align-items:center;
  gap:10px;
  background:white;
  border-radius:13px;
  padding:12px;
  margin:7px 0
}

.scheme div{
  flex:1
}

.scheme small{
  display:block;
  color:#777;
  font-size:9px;
  margin-top:3px
}

.storeGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:8px
}

.product{
  background:white;
  border-radius:14px;
  padding:8px
}

.productIcon{
  height:72px;
  background:#edf7e8;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:38px
}

.product b,.product strong{
  display:block;
  font-size:11px;
  margin:5px 0
}

.product button{
  width:100%;
  background:${green};
  color:white;
  border-radius:8px;
  padding:8px;
  font-size:10px
}

.profileBox{
  background:white;
  border-radius:16px;
  padding:18px;
  text-align:center;
  box-shadow:0 2px 8px #00000008
}

.profileIcon{
  width:65px;
  height:65px;
  margin:auto;
  border-radius:50%;
  background:#e8f5e4;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:34px
}

.profileBox h1{
  margin:10px 0 5px;
  font-size:22px
}

.profileBox h2{
  font-size:17px;
  margin:12px 0
}

.profileBox p{
  color:#777;
  font-size:11px
}

.profileBox input{
  width:100%;
  border:1px solid #ddd;
  border-radius:9px;
  padding:11px;
  margin:5px 0;
  outline:none
}

.savedCrop{
  background:#edf7e8;
  border-radius:10px;
  padding:10px;
  margin:10px 0;
  font-size:11px
}

.cancelBtn{
  width:100%;
  padding:9px;
  color:#666;
  font-size:11px
}

.profileList{
  padding:10px 0;
  border-bottom:1px solid #eee;
  font-size:11px
}

.profileList small{
  display:block;
  color:#777;
  margin:4px 0 0 22px;
  font-size:9px
}

.floating{
  position:fixed;
  right:max(18px,calc((100vw - 520px)/2 + 18px));
  bottom:70px;
  background:${green};
  color:white;
  border-radius:25px;
  padding:12px 15px;
  box-shadow:0 3px 10px #0003
}

nav{
  position:fixed;
  bottom:0;
  left:50%;
  transform:translateX(-50%);
  width:min(520px,100%);
  height:65px;
  background:white;
  display:grid;
  grid-template-columns:repeat(4,1fr);
  box-shadow:0 -2px 10px #00000010
}

nav button{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  color:#777;
  font-size:18px
}

nav button small{
  font-size:8px;
  margin-top:3px
}

nav .active{
  color:${green}
}
`;

const style = document.createElement("style");
style.innerHTML = css;
document.head.appendChild(style);

createRoot(
  document.getElementById("root")!
).render(<App />);
