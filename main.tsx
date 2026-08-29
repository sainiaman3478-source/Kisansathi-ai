import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home, Leaf, Camera, ShoppingCart, User, MessageCircle,
  CloudSun, IndianRupee, Landmark, ArrowLeft, Search,
  MapPin, Sprout, CalendarDays, Droplets, Send, RefreshCw
} from "lucide-react";
import "./style.css";

type Tab = "home" | "crops" | "doctor" | "store" | "profile" | "cart" | "chat" | "weather" | "mandi" | "scheme";
type Product = { id:number; name:string; price:number; emoji:string };

const products: Product[] = [
  {id:1,name:"नीम ऑयल",price:299,emoji:"🌿"},
  {id:2,name:"जैविक खाद",price:499,emoji:"🌱"},
  {id:3,name:"फसल सुरक्षा किट",price:699,emoji:"🧴"},
  {id:4,name:"बीज उपचार किट",price:399,emoji:"🌾"},
];

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const api = (path:string, init?:RequestInit) => fetch(`${API_BASE}${path}`, init);

function App(){
  const [tab,setTab]=useState<Tab>("home");
  const [cart,setCart]=useState<Record<number,number>>({});
  const addCart=(id:number)=>setCart(c=>({...c,[id]:(c[id]||0)+1}));
  const removeCart=(id:number)=>setCart(c=>{const x={...c}; if(x[id]>1)x[id]--; else delete x[id]; return x;});
  return <div className="app">
    <header className="topbar"><div className="brand"><div className="logo">🌾</div><div><b>KisanSaathi AI</b><small>आपका डिजिटल किसान साथी</small></div></div><button className="profileBtn" onClick={()=>setTab("profile")}><User size={20}/></button></header>
    <main className="content">
      {tab==="home"&&<HomePage setTab={setTab}/>}
      {tab==="weather"&&<WeatherPage setTab={setTab}/>}
      {tab==="mandi"&&<MandiPage setTab={setTab}/>}
      {tab==="chat"&&<ChatPage setTab={setTab}/>}
      {tab==="doctor"&&<DoctorPage setTab={setTab}/>}
      {tab==="crops"&&<CropsPage setTab={setTab}/>}
      {tab==="scheme"&&<SchemePage setTab={setTab}/>}
      {tab==="store"&&<StorePage setTab={setTab} addCart={addCart}/>}
      {tab==="cart"&&<CartPage setTab={setTab} cart={cart} addCart={addCart} removeCart={removeCart}/>}
      {tab==="profile"&&<ProfilePage setTab={setTab}/>}
    </main>
    <nav className="bottomNav">
      <Nav icon={<Home size={21}/>} text="Home" active={tab==="home"} onClick={()=>setTab("home")}/>
      <Nav icon={<Leaf size={21}/>} text="मेरी फसल" active={tab==="crops"} onClick={()=>setTab("crops")}/>
      <Nav icon={<Camera size={21}/>} text="Doctor" active={tab==="doctor"} onClick={()=>setTab("doctor")}/>
      <Nav icon={<ShoppingCart size={21}/>} text="Store" active={tab==="store"} onClick={()=>setTab("store")}/>
    </nav>
    <button className="aiButton" onClick={()=>setTab("chat")}><MessageCircle size={22}/><span>AI Kisan</span></button>
  </div>
}

function HomePage({setTab}:any){
 const cards=[
  [<Camera/>,"फसल जांच","फोटो से फसल की जांच","doctor"],[<MessageCircle/>,"AI Kisan","खेती की सलाह पूछें","chat"],
  [<CloudSun/>,"मौसम","अपने इलाके का Live मौसम","weather"],[<IndianRupee/>,"मंडी भाव","सरकारी मंडी भाव","mandi"],
  [<Sprout/>,"मेरी फसल","अपनी फसल जोड़ें","crops"],[<ShoppingCart/>,"Kisan Store","खेती का सामान","store"],[<Landmark/>,"सरकारी योजना","किसानों की योजनाएं","scheme"]
 ];
 return <><section className="hero"><p className="hello">नमस्ते किसान भाई 👋</p><h1>आज खेती में आपकी मदद के लिए तैयार हैं।</h1><button className="weatherMini" onClick={()=>setTab("weather")}><CloudSun size={30}/><div><b>🌦️ आज का Live मौसम</b><small>फोन की Location से मौसम देखें</small></div><span>›</span></button></section><div className="grid">{cards.map((c:any)=><button className="featureCard" key={c[1]} onClick={()=>setTab(c[3])}><div className="featureIcon">{c[0]}</div><div><b>{c[1]}</b><small>{c[2]}</small></div><span className="arrow">›</span></button>)}</div><section className="advice"><b>⚠️ किसान सलाह</b><p>दवा या सिंचाई का फैसला लेने से पहले मौसम और फसल की स्थिति जरूर जांचें।</p></section></>
}

