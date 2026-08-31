import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import{Home,Leaf,Camera,MessageCircle,CloudSun,ShoppingCart,IndianRupee,Sprout,ArrowLeft,User,Stethoscope,RefreshCw,Send,Plus,Minus,ExternalLink,MapPin,X}from"lucide-react";

type Tab="home"|"mandi"|"weather"|"crops"|"doctor"|"store"|"profile"|"cart"|"chat";
type Product={id:number;name:string;price:number;unit:string;emoji:string};
type Crop={id:number;name:string;area:string;note:string};
type ChatMsg={from:"user"|"ai";text:string};

const products:Product[]=[
{id:1,name:"नीम ऑयल",price:299,unit:"1 लीटर",emoji:"🌿"},
{id:2,name:"जैविक खाद",price:499,unit:"25 kg",emoji:"🌱"},
{id:3,name:"फसल सुरक्षा किट",price:699,unit:"1 किट",emoji:"🧴"},
{id:4,name:"बीज उपचार किट",price:399,unit:"1 किट",emoji:"🌾"}
];

const schemes=[
{icon:"🌾",title:"PM-KISAN",text:"किसानों के लिए आर्थिक सहायता",url:"https://pmkisan.gov.in/"},
{icon:"💧",title:"प्रधानमंत्री कृषि सिंचाई योजना",text:"सिंचाई सुविधा से जुड़ी जानकारी",url:"https://pmksy.gov.in/"},
{icon:"🌱",title:"प्रधानमंत्री फसल बीमा योजना",text:"फसल नुकसान से सुरक्षा",url:"https://pmfby.gov.in/"}
];

