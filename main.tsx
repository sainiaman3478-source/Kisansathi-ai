import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home, Leaf, Camera, MessageCircle, CloudSun, ShoppingCart,
  Landmark, IndianRupee, Sprout, ArrowLeft, User, Stethoscope,
  Sun, Cloud
} from "lucide-react";

type Tab = "home" | "mandi" | "weather" | "crops" | "doctor" | "store" | "profile" | "cart" | "chat";

type Product = { id: number; name: string; price: number; unit: string };
type Mandi = { crop: string; mandi: string; price: number; unit: string };

const mandiData: Mandi[] = [
  { crop: "गेहूं", mandi: "दिल्ली मंडी", price: 2450, unit: "क्विंटल" },
  { crop: "गेहूं", mandi: "जयपुर मंडी", price: 2380, unit: "क्विंटल" },
  { crop: "सरसों", mandi: "भरतपुर मंडी", price: 5650, unit: "क्विंटल" },
  { crop: "सरसों", mandi: "अलवर मंडी", price: 5580, unit: "क्विंटल" },
  { crop: "चना", mandi: "जयपुर मंडी", price: 6200, unit: "क्विंटल" },
  { crop: "बाजरा", mandi: "हरियाणा मंडी", price: 2350, unit: "क्विंटल" },
  { crop: "मक्का", mandi: "इंदौर मंडी", price: 2250, unit: "क्विंटल" },
  { crop: "सोयाबीन", mandi: "इंदौर मंडी", price: 4650, unit: "क्विंटल" },
  { crop: "कपास", mandi: "अकोला मंडी", price: 7200, unit: "क्विंटल" }
];

const products: Product[] = [
  { id: 1, name: "नीम खली", price: 450, unit: "25 kg" },
  { id: 2, name: "जैविक खाद", price: 350, unit: "25 kg" },
  { id: 3, name: "सरसों बीज", price: 180, unit: "1 kg" },
  { id: 4, name: "गेहूं बीज", price: 65, unit: "1 kg" }
];

