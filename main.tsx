div>

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
