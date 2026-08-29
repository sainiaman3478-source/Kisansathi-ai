import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const green = "#2f7d32";

const crops = [
  ["🌾", "गेहूं", "₹2,450"],
  ["🌾", "धान", "₹2,180"],
  ["🌻", "सरसों", "₹5,650"],
  ["🌱", "कपास", "₹7,200"],
  ["🌽", "मक्का", "₹2,100"],
  ["🥔", "आलू", "₹1,850"],
];

function App() {
  const [tab, setTab] = useState("home");

  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kisanProfile") || "{}");
    } catch {
      return {};
    }
  });

  const [crop, setCrop] = useState(
    () => localStorage.getItem("kisanCrop") || ""
  );

  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState(
    "नमस्ते किसान भाई! अपना सवाल नीचे लिखकर भेजें।"
  );

  const [cart, setCart] = useState<string[]>([]);

  const go = (page: string) => setTab(page);

  const saveProfile = (data: any) => {
    setProfile(data);
    localStorage.setItem("kisanProfile", JSON.stringify(data));
    setTab("profile");
  };

  const saveCrop = () => {
    if (!crop.trim()) {
      alert("पहले अपनी फसल का नाम लिखें।");
      return;
    }

    localStorage.setItem("kisanCrop", crop);
    alert("🌱 आपकी फसल सेव हो गई!");
  };

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
        <small>
          नमस्ते {profile.name || "किसान भाई"} 👋
        </small>

        <h2>आज खेती में आपकी मदद के लिए तैयार हैं।</h2>

        <button
          className="weatherBox"
          onClick={() => go("weather")}
        >
          ☀️

          <div>
            <b>आज का मौसम</b>
            <small>अपने इलाके का मौसम देखें</small>
          </div>

          <span>›</span>
        </button>
      </div>

      {crop && (
        <div className="savedCrop">
          🌱 <b>मेरी फसल:</b> {crop}
          <button onClick={() => go("crop")}>देखें ›</button>
        </div>
      )}

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
        दवा या सिंचाई का फैसला लेने से पहले मौसम और फसल की स्थिति जरूर जांचें।
      </div>
    </>
  );

  const Weather = () => (
    <Page title="मौसम" onBack={() => go("home")}>
      <div className="location">
        📍 आपका क्षेत्र　　↻
      </div>

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
        <Info icon="☁️" title="बादल" value="75%" />
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
    <Page title="मंडी भाव" onBack={() => go("home")}>
      <div className="search">
        🔍　फसल खोजें...
      </div>

      <button className="greenBtn">
        📊 मंडी भाव देखें
      </button>

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
    <Page title="Crop Doctor" onBack={() => go("home")}>
      <div className="doctor">
        <div className="bigIcon">📷</div>

        <h2>अपनी फसल की जांच करें</h2>

        <p>
          पत्ते या फसल की साफ फोटो चुनें
        </p>

        <label className="upload">
          📷 फोटो चुनें

          <input
            type="file"
            accept="image/*"
          />
        </label>

        <button
          className="greenBtn"
          onClick={() =>
            alert(
              "📷 फोटो मिल गई। AI Crop Doctor को जोड़ने के बाद बीमारी की पहचान की जाएगी।"
            )
          }
        >
          🔍 फसल की जांच करें
        </button>
      </div>
    </Page>
  );

  const AI = () => (
    <Page title="AI Kisan" onBack={() => go("home")}>
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

      <div className="chat">
        {chat}
      </div>

      <div className="inputRow">
        <input
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          placeholder="अपना सवाल लिखें..."
        />

        <button onClick={sendQuestion}>
          ➤
        </button>
      </div>
    </Page>
  );

  const Crop = () => (
    <Page title="मेरी फसल" onBack={() => go("home")}>
      <div className="box">
        <h2>🌱 अपनी फसल जोड़ें</h2>

        <input
          className="fullInput"
          value={crop}
          onChange={(e) =>
            setCrop(e.target.value)
          }
          placeholder="गेहूं, धान, कपास..."
        />

        <button
          className="greenBtn"
          onClick={saveCrop}
        >
          💾 फसल सेव करें
        </button>
      </div>

      {crop && (
        <div className="savedBox">
          <div className="cropCircle">
            🌱
          </div>

          <div>
            <small>मेरी सेव की हुई फसल</small>
            <h3>{crop}</h3>
          </div>
        </div>
      )}

      <div className="box">
        <h3>📍 खेत की जानकारी</h3>

        <p>
          गांव, क्षेत्रफल और सिंचाई की जानकारी
          आगे जोड़ सकते हैं।
        </p>
      </div>
    </Page>
  );

  const Profile = () => {
    const [name, setName] = useState(
      profile.name || ""
    );

    const [village, setVillage] = useState(
      profile.village || ""
    );

    const [district, setDistrict] = useState(
      profile.district || ""
    );

    const [mobile, setMobile] = useState(
      profile.mobile || ""
    );

    const save = () => {
      if (!name.trim()) {
        alert("कृपया किसान का नाम लिखें।");
        return;
      }

      saveProfile({
        name,
        village,
        district,
        mobile,
      });

      alert("✅ प्रोफाइल सेव हो गई!");
    };

    return (
      <Page
        title="प्रोफाइल"
        onBack={() => go("home")}
      >
        <div className="profileCard">
          <div className="profileIcon">
            👤
          </div>

          <h2>प्रोफाइल एडिट करें</h2>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="किसान का नाम"
          />

          <input
            value={village}
            onChange={(e) =>
              setVillage(e.target.value)
            }
            placeholder="गाँव का नाम"
          />

          <input
            value={district}
            onChange={(e) =>
              setDistrict(e.target.value)
            }
            placeholder="जिला"
          />

          <input
            value={mobile}
            onChange={(e) =>
              setMobile(e.target.value)
            }
            placeholder="मोबाइल नंबर"
            inputMode="numeric"
          />

          <button
            className="greenBtn"
            onClick={save}
          >
            💾 प्रोफाइल सेव करें
          </button>

          <button
            className="backText"
            onClick={() => go("home")}
          >
            वापस जाएं
          </button>
        </div>

        {profile.name && (
          <div className="box">
            <h3>👤 आपकी जानकारी</h3>

            <p>
              <b>नाम:</b> {profile.name}
            </p>

            {profile.village && (
              <p>
                <b>गाँव:</b> {profile.village}
              </p>
            )}

            {profile.district && (
              <p>
                <b>जिला:</b> {profile.district}
              </p>
            )}

            {profile.mobile && (
              <p>
                <b>मोबाइल:</b> {profile.mobile}
              </p>
            )}
          </div>
        )}
      </Page>
    );
  };

  const Schemes = () => (
    <Page
      title="सरकारी योजनाएं"
      onBack={() => go("home")}
    >
      <div className="schemeIntro">
        🏛️

        <div>
          <h3>किसानों के लिए सरकारी योजनाएं</h3>
          <small>
            नीचे दी गई वेबसाइटों पर योजना की
            आधिकारिक जानकारी देखें।
          </small>
        </div>
      </div>

      {[
        [
          "🌾",
          "PM-KISAN",
          "किसानों के लिए आर्थिक सहायता",
          "https://pmkisan.gov.in/"
        ],

        [
          "🛡️",
          "प्रधानमंत्री फसल बीमा योजना",
          "फसल नुकसान से सुरक्षा",
          "https://pmfby.gov.in/"
        ],

        [
          "💳",
          "किसान क्रेडिट कार्ड (KCC)",
          "किसानों के लिए आसान कृषि ऋण",
          "https://www.pmkisan.gov.in/"
        ],

        [
          "👨‍🌾",
          "PM किसान मानधन योजना",
          "किसानों के लिए पेंशन योजना",
          "https://maandhan.in/"
        ],

        [
          "🧪",
          "Soil Health Card",
          "मिट्टी की जांच और स्वास्थ्य जानकारी",
          "https://soilhealth.dac.gov.in/"
        ],

        [
          "🏗️",
          "Agriculture Infrastructure Fund",
          "कृषि बुनियादी ढांचे के लिए सहायता",
          "https://agriinfra.dac.gov.in/"
        ],

        [
          "🌱",
          "परंपरागत कृषि विकास योजना",
          "जैविक खेती को बढ़ावा देने की योजना",
          "https://pgsindia-ncof.gov.in/"
        ],

        [
          "📈",
          "e-NAM",
          "ऑनलाइन कृषि मंडी प्लेटफॉर्म",
          "https://www.enam.gov.in/"
        ],

        [
          "🔎",
          "MyScheme",
          "सरकारी योजनाएं खोजने का पोर्टल",
          "https://www.myscheme.gov.in/"
        ],
      ].map((x) => (
        <div className="scheme" key={x[1]}>
          <span className="schemeIcon">
            {x[0]}
          </span>

          <div>
            <b>{x[1]}</b>
            <small>{x[2]}</small>

            <a
              href={x[3]}
              target="_blank"
              rel="noreferrer"
              className="official"
            >
              🌐 Official Website ↗
            </a>
          </div>
        </div>
      ))}

      <div className="tip">
        ⚠️ <b>जरूरी सूचना:</b>
        <br />
        योजना की पात्रता, राशि और नियम बदल सकते हैं।
        आवेदन करने से पहले Official Government Website
        पर जानकारी जरूर जांचें।
      </div>
    </Page>
  );

  const Store = () => (
    <Page
      title="Kisan Store"
      onBack={() => go("home")}
    >
      <div className="storeGrid">
        {[
          ["🌿", "नीम ऑयल", "₹299"],
          ["🌱", "जैविक खाद", "₹499"],
          ["🧴", "फसल सुरक्षा किट", "₹699"],
          ["🌾", "बीज उपचार किट", "₹399"],
        ].map((x) => (
          <div className="product" key={x[1]}>
            <div className="productIcon">
              {x[0]}
            </div>

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

      <div className="cartBox">
        🛒 <b>कार्ट में सामान:</b>{" "}
        {cart.length}

        {cart.length > 0 && (
          <div className="cartItems">
            {cart.map((item, i) => (
              <div key={i}>
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );

  return (
    <div className="app">
      <header>
        <span>🌾</span>

        <div>
          <b>KisanSaathi AI</b>
          <small>
            आपका डिजिटल किसान साथी
          </small>
        </div>

        <button
          className="profileBtn"
          onClick={() => go("profile")}
        >
          👤
        </button>
      </header>

      <main>
        {tab === "home" && <Home />}
        {tab === "weather" && <Weather />}
        {tab === "market" && <Market />}
        {tab === "doctor" && <Doctor />}
        {tab === "ai" && <AI />}
        {tab === "crop" && <Crop />}
        {tab === "profile" && <Profile />}
        {tab === "schemes" && <Schemes />}
        {tab === "store" && <Store />}
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
  onBack,
}: any) {
  return (
    <>
      <div className="pageTitle">
        <button onClick={onBack}>←</button>
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
*{
  box-sizing:border-box
}

html,body,#root{
  margin:0;
  min-height:100%;
}

body{
  background:#f3f6f1;
  font-family:Arial,sans-serif;
  color:#172018;
}

button,input{
  font:inherit;
}

button{
  border:0;
  background:none;
  cursor:pointer;
}

a{
  text-decoration:none;
}

.app{
  max-width:620px;
  margin:auto;
  min-height:100vh;
  padding-bottom:82px;
}

header{
  height:74px;
  background:white;
  margin:0 12px 14px;
  padding:10px 14px;
  display:flex;
  align-items:center;
  gap:10px;
  box-shadow:0 2px 8px #00000008;
}

header>span{
  font-size:27px;
  background:#edf7e8;
  padding:8px;
  border-radius:13px;
}

header div{
  flex:1;
}

header b{
  display:block;
  font-size:16px;
}

header small{
  font-size:9px;
  color:#777;
}

.profileBtn{
  background:#edf7e8;
  border-radius:50%;
  padding:10px;
  font-size:18px;
}

main{
  padding:0 12px;
}

.welcome{
  background:linear-gradient(135deg,#e4f7dc,#f8fcf5);
  padding:20px;
  border-radius:20px;
  margin-bottom:10px;
}

.welcome small{
  color:#4b754c;
}

.welcome h2{
  font-size:21px;
  margin:8px 0 14px;
}

.weatherBox{
  background:white;
  border-radius:15px;
  padding:14px;
  width:100%;
  display:flex;
  align-items:center;
  text-align:left;
  gap:10px;
}

.weatherBox div{
  flex:1;
}

.weatherBox small{
  display:block;
  font-size:10px;
  margin-top:3px;
}

.savedCrop{
  background:#eaf7e4;
  border-radius:12px;
  padding:11px 13px;
  margin-bottom:10px;
  font-size:12px;
}

.savedCrop button{
  float:right;
  color:#2f7d32;
  font-weight:bold;
}

.grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:9px;
}

.card{
  background:white;
  border-radius:15px;
  padding:15px 11px;
  display:flex;
  align-items:center;
  text-align:left;
  min-height:70px;
  box-shadow:0 2px 7px #00000008;
}

.card>span{
  font-size:23px;
  margin-right:9px;
}

.card div{
  flex:1;
}

.card b{
  font-size:13px;
  display:block;
}

.card small{
  font-size:9px;
  color:#777;
}

.card i{
  font-style:normal;
  font-size:18px;
}

.tip{
  background:#fff4c9;
  padding:12px;
  margin-top:10px;
  border-radius:11px;
  font-size:10px;
  color:#665b2a;
}

.pageTitle{
  display:flex;
  align-items:center;
  gap:8px;
  margin:10px 0;
}

.pageTitle button{
  background:white;
  border-radius:12px;
  padding:9px 12px;
  font-size:18px;
}

.pageTitle h3{
  margin:0;
  font-size:17px;
}

.location,
.search{
  background:white;
  border-radius:11px;
  padding:13px;
  margin-bottom:9px;
  font-size:11px;
  color:#777;
}

.weatherMain{
  background:linear-gradient(135deg,#dff5d8,#fff);
  border-radius:18px;
  padding:22px;
  display:flex;
  gap:20px;
  align-items:center;
}

.weatherMain>div{
  font-size:52px;
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
  font-size:18px;
}

.info{
  background:white;
  border-radius:13px;
  padding:13px;
  margin-top:8px;
}

.info span{
  display:block;
}

.info small{
  display:block;
  color:#777;
}

.info b{
  font-size:13px;
}

.box,
.doctor,
.aiHead{
  background:white;
  border-radius:15px;
  padding:15px;
  margin-top:9px;
}

.box p{
  border-bottom:1px solid #eee;
  padding:9px 0;
  font-size:11px;
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
}

.doctor{
  text-align:center;
}

.bigIcon{
  font-size:45px;
}

.doctor p{
  font-size:10px;
  color:#777;
}

.upload{
  display:block;
  background:#e9f5e4;
  padding:13px;
  border-radius:10px;
  font-weight:bold;
}

.upload input{
  display:block;
  width:100%;
  margin-top:8px;
}

.market{
  display:flex;
  justify-content:space-between;
  padding:12px 0;
  border-bottom:1px solid #eee;
  font-size:12px;
}

.market small{
  display:block;
  color:#777;
  margin-top:3px;
}

.aiHead{
  text-align:center;
  background:linear-gradient(135deg,#e1f6dc,#fff);
}

.aiHead>div{
  font-size:38px;
}

.aiHead h2{
  margin:5px;
}

.aiHead p{
  font-size:10px;
  color:#777;
}

.chips{
  display:flex;
  gap:6px;
  overflow:auto;
  padding:8px 0;
}

.chips button{
  background:white;
  border-radius:14px;
  padding:9px;
  font-size:9px;
  white-space:nowrap;
}

.chat{
  background:white;
  border-radius:12px;
  padding:15px;
  font-size:11px;
  min-height:70px;
}

.inputRow{
  display:flex;
  background:white;
  border-radius:12px;
  margin-top:8px;
  padding:5px;
}

.inputRow input{
  border:0;
  outline:0;
  flex:1;
  padding:9px;
}

.inputRow button{
  background:${green};
  color:white;
  border-radius:9px;
  width:45px;
}

.fullInput{
  width:100%;
  border:1px solid #ddd;
  border-radius:10px;
  padding:12px;
  outline:none;
  margin:5px 0 8px;
}

.savedBox{
  background:white;
  border-radius:15px;
  padding:14px;
  margin-top:9px;
  display:flex;
  align-items:center;
  gap:12px;
}

.cropCircle{
  width:50px;
  height:50px;
  background:#eaf7e4;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:25px;
}

.savedBox small{
  color:#777;
}

.savedBox h3{
  margin:4px 0;
}

.profileCard{
  background:white;
  border-radius:18px;
  padding:20px;
  text-align:center;
}

.profileIcon{
  width:72px;
  height:72px;
  margin:auto;
  background:#e8f5e4;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:38px;
}

.profileCard h2{
  margin:12px 0 18px;
}

.profileCard input{
  width:100%;
  padding:13px;
  border:1px solid #ddd;
  border-radius:10px;
  margin-bottom:10px;
  outline:none;
}

.backText{
  color:#777;
  font-size:11px;
  padding:8px;
}

.schemeIntro{
  background:linear-gradient(135deg,#e5f8df,#fff);
  border-radius:15px;
  padding:14px;
  display:flex;
  gap:10px;
  align-items:center;
  margin-bottom:9px;
}

.schemeIntro:first-letter{
  font-size:25px;
}

.schemeIntro h3{
  margin:0 0 5px;
  font-size:14px;
}

.schemeIntro small{
  font-size:9px;
  color:#777;
}

.scheme{
  display:flex;
  align-items:flex-start;
  gap:11px;
  background:white;
  border-radius:13px;
  padding:13px;
  margin:7px 0;
  box-shadow:0 1px 5px #00000006;
}

.schemeIcon{
  width:39px;
  height:39px;
  background:#edf7e8;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:20px;
}

.scheme div{
  flex:1;
}

.scheme b{
  display:block;
  font-size:12px;
}

.scheme small{
  display:block;
  color:#777;
  font-size:9px;
  margin-top:3px;
}

.official{
  display:inline-block;
  background:#e8f6e3;
  color:#2f7d32;
  border-radius:7px;
  padding:5px 7px;
  margin-top:7px;
  font-size:8px;
  font-weight:bold;
}

.storeGrid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:9px;
}

.product{
  background:white;
  border-radius:14px;
  padding:9px;
}

.productIcon{
  height:78px;
  background:#edf7e8;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:40px;
}

.product b,
.product strong{
  display:block;
  font-size:11px;
  margin:6px 0;
}

.product button{
  width:100%;
  background:${green};
  color:white;
  border-radius:8px;
  padding:9px;
  font-size:10px;
}

.cartBox{
  background:white;
  border-radius:13px;
  padding:13px;
  margin-top:10px;
  font-size:11px;
}

.cartItems{
  margin-top:8px;
}

.cartItems div{
  border-top:1px solid #eee;
  padding:7px 0;
}

.floating{
  position:fixed;
  right:max(18px,calc((100vw - 620px)/2 + 18px));
  bottom:72px;
  background:${green};
  color:white;
  border-radius:25px;
  padding:13px 16px;
  box-shadow:0 3px 10px #0003;
  z-index:10;
}

nav{
  position:fixed;
  bottom:0;
  left:50%;
  transform:translateX(-50%);
  width:min(620px,100%);
  height:68px;
  background:white;
  display:grid;
  grid-template-columns:repeat(4,1fr);
  box-shadow:0 -2px 10px #00000010;
  z-index:20;
}

nav button{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  color:#777;
  font-size:19px;
}

nav button small{
  font-size:9px;
  margin-top:3px;
}

nav .active{
  color:${green};
}

@media(max-width:380px){
  .welcome h2{
    font-size:18px;
  }

  .card{
    padding:12px 8px;
  }

  .card b{
    font-size:11px;
  }
}
`;

const style = document.createElement("style");
style.innerHTML = css;
document.head.appendChild(style);

createRoot(
  document.getElementById("root")!
).render(<App />);