const css=`
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;font-family:Arial,"Noto Sans Devanagari",sans-serif;background:#f3f7f1;color:#243024}
button,input{font:inherit}
button{cursor:pointer}
.app{min-height:100vh;max-width:700px;margin:auto;background:#f3f7f1;padding-bottom:86px}
header{position:sticky;top:0;z-index:30;background:#fff;padding:11px 14px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 8px #0001}
.brand{display:flex;align-items:center;gap:9px;color:#287b31;font-weight:800;font-size:17px}
.logo{width:38px;height:38px;border-radius:12px;background:#e8f6e5;display:grid;place-items:center;font-size:22px}
header small{display:block;color:#777;font-size:10px;margin-top:2px}
.profileIcon{width:38px;height:38px;border:0;border-radius:50%;background:#e8f5e9;color:#28752e;display:grid;place-items:center}
main{padding:12px}
.hero{background:linear-gradient(135deg,#e3f7dc,#fff);border-radius:20px;padding:18px;margin-bottom:12px;border:1px solid #e2efdf}
.hero h1{font-size:21px;margin:0 0 6px}
.hero p{margin:0 0 12px;color:#667;font-size:13px}
.weatherButton{width:100%;border:0;background:#fff;border-radius:15px;padding:13px;display:flex;align-items:center;gap:10px;text-align:left;box-shadow:0 2px 8px #0001}
.weatherButton span{font-size:11px;color:#777}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.card{border:0;background:#fff;border-radius:16px;padding:14px 10px;min-height:84px;display:flex;align-items:center;gap:8px;text-align:left;box-shadow:0 2px 8px #0001}
.cardIcon{font-size:23px;width:30px;text-align:center}
.cardTitle{font-weight:800;font-size:13px}
.cardSub,.muted{color:#777;font-size:10px;margin-top:4px}
.advice,.section,.chatBox{background:#fff;border-radius:16px;padding:14px;box-shadow:0 2px 8px #0001}
.advice{margin-top:11px;background:#fff8df;font-size:12px;line-height:1.6}
.section{margin-bottom:11px}
.pageTitle{display:flex;align-items:center;gap:9px;margin:2px 0 12px}
.pageTitle h2{margin:0;font-size:18px}
.pageTitle small{color:#777;font-size:11px}
.back{border:0;background:#fff;border-radius:50%;width:38px;height:38px;display:grid;place-items:center;box-shadow:0 1px 5px #0001}
.primary,.addBtn,.sendBtn{background:#2e7d32;color:#fff;border:0;border-radius:10px;padding:10px 13px;font-weight:700}
.primary{width:100%}
.addBtn{font-size:12px}
.search{width:100%;border:1px solid #ddd;border-radius:11px;padding:11px;outline:none;margin-bottom:10px}
.search:focus{border-color:#2e7d32}
.mandiCard{background:#fff;border-radius:15px;padding:13px;margin-bottom:9px;display:flex;justify-content:space-between;gap:10px;box-shadow:0 2px 8px #0001}
.mandiCrop{font-weight:800}
.price{color:#28752e;font-weight:800;text-align:right}
.weatherBig{background:linear-gradient(135deg,#e4f7dd,#fff);border-radius:20px;padding:20px;text-align:center;margin-bottom:11px}
.temperature{font-size:48px;font-weight:800;color:#28752e;margin:4px 0}
.weatherInfoGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:11px}
.weatherInfo{background:#fff;border-radius:13px;padding:11px;font-size:12px}
.forecast{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.forecastCard{background:#f7faf6;border-radius:13px;padding:11px;text-align:center;font-size:11px}
.forecastIcon{font-size:25px;margin:7px}
.locationRow{display:flex;gap:7px;align-items:center;background:#fff;padding:10px;border-radius:12px;margin-bottom:10px;font-size:12px}
.chatBox{min-height:330px;max-height:55vh;overflow:auto}
.bubble{max-width:88%;padding:10px 12px;border-radius:13px;margin-bottom:8px;font-size:13px;line-height:1.5}
.aiBubble{background:#edf7ea}
.userBubble{background:#2e7d32;color:#fff;margin-left:auto}
.quick{display:flex;gap:6px;overflow:auto;margin:8px 0}
.quick button{white-space:nowrap;border:1px solid #dce7d9;background:#fff;border-radius:18px;padding:7px 10px;font-size:10px}
.inputRow{display:flex;gap:7px;margin-top:9px}
.inputRow input{flex:1;min-width:0;border:1px solid #ddd;border-radius:12px;padding:11px;outline:none}
.sendBtn{padding:0 15px}
.cropRow,.product,.cartRow{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:12px 0;border-bottom:1px solid #eee}
.cropName,.productName{font-weight:800}
.quantity{display:flex;align-items:center;gap:8px}
.quantity button{width:29px;height:29px;border:0;border-radius:8px;background:#e8f5e9;color:#28752e;display:grid;place-items:center}
.upload{border:2px dashed #cfe3cb;border-radius:15px;padding:15px;text-align:center;background:#f8fcf7}
.preview{max-width:100%;max-height:220px;border-radius:12px;margin-top:10px}
.result{background:#edf7ea;border-radius:13px;padding:12px;margin-top:10px;font-size:12px;line-height:1.6}
.profileCard{text-align:center}
.bigProfile{width:72px;height:72px;border-radius:50%;margin:auto;background:#e8f5e9;color:#28752e;display:grid;place-items:center}
.scheme{display:flex;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid #eee}
.schemeIcon{font-size:23px}
.scheme a{font-size:11px;color:#28752e;text-decoration:none}
.empty{text-align:center;padding:38px 10px;color:#777}
.total{display:flex;justify-content:space-between;font-size:18px;font-weight:800;padding:13px 0}
.bottomNav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:min(700px,100%);background:#fff;display:grid;grid-template-columns:repeat(4,1fr);padding:7px 4px;box-shadow:0 -2px 12px #0002;z-index:20}
.navBtn{border:0;background:transparent;color:#777;font-size:10px;padding:5px;display:flex;flex-direction:column;align-items:center;gap:2px}
.navBtn.active{color:#28752e;font-weight:800}
.fab{position:fixed;right:max(18px,calc((100vw - 700px)/2 + 18px));bottom:72px;width:52px;height:52px;border:0;border-radius:50%;background:#16843a;color:#fff;box-shadow:0 4px 14px #0003;z-index:15;display:grid;place-items:center}
`;

function PageTitle({setTab,title,sub}:{setTab:(t:Tab)=>void;title:string;sub?:string}){
return <div className="pageTitle">
<button className="back" onClick={()=>setTab("home")}><ArrowLeft size={19}/></button>
<div><h2>{title}</h2>{sub&&<small>{sub}</small>}</div>
</div>
}

function Nav({active,on,icon,text}:{active:boolean;on:()=>void;icon:React.ReactNode;text:string}){
return <button className={`navBtn ${active?"active":""}`} onClick={on}>{icon}<div>{text}</div></button>
}

