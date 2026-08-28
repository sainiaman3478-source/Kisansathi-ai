import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Home, Leaf, Camera, ShoppingCart, User, MessageCircle,
  CloudSun, IndianRupee, Landmark, ArrowLeft, Search,
  MapPin, Sprout, CalendarDays, Droplets, Phone, Send
} from "lucide-react";
import "./style.css";

type Tab =
  | "home" | "crops" | "doctor" | "store"
  | "profile" | "cart" | "chat" | "weather" | "mandi" | "scheme";

type Product = {
  id:number;
  name:string;
  price:number;
  emoji:string;
};

const products:Product[] = [
  {id:1,name:"नीम ऑयल",price:299,emoji:"🌿"},
  {id:2,name:"जैविक खाद",price:499,emoji:"🌱"},
  {id:3,name:"फसल सुरक्षा किट",price:699,emoji:"🧴"},
  {id:4,name:"बीज उपचार किट",price:399,emoji:"🌾"}
];

function App(){
  const [tab,setTab] = useState<Tab>("home");
  const [name] = useState("किसान भाई");
  const [cart,setCart] = useState<Record<number,number>>({});
  const [message,setMessage] = useState("");

  const cartCount = Object.values(cart).reduce((a,b)=>a+b,0);

  const addCart = (id:number)=>{
    setCart(c=>({...c,[id]:(c[id]||0)+1}));
  };

  const removeCart = (id:number)=>{
    setCart(c=>{
      const x={...c};
      if(x[id]>1) x[id]--;
      else delete x[id];
      return x;
    });
  };

  const sendMessage=()=>{
    if(!message.trim()) return;
    setMessage("");
    alert("आपका सवाल किसान साथी AI को भेज दिया गया है।");
  };

  return (
    <div className="app">

      <header className="topbar">
        <div className="brand">
          <div className="logo">🌾</div>
          <div>
            <b>KisanSaathi AI</b>
            <small>आपका डिजिटल किसान दोस्त</small>
          </div>
        </div>

        <button className="profileBtn" onClick={()=>setTab("profile")}>
          <User size={20}/>
        </button>
      </header>

      <main className="content">

        {tab==="home" && (
          <HomePage
            name={name}
            setTab={setTab}
          />
        )}

        {tab==="weather" && (
          <WeatherPage setTab={setTab}/>
        )}

        {tab==="doctor" && (
          <DoctorPage setTab={setTab}/>
        )}

        {tab==="crops" && (
          <CropsPage setTab={setTab}/>
        )}

        {tab==="mandi" && (
          <MandiPage setTab={setTab}/>
        )}

        {tab==="scheme" && (
          <SchemePage setTab={setTab}/>
        )}

        {tab==="store" && (
          <StorePage
            setTab={setTab}
            addCart={addCart}
          />
        )}

        {tab==="cart" && (
          <CartPage
            setTab={setTab}
            cart={cart}
            addCart={addCart}
            removeCart={removeCart}
          />
        )}

        {tab==="profile" && (
          <ProfilePage
            name={name}
            setTab={setTab}
          />
        )}

        {tab==="chat" && (
          <ChatPage
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            setTab={setTab}
          />
        )}

      </main>

      <nav className="bottomNav">
        <button className={tab==="home"?"active":""} onClick={()=>setTab("home")}>
          <Home size={21}/>
          <span>Home</span>
        </button>

        <button className={tab==="crops"?"active":""} onClick={()=>setTab("crops")}>
          <Leaf size={21}/>
          <span>मेरी फसल</span>
        </button>

        <button className={tab==="doctor"?"active":""} onClick={()=>setTab("doctor")}>
          <Camera size={21}/>
          <span>Crop Doctor</span>
        </button>

        <button className={tab==="store"?"active":""} onClick={()=>setTab("store")}>
          <ShoppingCart size={21}/>
          <span>Store</span>
        </button>
      </nav>

      <button className="aiButton" onClick={()=>setTab("chat")}>
        <MessageCircle size={24}/>
        <span>AI Kisan</span>
      </button>

    </div>
  );
}


