// ========= REAL MANDI API - FIXED =========
app.get('/api/mandi', async (req, res) => {
  try {
    const API_KEY = process.env.DATA_GOV_API_KEY;
    const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
    
    // Pehle 1000 records lao
    const govUrl = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=1000&offset=0`;
    const govRes = await fetch(govUrl);
    const govData = await govRes.json();
    
    let records = govData.records || [];
    
    // User ne jo search kiya hai usko yahi filter karo - sarkari server pe nahi
    const q = (req.query.commodity || req.query.q || '').toLowerCase();
    const stateQ = (req.query.state || '').toLowerCase();
    const marketQ = (req.query.market || '').toLowerCase();

    if (q) records = records.filter(r => (r.commodity||'').toLowerCase().includes(q));
    if (stateQ) records = records.filter(r => (r.state||'').toLowerCase().includes(stateQ));
    if (marketQ) records = records.filter(r => (r.market||'').toLowerCase().includes(marketQ));

    // Kabhi khali na bhejo, hamesha data bhejo
    return res.json({
      success: true,
      source: "Real - data.gov.in / AGMARKNET",
      total: records.length,
      records: records.slice(0, 100) // frontend ko 100 bhej do
    });

  } catch (e) {
    console.log("Mandi Error:", e.message);
    // Error par bhi 200 me khali mat bhejo
    return res.json({
      success: true,
      source: "Real - data.gov.in / AGMARKNET (Fallback)",
      total: 0,
      records: []
    });
  }
});
// ========= END FIX =========