function App(){
const[tab,setTab]=useState<Tab>("home");
const[name]=useState("किसान भाई");
const[cart,setCart]=useState<Record<number,number>>(()=>JSON.parse(localStorage.getItem("ks_cart")||"{}"));
const[crops,setCrops]=useState<Crop[]>(()=>JSON.parse(localStorage.getItem("ks_crops")||"[]"));
const[chat,setChat]=useState<ChatMsg[]>(()=>JSON.parse(localStorage.getItem("ks_chat")||"[]"));
const[q,setQ]=useState("");

useEffect(()=>localStorage.setItem("ks_cart",JSON.stringify(cart)),[cart]);
useEffect(()=>localStorage.setItem("ks_crops",JSON.stringify(crops)),[crops]);
useEffect(()=>localStorage.setItem("ks_chat",JSON.stringify(chat)),[chat]);

const count=Object.values(cart).reduce((a,b)=>a+b,0);
const total=Object.entries(cart).reduce((s,[id,n])=>s+(products.find(p=>p.id===+id)?.price||0)*n,0);

const add=(id:number)=>setCart(c=>({...c,[id]:(c[id]||0)+1}));

const remove=(id:number)=>setCart(c=>{
const x={...c};
if(x[id]>1)x[id]--;
else delete x[id];
return x;
});

const send=async(text=q)=>{
const t=text.trim();
if(!t)return;

setChat(c=>[
...c,
{from:"user",text:t},
{from:"ai",text:"AI Kisan सोच रहा है..."}
]);

setQ("");

try{
const r=await fetch("/api/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:t})
});

const d=await r.json().catch(()=>({}));

if(!r.ok)throw Error(d.error||"AI service error");

setChat(c=>{
const a=[...c];
const i=a.map(x=>x.from).lastIndexOf("ai");
if(i>=0)a[i]={from:"ai",text:d.reply||"AI से जवाब नहीं मिला।"};
return a;
});
}catch(e){
setChat(c=>{
const a=[...c];
const i=a.map(x=>x.from).lastIndexOf("ai");
if(i>=0)a[i]={
from:"ai",
text:"❌ "+(e instanceof Error?e.message:"AI सेवा उपलब्ध नहीं है।")
};
return a;
});
}
};

return <div className="app">
<style>{css}</style>

<header>
<button className="brand"
style={{border:0,background:"transparent",padding:0}}
onClick={()=>setTab("home")}>
<span className="logo">🌾</span>
<span>KisanSaathi AI<small>आपका डिजिटल किसान दोस्त</small></span>
</button>

<button className="profileIcon" onClick={()=>setTab("profile")}>
<User size={20}/>
</button>
</header>

<main>

{tab==="home"&&<HomePage setTab={setTab} name={name}/>}
{tab==="mandi"&&<MandiPage setTab={setTab}/>}
{tab==="weather"&&<WeatherPage setTab={setTab}/>}
{tab==="crops"&&<CropsPage setTab={setTab} crops={crops} setCrops={setCrops}/>}
{tab==="doctor"&&<DoctorPage setTab={setTab}/>}
{tab==="store"&&<StorePage setTab={setTab} cart={cart} add={add}/>}
{tab==="cart"&&<CartPage setTab={setTab} cart={cart} add={add} remove={remove} total={total}/>}
{tab==="chat"&&<ChatPage setTab={setTab} chat={chat} q={q} setQ={setQ} send={send}/>}
{tab==="profile"&&<ProfilePage setTab={setTab} name={name} crops={crops}/>}

</main>

<button className="fab" onClick={()=>setTab("chat")}>
<MessageCircle size={23}/>
</button>

<nav className="bottomNav">
<Nav active={tab==="home"} on={()=>setTab("home")} icon={<Home size={19}/>} text="Home"/>
<Nav active={tab==="crops"} on={()=>setTab("crops")} icon={<Leaf size={19}/>} text="मेरी फसल"/>
<Nav active={tab==="store"} on={()=>setTab("store")} icon={<ShoppingCart size={19}/>} text={count?`Store (${count})`:"Store"}/>
<Nav active={tab==="profile"} on={()=>setTab("profile")} icon={<User size={19}/>} text="Profile"/>
</nav>

</div>
}