/* HOME */

function HomePage({name,setTab}:any){
  const cards = [
    {icon:<Camera/>,title:"Fasal Check Karein",sub:"फसल की फोटो जांचें",tab:"doctor"},
    {icon:<MessageCircle/>,title:"AI Kisan",sub:"किसान सवाल पूछें",tab:"chat"},
    {icon:<CloudSun/>,title:"Mausam",sub:"आज का मौसम देखें",tab:"weather"},
    {icon:<IndianRupee/>,title:"Mandi Bhav",sub:"आज के मंडी भाव",tab:"mandi"},
    {icon:<Sprout/>,title:"Meri Fasal",sub:"अपनी फसल जोड़ें",tab:"crops"},
    {icon:<ShoppingCart/>,title:"Kisan Store",sub:"कृषि सामान खरीदें",tab:"store"},
    {icon:<Landmark/>,title:"Sarkari Yojana",sub:"सरकारी योजनाएं",tab:"scheme"}
  ];

  return <>
    <section className="hero">
      <div>
        <p className="hello">नमस्ते {name} 👋</p>
        <h1>आज खेती में आपकी मदद के लिए तैयार हैं।</h1>
      </div>

      <button className="weatherMini" onClick={()=>setTab("weather")}>
        <CloudSun size={28}/>
        <div>
          <b>28°C · साफ मौसम</b>
          <small>बारिश की संभावना: 20%</small>
        </div>
        <span>›</span>
      </button>
    </section>

    <div className="grid">
      {cards.map((c:any)=>(
        <button
          className="featureCard"
          key={c.title}
          onClick={()=>setTab(c.tab)}
        >
          <div className="featureIcon">{c.icon}</div>
          <div>
            <b>{c.title}</b>
            <small>{c.sub}</small>
          </div>
          <span className="arrow">›</span>
        </button>
      ))}
    </div>

    <section className="advice">
      <b>⚠️ खेती की सलाह</b>
      <p>
        सिंचाई या दवा का फैसला लेने से पहले स्थानीय मौसम और फसल की स्थिति जरूर जांचें।
      </p>
    </section>
  </>;
}


/* WEATHER */

function WeatherPage({setTab}:any){
  return <Page title="मौसम" setTab={setTab}>
    <div className="weatherBig">
      <CloudSun size={58}/>
      <div>
        <span>आज का मौसम</span>
        <strong>28°C</strong>
        <b>साफ मौसम</b>
      </div>
    </div>

    <div className="infoGrid">
      <Info icon={<Droplets/>} title="नमी" value="62%"/>
      <Info icon={<CloudSun/>} title="बारिश" value="20%"/>
      <Info icon={<Sprout/>} title="हवा" value="12 km/h"/>
      <Info icon={<CalendarDays/>} title="कल" value="27°C"/>
    </div>

    <div className="sectionCard">
      <h3>🌾 किसान के लिए सलाह</h3>
      <p>आज मौसम सामान्य है। खेत में सिंचाई करने से पहले मिट्टी की नमी जांच लें।</p>
    </div>
  </Page>;
}


/* DOCTOR */

function DoctorPage({setTab}:any){
  const [checked,setChecked]=useState(false);

  return <Page title="Crop Doctor" setTab={setTab}>
    <div className="doctorBox">
      <div className="doctorIcon">📷</div>
      <h2>अपनी फसल की जांच करें</h2>
      <p>पत्ते या फसल की साफ फोटो चुनें और समस्या की पहचान करें।</p>

      <label className="uploadBtn">
        📷 फोटो चुनें
        <input
          type="file"
          accept="image/*"
          onChange={()=>setChecked(true)}
          hidden
        />
      </label>

      {checked && (
        <div className="result">
          <b>✅ फोटो प्राप्त हो गई</b>
          <p>फसल की जांच के लिए फोटो तैयार है।</p>
        </div>
      )}
    </div>
  </Page>;
}