function WeatherPage({setTab}:any){
 const [loading,setLoading]=useState(false),[error,setError]=useState(""),[weather,setWeather]=useState<any>(null),[location,setLocation]=useState("");
 const getWeather=()=>{setLoading(true);setError(""); if(!navigator.geolocation){setError("फोन में Location सुविधा उपलब्ध नहीं है।");setLoading(false);return;} navigator.geolocation.getCurrentPosition(async p=>{try{const lat=p.coords.latitude,lon=p.coords.longitude;const u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&forecast_days=4`;const r=await fetch(u);if(!r.ok)throw new Error();const d=await r.json();setWeather(d);setLocation(`${lat.toFixed(2)}, ${lon.toFixed(2)}`);}catch{setError("Live मौसम नहीं मिल पाया। फिर से कोशिश करें।");}finally{setLoading(false)}},()=>{setError("Location की अनुमति दें, तभी आपके इलाके का मौसम दिखेगा।");setLoading(false)},{enableHighAccuracy:true,timeout:10000,maximumAge:300000});};
 useEffect(()=>{getWeather()},[]);
 const text=(c:number)=>c===0?"साफ आसमान":c<=3?"बादल / आंशिक बादल":c<=48?"कोहरा":c<=57?"बूंदाबांदी":c<=67?"बारिश":c<=77?"बर्फ":c<=82?"तेज बारिश":"गरज के साथ बारिश";
 const emoji=(c:number)=>c===0?"☀️":c<=3?"🌤️":c<=48?"🌫️":c<=67?"🌧️":c<=77?"❄️":"⛈️";
 return <Page title="मौसम" setTab={setTab}>{loading&&!weather&&<div className="weatherStart"><div className="weatherStartIcon">⏳</div><h2>Live मौसम पता कर रहे हैं...</h2><p>फोन की Location से सही मौसम लिया जा रहा है।</p></div>}{error&&<div className="sectionCard errorBox"><b>⚠️ {error}</b><button className="primary" onClick={getWeather}>🔄 फिर कोशिश करें</button></div>}{weather&&<><div className="locationText"><MapPin size={17}/><span>📍 {location}</span><button onClick={getWeather}><RefreshCw size={17}/></button></div><div className="weatherBig"><div className="weatherEmoji">{emoji(weather.current.weather_code)}</div><div><span>अभी का Live Weather</span><strong>{Math.round(weather.current.temperature_2m)}°C</strong><b>{text(weather.current.weather_code)}</b></div></div><div className="infoGrid"><Info icon={<Droplets/>} title="नमी" value={`${weather.current.relative_humidity_2m}%`}/><Info icon={<CloudSun/>} title="बारिश" value={`${weather.current.precipitation} mm`}/><Info icon={<Sprout/>} title="हवा" value={`${Math.round(weather.current.wind_speed_10m)} km/h`}/><Info icon={<span style={{fontSize:20}}>🌡️</span>} title="तापमान" value={`${Math.round(weather.current.temperature_2m)}°C`}/></div><div className="sectionCard"><h3>📅 अगले 4 दिन का मौसम</h3>{weather.daily.time.map((d:string,i:number)=><div className="forecastRow" key={d}><div><b>{i===0?"आज":i===1?"कल":i===2?"परसों":"दिन 4"}</b><small>{emoji(weather.daily.weather_code[i])} बारिश {weather.daily.precipitation_probability_max[i]??0}%</small></div><strong>{Math.round(weather.daily.temperature_2m_min[i])}°C - {Math.round(weather.daily.temperature_2m_max[i])}°C</strong></div>)}</div><div className="sectionCard"><h3>🌾 किसान के लिए सलाह</h3><p>मौसम बदल सकता है। सिंचाई या दवा का निर्णय लेने से पहले बारिश की संभावना और फसल की स्थिति जरूर देखें।</p></div></>}</Page>
}

function MandiPage({setTab}:any){
 const [search,setSearch]=useState(""),[data,setData]=useState<any[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const load=async()=>{setLoading(true);setError("");try{const r=await api(`/api/mandi?crop=${encodeURIComponent(search.trim())}`);const d=await r.json();if(!r.ok)throw new Error(d.error||"Mandi API error");setData(d.data||[]);}catch(e:any){setData([]);setError(e?.message||"Live मंडी भाव नहीं मिल पाया।")}finally{setLoading(false)}};
 return <Page title="मंडी भाव" setTab={setTab}><div className="searchBox"><Search size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="गेहूं, धान, सरसों..." onKeyDown={e=>e.key==="Enter"&&load()}/></div><button className="primary" onClick={load} disabled={loading}>{loading?"भाव खोज रहे हैं...":"📊 Live सरकारी मंडी भाव देखें"}</button>{error&&<div className="sectionCard errorBox"><b>⚠️ {error}</b><p>Backend में DATA_GOV_API_KEY लगा होना जरूरी है।</p></div>} {!error&&data.length===0&&!loading&&<div className="sectionCard"><p>फसल का नाम लिखकर सरकारी मंडी के आज के उपलब्ध भाव खोजें।</p></div>}<div className="mandiList">{data.map((x:any,i:number)=><div className="mandiRow" key={`${x.market}-${x.commodity}-${i}`}><div><b>🌾 {x.commodity}</b><small>{x.market} • {x.district}, {x.state}</small><small>📅 {x.arrival_date||"तारीख उपलब्ध नहीं"}</small></div><div><strong>₹{x.modal_price}</strong><small>₹{x.min_price} - ₹{x.max_price}</small></div></div>)}</div><p className="note">स्रोत: भारत सरकार data.gov.in / AGMARKNET. यह दैनिक मंडी डेटा है, हर सेकंड बदलने वाला quote नहीं।</p></Page>
}

function ChatPage({setTab}:any){
 const [message,setMessage]=useState(""),[typing,setTyping]=useState(false);const [messages,setMessages]=useState<any[]>([{type:"ai",text:"नमस्ते किसान भाई! 🌾\nमैं KisanSaathi AI हूँ। फसल, मौसम, मंडी या खेती से जुड़ा सवाल पूछिए।"}]);
 const send=async(text?:string)=>{const q=(text??message).trim();if(!q||typing)return;setMessages(m=>[...m,{type:"user",text:q}]);setMessage("");setTyping(true);try{const r=await api("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q})});const d=await r.json();if(!r.ok)throw new Error(d.error||"AI service error");setMessages(m=>[...m,{type:"ai",text:d.reply||"AI से जवाब नहीं मिला।"}]);}catch(e:any){setMessages(m=>[...m,{type:"ai",text:`⚠️ AI connect नहीं हो पाया।\n${e?.message||"Backend/API configuration जांचें।"}`}]);}finally{setTyping(false)}};
 return <Page title="AI Kisan" setTab={setTab}><div className="chatIntro"><div style={{fontSize:42}}>🤖</div><h2>AI Kisan</h2><p>खेती, फसल, मौसम और मंडी से जुड़े सवाल पूछें।</p></div><div className="quickQuestions"><button onClick={()=>send("गेहूं में कौन सी खाद डालें?")}>गेहूं में खाद की सलाह</button><button onClick={()=>send("मेरी फसल में पत्तियां पीली हो रही हैं, क्या कारण हो सकता है?")}>पत्तियां पीली हो रही हैं</button><button onClick={()=>send("धान की खेती के लिए सलाह दें")}>धान की खेती</button></div><div className="chatMessages">{messages.map((m,i)=><div key={i} className={`message ${m.type==="user"?"userMessage":"aiMessage"}`}><div className="messageIcon">{m.type==="user"?"👨‍🌾":"🤖"}</div><div className="messageText">{m.text.split("\n").map((line:string,j:number)=><div key={j}>{line||<br/>}</div>)}</div></div>)}{typing&&<div className="message aiMessage"><div className="messageIcon">🤖</div><div className="messageText">सोच रहा हूँ... ⏳</div></div>}</div><div className="chatInput"><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="अपना सवाल लिखें..." onKeyDown={e=>e.key==="Enter"&&send()}/><button onClick={()=>send()} disabled={typing}><Send size={19}/></button></div><div className="note">💡 AI सलाह उपयोगी मार्गदर्शन है। दवा/कीटनाशक इस्तेमाल से पहले लेबल और स्थानीय कृषि विशेषज्ञ की सलाह जरूर जांचें।</div></Page>
}

function DoctorPage({setTab}:any){const [file,setFile]=useState<File|null>(null);return <Page title="Crop Doctor" setTab={setTab}><div className="doctorBox"><div className="doctorIcon">📷</div><h2>अपनी फसल की जांच करें</h2><p>फोटो चुनें। अभी यह UI फोटो लेने के लिए तैयार है; असली image-AI diagnosis backend में अगला चरण है।</p><label className="uploadBtn">📷 फोटो चुनें<input type="file" accept="image/*" hidden onChange={e=>setFile(e.target.files?.[0]||null)}/></label>{file&&<div className="result">✅ {file.name} चुनी गई है।</div>}</div></Page>}
function CropsPage({setTab}:any){const [crop,setCrop]=useState(""),[saved,setSaved]=useState(false);return <Page title="मेरी फसल" setTab={setTab}><div className="sectionCard"><h3>🌱 अपनी फसल जोड़ें</h3><input className="input" value={crop} onChange={e=>{setCrop(e.target.value);setSaved(false)}} placeholder="गेहूं, धान, कपास..."/><button className="primary" onClick={()=>crop.trim()&&setSaved(true)}>💾 फसल सेव करें</button>{saved&&<div className="savedCrop">🌾 <b>{crop}</b><span>आपकी फसल सेव हो गई</span></div>}</div></Page>}
function SchemePage({setTab}:any){const s=[["🌾","PM-KISAN","किसानों के लिए आर्थिक सहायता","https://pmkisan.gov.in/"],["🛡️","प्रधानमंत्री फसल बीमा योजना","फसल नुकसान से सुरक्षा","https://pmfby.gov.in/"],["🧪","Soil Health Card","मिट्टी की जांच","https://soilhealth.dac.gov.in/"],["📈","e-NAM","ऑनलाइन कृषि मंडी","https://www.enam.gov.in/"]];return <Page title="सरकारी योजना" setTab={setTab}>{s.map(x=><div className="schemeCard" key={x[1]}><div className="schemeEmoji">{x[0]}</div><div><b>{x[1]}</b><p>{x[2]}</p><a href={x[3]} target="_blank" rel="noreferrer">Official Website ↗</a></div></div>)}</Page>}
function StorePage({setTab,addCart}:any){return <Page title="Kisan Store" setTab={setTab}><div className="productGrid">{products.map(p=><div className="product" key={p.id}><div className="productEmoji">{p.emoji}</div><b>{p.name}</b><strong>₹{p.price}</strong><button onClick={()=>addCart(p.id)}>कार्ट में डालें</button></div>)}</div><button className="primary" onClick={()=>setTab("cart")}>🛒 कार्ट देखें</button></Page>}
function CartPage({setTab,cart,addCart,removeCart}:any){const items=products.filter(p=>cart[p.id]);const total=items.reduce((s,p)=>s+p.price*cart[p.id],0);return <Page title="कार्ट" setTab={setTab}>{!items.length?<div className="empty"><div className="emptyIcon">🛒</div><h3>कार्ट खाली है</h3><button className="primary" onClick={()=>setTab("store")}>Store देखें</button></div>:<>{items.map(p=><div className="cartRow" key={p.id}><span className="cartEmoji">{p.emoji}</span><div><b>{p.name}</b><small>₹{p.price} × {cart[p.id]}</small></div><button onClick={()=>removeCart(p.id)}>−</button><b>{cart[p.id]}</b><button onClick={()=>addCart(p.id)}>+</button></div>)}<div className="total"><span>कुल राशि</span><strong>₹{total}</strong></div><button className="primary" onClick={()=>alert(`Demo order: ₹${total}`)}>ऑर्डर करें</button></>}</Page>}
function ProfilePage({setTab}:any){return <Page title="प्रोफाइल" setTab={setTab}><div className="profileHero"><div className="avatar"><User size={42}/></div><h2>किसान भाई</h2><p>KisanSaathi उपयोगकर्ता</p></div></Page>}
function Page({title,setTab,children}:any){return <><div className="pageHead"><button onClick={()=>setTab("home")}><ArrowLeft size={20}/></button><h2>{title}</h2></div>{children}</>}
function Info({icon,title,value}:any){return <div className="infoCard">{icon}<small>{title}</small><b>{value}</b></div>}
function Nav({icon,text,active,onClick}:any){return <button className={active?"active":""} onClick={onClick}>{icon}<span>{text}</span></button>}

const root=document.getElementById("root");if(root)createRoot(root).render(<App/>);