const css = `
*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;font-family:Arial,sans-serif;background:#f4f7f1;color:#263126}
button,input{font-family:inherit}button{-webkit-tap-highlight-color:transparent}
.app{min-height:100vh;max-width:700px;margin:auto;background:#f4f7f1;padding-bottom:85px}
header{background:#fff;padding:15px 18px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 8px rgba(0,0,0,.08);position:sticky;top:0;z-index:10}
.brand{font-size:19px;font-weight:700;color:#28752e}header small,.pageTitle small{color:#777}
.profileIcon,.bigProfile{background:#e8f5e9;display:flex;align-items:center;justify-content:center;color:#28752e}
.profileIcon{width:42px;height:42px;border-radius:50%}
main{padding:14px}.hero{background:linear-gradient(135deg,#e7f8df,#f7fff4);border-radius:20px;padding:20px;margin-bottom:14px}
.hero h1{margin:0 0 7px;font-size:23px}.hero p{margin:0 0 15px;color:#596359}
.weatherButton{background:#fff;border-radius:15px;padding:14px;display:flex;align-items:center;gap:12px;width:100%;border:0;text-align:left;cursor:pointer;box-shadow:0 2px 7px rgba(0,0,0,.05)}
.weatherButton strong{font-size:20px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.card{border:0;background:#fff;border-radius:17px;padding:16px 13px;min-height:88px;box-shadow:0 2px 8px rgba(0,0,0,.07);display:flex;align-items:center;gap:9px;text-align:left;cursor:pointer}
.card:active{transform:scale(.98)}.cardIcon{font-size:25px;width:34px;min-width:34px;text-align:center}
.cardTitle{font-weight:700;font-size:14px}.cardSub{font-size:12px;color:#777;margin-top:4px}
.advice,.section,.chatBox{background:#fff;border-radius:17px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.advice{margin-top:12px;line-height:1.6}.section,.chatBox{margin-bottom:12px}.section h3{margin-top:0}
.pageTitle{display:flex;align-items:center;gap:10px;margin-bottom:15px}.pageTitle h2{margin:0}
.back{border:0;background:#fff;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 1px 5px rgba(0,0,0,.06)}
.mandiCard{background:#fff;border-radius:16px;padding:15px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.06);display:flex;justify-content:space-between;align-items:center;gap:10px}
.mandiCrop{font-size:17px;font-weight:700}.mandiName{font-size:12px;color:#777;margin-top:5px}.mandiPrice{font-size:18px;font-weight:700;color:#28752e;text-align:right}
.product,.cartRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 0;border-bottom:1px solid #eee}
.product:last-child{border-bottom:0}.productName{font-weight:700}.productUnit{font-size:12px;color:#777;margin-top:4px}
.addBtn,.sendBtn{background:#2e7d32;color:#fff;border:0;border-radius:10px;padding:9px 13px;cursor:pointer}.sendBtn{border-radius:12px;padding:0 17px}
.weatherBig{background:linear-gradient(135deg,#e8f7ff,#fff);border-radius:20px;padding:28px 20px;text-align:center;margin-bottom:12px}
.temperature{font-size:52px;font-weight:700;margin:10px 0;color:#28752e}.weatherInfoGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.weatherInfo,.forecastCard{background:#f7faf6;border-radius:14px;padding:14px;text-align:center}.forecast{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.forecastCard{border-radius:15px;padding:14px 7px}.forecastIcon{font-size:28px;margin:8px}
.chatBox{min-height:350px}.message{padding:10px 12px;background:#edf7ea;border-radius:12px;margin-bottom:8px;font-size:14px;line-height:1.5}
.inputRow{display:flex;gap:8px;margin-top:12px}.inputRow input{flex:1;border:1px solid #ddd;border-radius:12px;padding:13px;font-size:15px;min-width:0;outline:none}
.inputRow input:focus{border-color:#2e7d32}.cartTotal{font-size:20px;font-weight:700;color:#28752e;margin-top:15px}
.quantity{display:flex;align-items:center;gap:8px}.quantity button{width:30px;height:30px;border:0;border-radius:8px;background:#e8f5e9;color:#28752e;font-size:18px}
.empty{text-align:center;padding:45px 15px;color:#777}.profileCard{text-align:center}.bigProfile{width:75px;height:75px;margin:auto;border-radius:50%}
.scheme{padding:14px 0;border-bottom:1px solid #eee}.scheme:last-child{border-bottom:0}
.bottomNav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:min(700px,100%);background:#fff;display:grid;grid-template-columns:repeat(4,1fr);padding:8px 4px;box-shadow:0 -2px 12px rgba(0,0,0,.1);z-index:20}
.navBtn{border:0;background:transparent;color:#777;font-size:11px;padding:5px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px}.navBtn.active{color:#28752e;font-weight:700}
.fab{position:fixed;right:20px;bottom:75px;width:55px;height:55px;border-radius:50%;border:0;background:#2e7d32;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.25);cursor:pointer;z-index:15;display:flex;align-items:center;justify-content:center}
@media(max-width:420px){.grid{gap:8px}.card{padding:13px 9px}.cardTitle{font-size:13px}.temperature{font-size:45px}}
`;

function App(){
  const [tab,setTab]=useState<Tab>("home");
  const [name]=useState("किसान भाई");
  const [cart,setCart]=useState<Record<number,number>>({});
  const [chat,setChat]=useState<string[]>([]);
  const [q,setQ]=useState("");

  const cartCount=Object.values(cart).reduce((a,b)=>a+b,0);
  const total=Object.entries(cart).reduce((sum,[id,qty])=>{
    const p=products.find(x=>x.id===Number(id));
    return sum+(p?p.price*qty:0);
  },0);

  const addToCart=(id:number)=>setCart(c=>({...c,[id]:(c[id]||0)+1}));
  const removeFromCart=(id:number)=>setCart(c=>{
    const copy={...c};
    if(!copy[id]) return copy;
    copy[id]--;
    if(copy[id]<=0) delete copy[id];
    return copy;
  });

  const askAI=()=>{
    const question=q.trim();
    if(!question)return;
    setChat(c=>[...c,"आप: "+question,"AI किसान: आपकी फसल की समस्या के लिए मौसम, मिट्टी और फसल की स्थिति को ध्यान में रखना जरूरी है। साफ फोटो और फसल की जानकारी देने पर बेहतर सलाह मिल सकती है।"]);
    setQ("");
  };

  return <div className="app">
    <style>{css}</style>
    <header>
      <div><div className="brand">🌾 KisanSaathi AI</div><small>Aapka Digital Kisan Dost</small></div>
      <div className="profileIcon"><User size={22}/></div>
    </header>

    <main>
      {tab==="home"&&<HomePage setTab={setTab} name={name}/>}
      {tab==="mandi"&&<MandiPage setTab={setTab}/>}
      {tab==="weather"&&<WeatherPage setTab={setTab}/>}
      {tab==="crops"&&<CropsPage setTab={setTab}/>}
      {tab==="doctor"&&<DoctorPage setTab={setTab}/>}
      {tab==="store"&&<StorePage setTab={setTab} products={products} addToCart={addToCart} cart={cart}/>}
      {tab==="cart"&&<CartPage setTab={setTab} products={products} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} total={total}/>}
      {tab==="chat"&&<ChatPage setTab={setTab} chat={chat} q={q} setQ={setQ} askAI={askAI}/>}
      {tab==="profile"&&<ProfilePage setTab={setTab} name={name}/>}
    </main>
          {tab==="profile"&&<ProfilePage setTab={setTab} name={name}/>}
    </main>

    <button className="fab" onClick={()=>setTab("chat")}>
      <MessageCircle size={25}/>
    </button>

    <nav className="bottomNav">
      <NavButton icon={<Home size={20}/>} text="होम" active={tab==="home"} onClick={()=>setTab("home")}/>
      <NavButton icon={<Landmark size={20}/>} text="मंडी" active={tab==="mandi"} onClick={()=>setTab("mandi")}/>
      <NavButton icon={<CloudSun size={20}/>} text="मौसम" active={tab==="weather"} onClick={()=>setTab("weather")}/>
      <NavButton icon={<User size={20}/>} text="प्रोफाइल" active={tab==="profile"} onClick={()=>setTab("profile")}/>
    </nav>
  </div>;
}