function HomePage({setTab,name}:{setTab:(t:Tab)=>void;name:string}){

const cards:[string,string,string,Tab][]=[
["📷","फसल जाँचें","फोटो से जांच","doctor"],
["🤖","AI Kisan","सवाल पूछें","chat"],
["🌦️","मौसम","अपने इलाके का मौसम","weather"],
["💰","मंडी भाव","Real Government Mandi","mandi"],
["🌱","मेरी फसल","अपनी फसल जोड़ें","crops"],
["🛒","Kisan Store","कृषि सामान","store"],
["🏛️","सरकारी योजना","किसानों की योजनाएं","profile"]
];

return <>
<section className="hero">
<h1>नमस्ते {name} 👋</h1>
<p>आज खेती में आपकी मदद के लिए तैयार हूँ।</p>

<button className="weatherButton" onClick={()=>setTab("weather")}>
<CloudSun size={29}/>
<div>
<strong>आज का मौसम देखें</strong><br/>
<span>अपने इलाके का live मौसम देखें</span>
</div>
<ArrowLeft size={16} style={{marginLeft:"auto",transform:"rotate(180deg)"}}/>
</button>
</section>

<div className="grid">
{cards.map(c=>
<button className="card" key={c[3]} onClick={()=>setTab(c[3])}>
<div className="cardIcon">{c[0]}</div>
<div>
<div className="cardTitle">{c[1]}</div>
<div className="cardSub">{c[2]}</div>
</div>
</button>
)}
</div>

<div className="advice">
🌾 <b>किसान सलाह</b><br/>
मंडी भाव अब Government API से लाए जाते हैं। बिक्री से पहले अपनी मंडी और तारीख जरूर देखें।
</div>
</>
}

function MandiPage({setTab}:{setTab:(t:Tab)=>void}){

const[search,setSearch]=useState("");
const[records,setRecords]=useState<any[]>([]);
const[loading,setLoading]=useState(false);
const[error,setError]=useState("");

const load=async()=>{
setLoading(true);
setError("");

try{
const p=new URLSearchParams({limit:"100"});
const q=search.trim();

if(q)p.set("commodity",q);

const r=await fetch(`/api/mandi?${p.toString()}`);
const d=await r.json().catch(()=>({}));

if(!r.ok||d?.ok===false){
throw Error(d?.error||"Government Mandi API से data नहीं मिला।");
}

setRecords(Array.isArray(d.mandi)?d.mandi:[]);

}catch(e){
setRecords([]);
setError(
e instanceof Error
?e.message
:"Real Mandi Bhav नहीं मिल पाया।"
);
}finally{
setLoading(false);
}
};

useEffect(()=>{
load();
},[]);

const filtered=records.filter(x=>{
const q=search.trim().toLowerCase();

return !q ||
`${x.commodity} ${x.variety} ${x.market} ${x.district} ${x.state}`
.toLowerCase()
.includes(q);
});

return <>
<PageTitle
setTab={setTab}
title="मंडी भाव"
sub="Government of India · AGMARKNET"
/>

<div className="section">

<input
className="search"
value={search}
onChange={e=>setSearch(e.target.value)}
placeholder="🔎 फसल खोजें जैसे गेहूं, धान..."
/>

<button
className="primary"
onClick={load}
disabled={loading}
>
{loading
?"मंडी भाव लोड हो रहे हैं..."
:"🔄 असली मंडी भाव देखें"}
</button>

<div className="muted" style={{marginTop:9}}>
🇮🇳 Source: Government of India - Data.gov.in / AGMARKNET
</div>

{error&&
<div className="result">
❌ {error}
</div>
}

</div>

{!loading&&!error&&!filtered.length&&
<div className="section empty">
<IndianRupee size={45}/>
<h3>मंडी भाव नहीं मिले</h3>
<p>फसल का नाम हटाकर फिर कोशिश करें।</p>
</div>
}

{filtered.map((x,i)=>
<div
className="mandiCard"
key={i}
>

<div style={{minWidth:0}}>

<div className="mandiCrop">
🌾 {x.commodity||"फसल"}
</div>

<div className="muted">
📍 {x.market||"मंडी"}
{x.district?` · ${x.district}`:""}
</div>

<div className="muted">
{x.state||""}
{x.variety?` · किस्म: ${x.variety}`:""}
</div>

<div className="muted">
📅 {x.arrivalDate||"तारीख उपलब्ध नहीं"}
</div>

</div>

<div className="price">

₹{Number(x.modalPrice||0).toLocaleString("en-IN")}

<div className="muted">
Modal / क्विंटल
</div>

<div className="muted">
₹{Number(x.minPrice||0).toLocaleString("en-IN")}
-
₹{Number(x.maxPrice||0).toLocaleString("en-IN")}
</div>

</div>

</div>
)}

</>
}

