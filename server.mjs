// --- REAL BHARAT MANDI - All Sabzi + Pramukh Mandi ---
app.get("/api/mandi", async (req, res) => {
  try {
    // Bharat ki 5 sabse badi mandiyan
    const PRAMUKH_MANDI = ["Azadpur", "Lasalgaon", "Vashi", "Kolar", "Indore", "Shahjahanpur", "Bareilly"];
    
    // All sabzi - limit 100 records
    const apiURL = "https://api.ceda.ashoka.edu.in/v1/agmarknet?limit=100";
    const response = await fetch(apiURL);
    const json = await response.json();
    
    if (!json?.records) throw new Error("API fail");

    let allData = json.records.map(r => ({
      mandi: r.market,
      state: r.state,
      district: r.district,
      fasal: r.commodity,
      variety: r.variety,
      min: r.min_price,
      modal: r.modal_price,
      max: r.max_price,
      bhav: `₹ ${r.modal_price} / Qtl`,
      full: `Min ₹${r.min_price} | Modal ₹${r.modal_price} | Max ₹${r.max_price}`,
      date: r.arrival_date,
      isPramukh: PRAMUKH_MANDI.some(m => r.market.toLowerCase().includes(m.toLowerCase()))
    }));

    // Pramukh mandi ko upar lao
    allData.sort((a,b) => b.isPramukh - a.isPramukh);

    res.json({
      source: "Bharat Sarkar - Agmarknet LIVE",
      total: allData.length,
      date: new Date().toLocaleDateString('hi-IN'),
      pramukhMandiList: PRAMUKH_MANDI,
      mandis: allData
    });

  } catch (e) {
    console.log(e.message);
    res.json({
      source: "Backup Data",
      date: new Date().toLocaleDateString('hi-IN'),
      mandis: [
        { mandi: "Azadpur (Delhi)", fasal: "Tamatar", bhav: "₹ 1800 / Qtl", full: "Min 1200 Modal 1800 Max 2200", isPramukh: true },
        { mandi: "Azadpur (Delhi)", fasal: "Pyaz", bhav: "₹ 2100 / Qtl", full: "Min 1800 Modal 2100 Max 2500", isPramukh: true },
        { mandi: "Azadpur (Delhi)", fasal: "Aalu", bhav: "₹ 1400 / Qtl", full: "Min 1100 Modal 1400 Max 1600", isPramukh: true },
        { mandi: "Lasalgaon (Nashik)", fasal: "Pyaz", bhav: "₹ 1950 / Qtl", full: "Min 1500 Modal 1950 Max 2300", isPramukh: true },
        { mandi: "Vashi (Mumbai)", fasal: "Bhindi", bhav: "₹ 2800 / Qtl", full: "Min 2000 Modal 2800 Max 3200", isPramukh: true },
        { mandi: "Kolar (Karnataka)", fasal: "Tamatar", bhav: "₹ 1500 / Qtl", full: "Min 1000 Modal 1500 Max 2000", isPramukh: true },
        { mandi: "Shahjahanpur", fasal: "Gehu", bhav: "₹ 2325 / Qtl", full: "Min 2200 Modal 2325 Max 2400", isPramukh: true },
        { mandi: "Indore", fasal: "Lahsun", bhav: "₹ 7500 / Qtl", full: "Min 6000 Modal 7500 Max 9000", isPramukh: true },
      ]
    });
  }
});