function NavButton({icon,text,active,onClick}:{icon:React.ReactNode;text:string;active:boolean;onClick:()=>void}){
  return <button className={"navBtn "+(active?"active":"")} onClick={onClick}>
    {icon}<span>{text}</span>
  </button>;
}

function PageTitle({title,setTab}:{title:string;setTab:(tab:Tab)=>void}){
  return <div className="pageTitle">
    <button className="back" onClick={()=>setTab("home")}><ArrowLeft size={21}/></button>
    <h2>{title}</h2>
  </div>;
}

function HomePage({setTab,name}:{setTab:(tab:Tab)=>void;name:string}){
  return <>
    <div className="hero">
      <h1>नमस्ते, {name}! 🌾</h1>
      <p>खेती से जुड़ी हर जानकारी अब आपके हाथ में।</p>
      <button className="weatherButton" onClick={()=>setTab("weather")}>
        <CloudSun size={35}/>
        <div><strong>28°C</strong><br/><small>आज का मौसम देखें →</small></div>
      </button>
    </div>

    <div className="grid">
      <button className="card" onClick={()=>setTab("mandi")}>
        <div className="cardIcon">💰</div>
        <div><div className="cardTitle">मंडी भाव</div><div className="cardSub">आज के ताजा भाव</div></div>
      </button>

      <button className="card" onClick={()=>setTab("weather")}>
        <div className="cardIcon">☀️</div>
        <div><div className="cardTitle">मौसम</div><div className="cardSub">आज और कल का मौसम</div></div>
      </button>

      <button className="card" onClick={()=>setTab("crops")}>
        <div className="cardIcon">🌱</div>
        <div><div className="cardTitle">फसल सलाह</div><div className="cardSub">फसल की जानकारी</div></div>
      </button>

      <button className="card" onClick={()=>setTab("doctor")}>
        <div className="cardIcon">🩺</div>
        <div><div className="cardTitle">फसल डॉक्टर</div><div className="cardSub">फसल की समस्या पूछें</div></div>
      </button>

      <button className="card" onClick={()=>setTab("store")}>
        <div className="cardIcon">🛒</div>
        <div><div className="cardTitle">किसान स्टोर</div><div className="cardSub">बीज और खाद</div></div>
      </button>

      <button className="card" onClick={()=>setTab("chat")}>
        <div className="cardIcon">🤖</div>
        <div><div className="cardTitle">AI सहायक</div><div className="cardSub">किसान सवाल पूछें</div></div>
      </button>
    </div>

    <div className="advice">
      <strong>🌿 आज की किसान सलाह</strong>
      <p>सुबह या शाम के समय खेत का निरीक्षण करें। पत्तियों पर कीड़े या बीमारी के निशान दिखाई दें तो उनकी फोटो लेकर विशेषज्ञ से सलाह लें।</p>
    </div>
  </>;
}