function WeatherPage({setTab}:{setTab:(t:Tab)=>void}){

const[loading,setLoading]=useState(false);
const[error,setError]=useState("");
const[w,setW]=useState<any>(null);
const[loc,setLoc]=useState("");

const load=()=>{

if(!navigator.geolocation){
setError("Location उपलब्ध नहीं है।");
return;
}

setLoading(true);
setError("");

navigator.geolocation.getCurrentPosition(
async p=>{
try{

const{latitude,longitude}=p.coords;

const u=
`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&forecast_days=3`;

const r=await fetch(u);

if(!r.ok)throw Error();

setW(await r.json());

setLoc(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);

}catch{
setError("मौसम नहीं मिल पाया। इंटरनेट और Location जांचें।");
}finally{
setLoading(false);
}
},
()=>{
setError("Location की अनुमति दें।");
setLoading(false);
},
{
enableHighAccuracy:true,
timeout:10000,
maximumAge:300000
}
);
};

const txt=(c:number)=>
c===0?"साफ आसमान":
c<=3?"आंशिक बादल":
c<=48?"कोहरा":
c<=67?"बारिश":
c<=77?"बर्फ":
c<=82?"तेज बारिश":
"गरज के साथ बारिश";

const emo=(c:number)=>
c===0?"☀️":
c<=3?"🌤️":
c<=48?"🌫️":
c<=67?"🌧️":
c<=77?"❄️":
"⛈️";

return <>
<PageTitle
setTab={setTab}
title="मौसम"
sub="आपके इलाके का live forecast"
/>

<div className="locationRow">
<MapPin size={17}/>
<span>{loc||"Location अभी नहीं ली गई"}</span>

<button
style={{marginLeft:"auto",border:0,background:"transparent"}}
onClick={load}
>
<RefreshCw size={17}/>
</button>
</div>

{!w?
<div className="section" style={{textAlign:"center",padding:30}}>

<CloudSun size={52}/>

<h3>अपने इलाके का मौसम देखें</h3>

<button className="primary" onClick={load}>
{loading?"मौसम लोड हो रहा है...":"📍 मेरा मौसम देखें"}
</button>

{error&&
<p style={{color:"#b33",fontSize:12}}>
{error}
</p>
}

</div>
:
<>
<div className="weatherBig">

<div style={{fontSize:48}}>
{emo(w.current.weather_code)}
</div>

<div className="temperature">
{Math.round(w.current.temperature_2m)}°C
</div>

<h3>{txt(w.current.weather_code)}</h3>

<div className="weatherInfoGrid">

<div className="weatherInfo">
💧 नमी<br/>
<b>{w.current.relative_humidity_2m}%</b>
</div>

<div className="weatherInfo">
💨 हवा<br/>
<b>{Math.round(w.current.wind_speed_10m)} km/h</b>
</div>

<div className="weatherInfo">
🌡️ महसूस<br/>
<b>{Math.round(w.current.apparent_temperature)}°C</b>
</div>

<div className="weatherInfo">
🌧️ बारिश<br/>
<b>{w.current.precipitation} mm</b>
</div>

</div>
</div>

<div className="section">

<h3>📅 अगले 3 दिन</h3>

<div className="forecast">

{w.daily.time.map((d:string,i:number)=>
<div className="forecastCard" key={d}>

<b>
{i===0?"आज":i===1?"कल":"परसों"}
</b>

<div className="forecastIcon">
{emo(w.daily.weather_code[i])}
</div>

<b>
{Math.round(w.daily.temperature_2m_max[i])}°
/
{Math.round(w.daily.temperature_2m_min[i])}°
</b>

<div className="muted">
बारिश {w.daily.precipitation_probability_max[i]}%
</div>

</div>
)}

</div>
</div>
</>
}

</>
}

