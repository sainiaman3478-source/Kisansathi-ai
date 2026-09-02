async function callGemini(prompt, imageBase64 = null) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("KEY missing in Render Env");

  const parts = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
  }
  const body = JSON.stringify({ contents: [{ parts }] });

  const models = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash"];
  let lastError = "";
  for (const m of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    const data = await res.json();
    if (data.candidates) return data.candidates[0].content.parts[0].text;
    lastError = JSON.stringify(data).slice(0,500);
    console.log(`Model ${m} failed:`, lastError);
  }
  throw new Error(lastError);
}