function MandiPage({setTab}:{setTab:(tab:Tab)=>void}){
  return <>
    <PageTitle title="आज का मंडी भाव" setTab={setTab}/>
    <div className="section">
      <h3>📊 फसलों के ताजा भाव</h3>
      {mandiData.map((m,i)=>
        <div className="mandiCard" key={i}>
          <div>
            <div className="mandiCrop">{m.crop}</div>
            <div className="mandiName">{m.mandi}</div>
          </div>
          <div className="mandiPrice">₹{m.price.toLocaleString("en-IN")}<br/><small>/{m.unit}</small></div>
        </div>
      )}
    </div>
  </>;
}

function WeatherPage({setTab}:{setTab:(tab:Tab)=>void}){
  return <>
    <PageTitle title="मौसम" setTab={setTab}/>
    <div className="weatherBig">
      <CloudSun size={55}/>
      <div className="temperature">28°C</div>
      <strong>आंशिक बादल</strong>
      <p>कृषि कार्य के लिए मौसम सामान्य है।</p>
    </div>

    <div className="weatherInfoGrid">
      <div className="weatherInfo"><strong>💧 62%</strong><br/><small>नमी</small></div>
      <div className="weatherInfo"><strong>💨 12 km/h</strong><br/><small>हवा</small></div>
      <div className="weatherInfo"><strong>☀️ 6:02 AM</strong><br/><small>सूर्योदय</small></div>
      <div className="weatherInfo"><strong>🌙 6:48 PM</strong><br/><small>सूर्यास्त</small></div>
    </div>

    <div className="section">
      <h3>अगले 3 दिन</h3>
      <div className="forecast">
        <div className="forecastCard"><strong>आज</strong><div className="forecastIcon">⛅</div><b>28°</b><br/><small>20°</small></div>
        <div className="forecastCard"><strong>कल</strong><div className="forecastIcon">☀️</div><b>30°</b><br/><small>21°</small></div>
        <div className="forecastCard"><strong>परसों</strong><div className="forecastIcon">🌧️</div><b>27°</b><br/><small>20°</small></div>
      </div>
    </div>

    <div className="advice">🌧️ <strong>किसान सलाह:</strong> बारिश की संभावना होने पर फसल में अनावश्यक सिंचाई न करें।</div>
  </>;
}