function CropsPage({setTab,crops,setCrops}:{setTab:(t:Tab)=>void;crops:Crop[];setCrops:React.Dispatch<React.SetStateAction<Crop[]>>}){

const[n,setN]=useState("");
const[a,setA]=useState("");

const save=()=>{
if(!n.trim())return;

setCrops(c=>[
...c,
{
id:Date.now(),
name:n.trim(),
area:a.trim(),
note:"नियमित निगरानी करें"
}
]);

setN("");
setA("");
};

return <>
<PageTitle
setTab={setTab}
title="मेरी फसल"
sub="अपनी फसलें सेव करें"
/>

<div className="section">

<h3>🌱 नई फसल जोड़ें</h3>

<input
className="search"
value={n}
onChange={e=>setN(e.target.value)}
placeholder="फसल का नाम"
/>

<input
className="search"
value={a}
onChange={e=>setA(e.target.value)}
placeholder="खेत/क्षेत्र (जैसे 2 एकड़)"
/>

<button className="primary" onClick={save}>
<Plus size={16}/> फसल सेव करें
</button>

</div>

{!crops.length?
<div className="section empty">
<Sprout size={45}/>
<h3>अभी कोई फसल सेव नहीं है</h3>
</div>
:
<div className="section">

{crops.map(c=>
<div className="cropRow" key={c.id}>

<div>
<div className="cropName">
🌾 {c.name}
</div>

<div className="muted">
{c.area||"क्षेत्र नहीं दिया"} · {c.note}
</div>
</div>

<button
onClick={()=>setCrops(x=>x.filter(y=>y.id!==c.id))}
style={{border:0,background:"transparent",color:"#a33"}}
>
<X size={18}/>
</button>

</div>
)}

</div>
}

function DoctorPage({setTab}:{setTab:(t:Tab)=>void}){

const[f,setF]=useState<File|null>(null);
const[url,setUrl]=useState("");
const[result,setResult]=useState("");

const choose=(x:File|null)=>{
setF(x);
setResult("");

if(x)setUrl(URL.createObjectURL(x));
};

return <>
<PageTitle
setTab={setTab}
title="Crop Doctor"
sub="फसल की फोटो जांच"
/>

<div className="section">

<div className="upload">

<Camera size={48}/>

<h3>अपनी फसल की साफ फोटो चुनें</h3>

<p className="muted">
अच्छी रोशनी में पत्ती/फल की फोटो लें।
</p>

<input
type="file"
accept="image/*"
capture="environment"
onChange={e=>choose(e.target.files?.[0]||null)}
/>

{url&&
<img
className="preview"
src={url}
alt="फसल preview"
/>
}

</div>

{f&&
<button
className="primary"
style={{marginTop:10}}
onClick={()=>
setResult(
"फोटो मिली है। केवल फोटो से बीमारी की निश्चित पहचान सुरक्षित नहीं है। फसल की उम्र, लक्षण और खेत की स्थिति देखकर कृषि विशेषज्ञ से पुष्टि करें।"
)
}
>
🔍 जांच शुरू करें
</button>
}

{result&&
<div className="result">
<b>जांच रिपोर्ट</b><br/>
{result}
</div>
}

</div>

<div className="section">

<Stethoscope size={28}/>

<h3>ध्यान रखें</h3>

<p className="muted">
बिना सही पहचान के दवा या रसायन न चुनें।
</p>

</div>
</>
}

function StorePage({setTab,cart,add}:{setTab:(t:Tab)=>void;cart:Record<number,number>;add:(id:number)=>void}){

const count=Object.values(cart).reduce((a,b)=>a+b,0);

return <>
<PageTitle
setTab={setTab}
title="Kisan Store"
sub="कृषि उपयोगी सामान"
/>

<div className="section">

{products.map(p=>
<div className="product" key={p.id}>

<div style={{display:"flex",gap:9,alignItems:"center"}}>

<span style={{fontSize:28}}>
{p.emoji}
</span>

<div>
<div className="productName">
{p.name}
</div>

<div className="muted">
₹{p.price} · {p.unit}
</div>
</div>

</div>

<button
className="addBtn"
onClick={()=>add(p.id)}
>
कार्ट में डालें
</button>

</div>
)}

<button
className="primary"
style={{marginTop:12}}
onClick={()=>setTab("cart")}
>
🛒 कार्ट देखें {count?`(${count})`:""}
</button>

</div>
</>
}

function CartPage({setTab,cart,add,remove,total}:{setTab:(t:Tab)=>void;cart:Record<number,number>;add:(id:number)=>void;remove:(id:number)=>void;total:number}){

const ids=Object.keys(cart).map(Number);

return <>
<PageTitle setTab={setTab} title="आपका Cart"/>

{!ids.length?

<div className="section empty">

<ShoppingCart size={50}/>

<h3>Cart खाली है</h3>

<button
className="addBtn"
onClick={()=>setTab("store")}
>
Store देखें
</button>

</div>

:

<div className="section">

{ids.map(id=>{
const p=products.find(x=>x.id===id)!;

return <div className="cartRow" key={id}>

<div>
<b>{p.name}</b>

<div className="muted">
₹{p.price} × {cart[id]}
</div>
</div>

<div className="quantity">

<button onClick={()=>remove(id)}>
<Minus size={15}/>
</button>

<b>{cart[id]}</b>

<button onClick={()=>add(id)}>
<Plus size={15}/>
</button>

</div>

</div>
})}

<div className="total">
<span>कुल राशि</span>
<span>₹{total.toLocaleString("en-IN")}</span>
</div>

<button
className="primary"
onClick={()=>
alert("Demo order: payment/delivery backend अभी जोड़ना बाकी है.")
}
>
ऑर्डर करें
</button>

</div>
}
</>
}

function ChatPage({setTab,chat,q,setQ,send}:{setTab:(t:Tab)=>void;chat:ChatMsg[];q:string;setQ:(s:string)=>void;send:(s?:string)=>void}){

const quick=[
"गेहूं में खाद कब डालें?",
"धान में पत्तियां पीली हैं",
"आज बारिश होगी?",
"सरसों में कीड़ा लग गया"
];

return <>
<PageTitle
setTab={setTab}
title="AI Kisan"
sub="खेती से जुड़े सवाल पूछें"
/>

<div className="chatBox">

{!chat.length?

<div className="empty">

<MessageCircle size={48}/>

<h3>नमस्ते किसान भाई 👋</h3>

<p>
फसल, मौसम, मंडी या खेती के बारे में पूछें।
</p>

</div>

:

chat.map((m,i)=>
<div
className={`bubble ${m.from==="user"?"userBubble":"aiBubble"}`}
key={i}
>

<b>
{m.from==="user"?"आप":"🤖 AI Kisan"}
</b>

<br/>

{m.text}

</div>
)}

</div>

<div className="quick">

{quick.map(x=>
<button
key={x}
onClick={()=>send(x)}
>
{x}
</button>
)}

</div>

<div className="inputRow">

<input
value={q}
onChange={e=>setQ(e.target.value)}
onKeyDown={e=>e.key==="Enter"&&send()}
placeholder="अपना सवाल लिखें..."
/>

<button
className="sendBtn"
onClick={()=>send()}
>
<Send size={18}/>
</button>

</div>
</>
}

function ProfilePage({setTab,name,crops}:{setTab:(t:Tab)=>void;name:string;crops:Crop[]}){

return <>
<PageTitle setTab={setTab} title="प्रोफाइल"/>

<div className="section profileCard">

<div className="bigProfile">
<User size={36}/>
</div>

<h2>{name}</h2>

<p className="muted">
{crops.length} फसल सेव हैं
</p>

</div>

<div className="section">

<h3>🏛️ सरकारी योजनाएं</h3>

{schemes.map(s=>
<div className="scheme" key={s.title}>

<div className="schemeIcon">
{s.icon}
</div>

<div style={{flex:1}}>

<b>{s.title}</b>

<div className="muted">
{s.text}
</div>

<a
href={s.url}
target="_blank"
rel="noreferrer"
>
आधिकारिक वेबसाइट <ExternalLink size={11}/>
</a>

</div>

</div>
)}

</div>

<div className="section">

<h3>ℹ️ ऐप की स्थिति</h3>

<p className="muted">
Mandi Bhav Government API से live records लेता है।
Weather live है। AI Kisan backend से जुड़ा है।
</p>

</div>
</>
}

const root=document.getElementById("root");

if(root)
createRoot(root).render(
<React.StrictMode>
<App/>
</React.StrictMode>
);