/* CROPS */

function CropsPage({setTab}:any){
  const [crop,setCrop]=useState("");
  const [saved,setSaved]=useState(false);

  return <Page title="मेरी फसल" setTab={setTab}>
    <div className="sectionCard">
      <h3>🌱 अपनी फसल जोड़ें</h3>

      <input
        className="input"
        placeholder="जैसे गेहूं, धान, कपास..."
        value={crop}
        onChange={e=>setCrop(e.target.value)}
      />

      <button className="primary" onClick={()=>setSaved(true)}>
        फसल सेव करें
      </button>

      {saved && crop && (
        <div className="savedCrop">
          🌾 <b>{crop}</b>
          <span>आपकी फसल सेव हो गई</span>
        </div>
      )}
    </div>

    <div className="sectionCard">
      <h3>📍 खेत की जानकारी</h3>
      <p>गांव, क्षेत्रफल और सिंचाई की जानकारी जोड़कर बेहतर सलाह पाएं।</p>
    </div>
  </Page>;
}


/* MANDI */

function MandiPage({setTab}:any){
  const data=[
    ["गेहूं","₹2,450","क्विंटल"],
    ["धान","₹2,180","क्विंटल"],
    ["सरसों","₹5,650","क्विंटल"],
    ["कपास","₹7,200","क्विंटल"]
  ];

  return <Page title="मंडी भाव" setTab={setTab}>
    <div className="searchBox">
      <Search size={20}/>
      <input placeholder="फसल खोजें..."/>
    </div>

    <div className="mandiList">
      {data.map(x=>(
        <div className="mandiRow" key={x[0]}>
          <div>
            <b>{x[0]}</b>
            <small>आज का भाव</small>
          </div>
          <strong>{x[1]}</strong>
          <span>{x[2]}</span>
        </div>
      ))}
    </div>

    <p className="note">* भाव Demo Data हैं। स्थानीय मंडी में कीमत की पुष्टि करें।</p>
  </Page>;
}


/* SCHEME */

function SchemePage({setTab}:any){
  const schemes=[
    ["🌾","PM-KISAN","किसानों के लिए आर्थिक सहायता योजना"],
    ["💧","PM सिंचाई योजना","सिंचाई सुविधा को बढ़ावा"],
    ["🌱","फसल बीमा योजना","फसल नुकसान से सुरक्षा"]
  ];

  return <Page title="सरकारी योजना" setTab={setTab}>
    {schemes.map(s=>(
      <div className="schemeCard" key={s[1]}>
        <div className="schemeEmoji">{s[0]}</div>
        <div>
          <b>{s[1]}</b>
          <p>{s[2]}</p>
        </div>
        <span>›</span>
      </div>
    ))}
  </Page>;
}


/* STORE */

function StorePage({setTab,addCart}:any){
  return <Page title="Kisan Store" setTab={setTab}>
    <div className="productGrid">
      {products.map(p=>(
        <div className="product" key={p.id}>
          <div className="productEmoji">{p.emoji}</div>
          <b>{p.name}</b>
          <strong>₹{p.price}</strong>
          <button onClick={()=>addCart(p.id)}>
            कार्ट में डालें
          </button>
        </div>
      ))}
    </div>
  </Page>;
}


/* CART */