function CropsPage({setTab}:{setTab:(tab:Tab)=>void}){
  return <>
    <PageTitle title="फसल सलाह" setTab={setTab}/>
    <div className="section">
      <h3>🌱 प्रमुख फसलें</h3>
      <div className="scheme"><b>🌾 गेहूं</b><p>समय पर सिंचाई करें और खरपतवार नियंत्रण रखें।</p></div>
      <div className="scheme"><b>🌻 सरसों</b><p>फूल आने की अवस्था में खेत की निगरानी करें।</p></div>
      <div className="scheme"><b>🌽 मक्का</b><p>मिट्टी में पर्याप्त नमी बनाए रखें।</p></div>
      <div className="scheme"><b>🫘 चना</b><p>पत्तियों पर कीट या रोग के लक्षण दिखाई दें तो तुरंत जांच करें।</p></div>
    </div>

    <div className="advice">
      <strong>💡 जरूरी बात</strong>
      <p>किसी भी दवा का उपयोग करने से पहले उसकी सही मात्रा और फसल के अनुसार उपयोग की जानकारी जरूर लें।</p>
    </div>
  </>;

  function DoctorPage({setTab}:{setTab:(tab:Tab)=>void}){
  const [photo,setPhoto]=useState<string | null>(null);

  return <>
    <PageTitle title="फसल डॉक्टर" setTab={setTab}/>

    <div className="section">
      <h3>🩺 फसल की समस्या बताएं</h3>

      <div className="doctorBox">
        <div className="doctorIcon">🌿</div>
        <h3>फसल में क्या समस्या है?</h3>
        <p>पत्तियों, तने या फल में दिखाई देने वाली समस्या की फोटो लेकर जांच करें।</p>

        <label className="uploadBtn">
          📷 फोटो चुनें
          <input
            type="file"
            accept="image/*"
            onChange={(e)=>{
              const file=e.target.files?.[0];
              if(file) setPhoto(URL.createObjectURL(file));
            }}
            style={{display:"none"}}
          />
        </label>

        {photo && (
          <div className="preview">
            <img src={photo} alt="फसल की फोटो"/>
            <p>फोटो चुन ली गई है ✅</p>
          </div>
        )}
      </div>

      <div className="scheme">
        <b>🌱 सामान्य सलाह</b>
        <p>फसल में बीमारी या कीट दिखाई देने पर पहले उसकी सही पहचान करें।</p>
      </div>

      <div className="scheme">
        <b>💧 पानी की समस्या</b>
        <p>मिट्टी की नमी देखकर ही सिंचाई करें और खेत में पानी जमा न होने दें।</p>
      </div>

      <div className="scheme">
        <b>🐛 कीट की समस्या</b>
        <p>पत्तियों के नीचे और नई कोपलों पर कीटों की जांच करें।</p>
      </div>
    </div>
  </>;
}


function StorePage({setTab}:{setTab:(tab:Tab)=>void}){
  return <>
    <PageTitle title="किसान स्टोर" setTab={setTab}/>

    <div className="section">
      <h3>🛒 खेती का सामान</h3>

      <div className="productCard">
        <div className="productIcon">🌾</div>
        <div className="productInfo">
          <b>गेहूं बीज</b>
          <small>उन्नत किस्म का बीज</small>
          <strong>₹850 / पैकेट</strong>
        </div>
        <button onClick={()=>setTab("cart")}>कार्ट</button>
      </div>

      <div className="productCard">
        <div className="productIcon">🌻</div>
        <div className="productInfo">
          <b>सरसों बीज</b>
          <small>अच्छी उपज के लिए</small>
          <strong>₹620 / पैकेट</strong>
        </div>
        <button onClick={()=>setTab("cart")}>कार्ट</button>
      </div>

      <div className="productCard">
        <div className="productIcon">🧪</div>
        <div className="productInfo">
          <b>जैविक खाद</b>
          <small>मिट्टी की गुणवत्ता के लिए</small>
          <strong>₹450 / बैग</strong>
        </div>
        <button onClick={()=>setTab("cart")}>कार्ट</button>
      </div>

      <div className="productCard">
        <div className="productIcon">💧</div>
        <div className="productInfo">
          <b>स्प्रे पंप</b>
          <small>फसल में छिड़काव के लिए</small>
          <strong>₹1,250</strong>
        </div>
        <button onClick={()=>setTab("cart")}>कार्ट</button>
      </div>
    </div>
  </>;
}


function CartPage({setTab}:{setTab:(tab:Tab)=>void}){
  return <>
    <PageTitle title="मेरा कार्ट" setTab={setTab}/>

    <div className="section">
      <div className="cartEmpty">
        <ShoppingCart size={55}/>
        <h3>आपका कार्ट खाली है</h3>
        <p>किसान स्टोर से सामान चुनकर यहां जोड़ें।</p>
        <button onClick={()=>setTab("store")}>स्टोर देखें</button>
      </div>
    </div>
  </>;
}


function ChatPage({setTab}:{setTab:(tab:Tab)=>void}){
  const [message,setMessage]=useState("");
  const [messages,setMessages]=useState<string[]>([
    "नमस्ते किसान भाई! 🌾",
    "मैं किसान साथी AI हूं। आप खेती, फसल, मौसम या मंडी से जुड़ा सवाल पूछ सकते हैं।"
  ]);

  const sendMessage=()=>{
    if(!message.trim()) return;

    setMessages(prev=>[
      ...prev,
      "आप: "+message,
      "AI: आपका सवाल मिल गया। सही सलाह के लिए अपनी फसल और समस्या की जानकारी बताएं। 🌱"
    ]);

    setMessage("");
  };

  return <>
    <PageTitle title="AI किसान सहायक" setTab={setTab}/>

    <div className="chatBox">
      <div className="messages">
        {messages.map((m,i)=>(
          <div className={"message "+(m.startsWith("आप:")?"userMessage":"aiMessage")} key={i}>
            {m}
          </div>
        ))}
      </div>

      <div className="chatInput">
        <input
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
          placeholder="अपना सवाल लिखें..."
          onKeyDown={(e)=>{
            if(e.key==="Enter") sendMessage();
          }}
        />
        <button onClick={sendMessage}>➤</button>
      </div>
    </div>
  </>;
}


function ProfilePage({
  setTab,
  name
}:{
  setTab:(tab:Tab)=>void;
  name:string
}){
  return <>
    <PageTitle title="प्रोफाइल" setTab={setTab}/>

    <div className="profileCard">
      <div className="profileAvatar">
        <User size={45}/>
      </div>

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
    

}