function CartPage({setTab,cart,addCart,removeCart}:any){
  const items=products.filter(p=>cart[p.id]);

  const total=items.reduce(
    (sum,p)=>sum+p.price*cart[p.id],0
  );

  return <Page title="कार्ट" setTab={setTab}>
    {items.length===0 ? (
      <div className="empty">
        🛒
        <h3>कार्ट खाली है</h3>
        <button className="primary" onClick={()=>setTab("store")}>
          Store देखें
        </button>
      </div>
    ):(
      <>
        {items.map(p=>(
          <div className="cartRow" key={p.id}>
            <span className="cartEmoji">{p.emoji}</span>
            <div>
              <b>{p.name}</b>
              <small>₹{p.price} × {cart[p.id]}</small>
            </div>
            <button onClick={()=>removeCart(p.id)}>−</button>
            <b>{cart[p.id]}</b>
            <button onClick={()=>addCart(p.id)}>+</button>
          </div>
        ))}

        <div className="total">
          <span>कुल राशि</span>
          <strong>₹{total}</strong>
        </div>
      </>
    )}
  </Page>;
}


/* PROFILE */

function ProfilePage({name,setTab}:any){
  return <Page title="प्रोफाइल" setTab={setTab}>
    <div className="profileHero">
      <div className="avatar"><User size={42}/></div>
      <h2>{name}</h2>
      <p>KisanSaathi उपयोगकर्ता</p>
    </div>

    <div className="profileList">
      <div><span>👤</span><b>नाम</b><small>{name}</small></div>
      <div><span>🌾</span><b>मेरी फसल</b><small>फसल की जानकारी जोड़ें</small></div>
      <div><span>📍</span><b>स्थान</b><small>गांव और जिला जोड़ें</small></div>
      <div><span>📞</span><b>सहायता</b><small>किसान सहायता केंद्र</small></div>
    </div>
  </Page>;
}


/* CHAT */

function ChatPage({message,setMessage,sendMessage,setTab}:any){
  return <Page title="AI Kisan" setTab={setTab}>
    <div className="chatIntro">
      🤖
      <h2>नमस्ते किसान भाई!</h2>
      <p>फसल, मौसम, मंडी या खेती से जुड़ा सवाल पूछें।</p>
    </div>

    <div className="quickQuestions">
      <button>गेहूं में कौन सी खाद डालें?</button>
      <button>आज बारिश होगी?</button>
      <button>धान का भाव क्या है?</button>
    </div>

    <div className="chatInput">
      <input
        value={message}
        onChange={e=>setMessage(e.target.value)}
        placeholder="अपना सवाल लिखें..."
        onKeyDown={e=>{
          if(e.key==="Enter") sendMessage();
        }}
      />
      <button onClick={sendMessage}>
        <Send size={19}/>
      </button>
    </div>
  </Page>;
}


/* COMMON */

function Page({title,setTab,children}:any){
  return <>
    <div className="pageHead">
      <button onClick={()=>setTab("home")}>
        <ArrowLeft size={20}/>
      </button>
      <h2>{title}</h2>
    </div>
    {children}
  </>;
}

function Info({icon,title,value}:any){
  return (
    <div className="infoCard">
      {icon}
      <small>{title}</small>
      <b>{value}</b>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App/>);
function WeatherPage({setTab}:any){
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [weather,setWeather] = useState<any>(null);
  const [location,setLocation] = useState("आपकी लोकेशन");

  const getWeather = () => {
    setLoading(true);
    setError("");

    if(!navigator.geolocation){
      setError("आपके फोन में Location सुविधा उपलब्ध नहीं है।");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos)=>{
        try{
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${lat}` +
            `&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
            `&hourly=precipitation_probability` +
            `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
            `&timezone=auto` +
            `&forecast_days=3`;

          const res = await fetch(url);

          if(!res.ok){
            throw new Error("Weather data नहीं मिला");
          }

          const data = await res.json();

          setWeather(data);

          setLocation(
            `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
          );

        }catch(e){
          setError("मौसम की जानकारी नहीं मिल पाई। फिर से कोशिश करें।");
        }

        setLoading(false);
      },
      ()=>{
        setError(
          "Location की अनुमति दें, तभी आपके इलाके का मौसम दिखेगा।"
        );
        setLoading(false);
      },
      {
        enableHighAccuracy:true,
        timeout:10000
      }
    );
  };

  const weatherText = (code:number) => {
    if(code===0) return "साफ आसमान";
    if(code<=3) return "आंशिक बादल";
    if(code<=48) return "कोहरा";
    if(code<=57) return "बूंदाबांदी";
    if(code<=67) return "बारिश";
    if(code<=77) return "बर्फ";
    if(code<=82) return "तेज बारिश";
    if(code<=86) return "बारिश / बर्फ";
    return "गरज के साथ बारिश";
  };

  const weatherEmoji = (code:number) => {
    if(code===0) return "☀️";
    if(code<=3) return "🌤️";
    if(code<=48) return "🌫️";
    if(code<=67) return "🌧️";
    if(code<=77) return "❄️";
    return "⛈️";
  };

  return <Page title="मौसम" setTab={setTab}>

    {!weather && !loading && (
      <div className="weatherStart">
        <div className="weatherStartIcon">🌦️</div>

        <h2>अपने इलाके का मौसम देखें</h2>

        <p>
          Location की अनुमति देकर अपने आसपास का
          live मौसम और अगले दिनों का forecast देखें।
        </p>

        <button
          className="primary"
          onClick={getWeather}
        >
          📍 मेरा मौसम देखें
        </button>
      </div>
    )}

    {loading && (
      <div className="weatherStart">
        <div className="weatherStartIcon">⏳</div>
        <h2>मौसम पता कर रहे हैं...</h2>
        <p>कृपया थोड़ी देर रुकें।</p>
      </div>
    )}

    {error && (
      <div className="sectionCard errorBox">
        <b>⚠️ {error}</b>

        <button
          className="primary"
          onClick={getWeather}
        >
          🔄 फिर कोशिश करें
        </button>
      </div>
    )}

    {weather && (
      <>
        <div className="locationText">
          <MapPin size={17}/>
          <span>{location}</span>

          <button onClick={getWeather}>
            ↻
          </button>
        </div>

        <div className="weatherBig">

          <div className="weatherEmoji">
            {weatherEmoji(weather.current.weather_code)}
          </div>

          <div>
            <span>अभी का मौसम</span>

            <strong>
              {Math.round(weather.current.temperature_2m)}°C
            </strong>

            <b>
              {weatherText(weather.current.weather_code)}
            </b>
          </div>

        </div>

        <div className="infoGrid">

          <Info
            icon={<Droplets/>}
            title="नमी"
            value={`${weather.current.relative_humidity_2m}%`}
          />

          <Info
            icon={<CloudSun/>}
            title="बारिश की संभावना"
            value={`${weather.daily.precipitation_probability_max[0]}%`}
          />

          <Info
            icon={<Sprout/>}
            title="हवा"
            value={`${Math.round(weather.current.wind_speed_10m)} km/h`}
          />

          <Info
            icon={<CalendarDays/>}
            title="महसूस होगा"
            value={`${Math.round(weather.current.apparent_temperature)}°C`}
          />

        </div>

        <div className="sectionCard">

          <h3>📅 अगले 3 दिन</h3>

          {weather.daily.time.map((day:string,i:number)=>(
            <div className="forecastRow" key={day}>

              <div>
                <b>
                  {i===0 ? "आज" :
                   i===1 ? "कल" : "परसों"}
                </b>

                <small>
                  {weatherText(weather.daily.weather_code[i])}
                </small>
              </div>

              <span>
                {weatherEmoji(weather.daily.weather_code[i])}
              </span>

              <strong>
                {Math.round(weather.daily.temperature_2m_max[i])}° /
                {Math.round(weather.daily.temperature_2m_min[i])}°
              </strong>

            </div>
          ))}

        </div>

        <div className="sectionCard">
          <h3>🌾 किसान के लिए सलाह</h3>

          <p>
            आज का तापमान{" "}
            {Math.round(weather.current.temperature_2m)}°C है।
            खेत में काम या सिंचाई करने से पहले बारिश की
            संभावना जरूर देखें।
          </p>
        </div>
      </>
    )}

  </Page>;
}
