import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const db = new Database("kisansathi.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS products(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price REAL,
    discountPrice REAL,
    stock INTEGER,
    unit TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS farms(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    crop TEXT,
    area REAL,
    unit TEXT,
    sowingDate TEXT,
    soil TEXT,
    irrigation TEXT
  );

  CREATE TABLE IF NOT EXISTS orders(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderNo TEXT,
    total REAL,
    status TEXT,
    paymentMethod TEXT,
    customer TEXT,
    createdAt TEXT
  );
`);

/* ---------------- PRODUCTS ---------------- */

const productCount = db
  .prepare("SELECT count(*) as c FROM products")
  .get() as { c: number };

if (productCount.c === 0) {
  const insert = db.prepare(`
    INSERT INTO products
    (name,category,price,discountPrice,stock,unit,image)
    VALUES(?,?,?,?,?,?,?)
  `);

  const products = [
    ["HD-2967 गेहूं बीज", "Seeds", 850, 799, 40, "10 kg", "🌾"],
    ["जैविक वर्मी कम्पोस्ट", "Bio Products", 450, 399, 25, "25 kg", "🌱"],
    ["कृषि हाथ कुदाल", "Farming Tools", 320, null, 15, "1 pc", "🧰"],
    ["ड्रिप किट", "Irrigation", 1299, 1199, 8, "1 kit", "💧"]
  ];

  for (const product of products) {
    insert.run(...product);
  }
}

/* ---------------- APP ---------------- */

const app = express();

app.use(express.json({ limit: "2mb" }));

/* ---------------- PRODUCTS API ---------------- */

app.get("/api/products", (_req, res) => {
  const products = db
    .prepare("SELECT * FROM products ORDER BY id DESC")
    .all();

  res.json(products);
});

/* ---------------- FARMS API ---------------- */

app.get("/api/farms", (_req, res) => {
  const farms = db
    .prepare("SELECT * FROM farms ORDER BY id DESC")
    .all();

  res.json(farms);
});

app.post("/api/farms", (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      crop: z.string(),
      area: z.coerce.number().positive(),
      unit: z.string(),
      sowingDate: z.string(),
      soil: z.string(),
      irrigation: z.string()
    });

    const farm = schema.parse(req.body);

    const result = db
      .prepare(`
        INSERT INTO farms
        (name,crop,area,unit,sowingDate,soil,irrigation)
        VALUES
        (@name,@crop,@area,@unit,@sowingDate,@soil,@irrigation)
      `)
      .run(farm);

    res.json({
      ...farm,
      id: Number(result.lastInsertRowid)
    });
  } catch {
    res.status(400).json({
      error: "Invalid farm data"
    });
  }
});

/* ---------------- WEATHER ---------------- */

app.get("/api/weather", (_req, res) => {
  res.json({
    demo: true,
    source: "Demo Data",
    updatedAt: new Date().toISOString(),

    current: {
      temperature: 28,
      humidity: 61,
      wind: 8,
      rainProbability: 20
    },

    forecast: [
      {
        day: "आज",
        temp: 28,
        rain: 20
      },
      {
        day: "कल",
        temp: 27,
        rain: 55
      },
      {
        day: "परसों",
        temp: 29,
        rain: 15
      }
    ]
  });
});

/* =====================================================
   LIVE MANDI PRICE API
   DATA.GOV.IN
===================================================== */

app.get("/api/mandi-prices", async (req, res) => {
  try {
    const apiKey = process.env.DATA_GOV_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        demo: true,
        error: "DATA_GOV_API_KEY is not configured"
      });
    }

    const apiUrl = new URL(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    );

    apiUrl.searchParams.set("api-key", apiKey);
    apiUrl.searchParams.set("format", "json");
    apiUrl.searchParams.set("limit", "100");
    apiUrl.searchParams.set("offset", "0");

    /* Crop filter */

    if (
      typeof req.query.commodity === "string" &&
      req.query.commodity.trim()
    ) {
      apiUrl.searchParams.set(
        "filters[commodity]",
        req.query.commodity.trim()
      );
    }

    /* State filter */

    if (
      typeof req.query.state === "string" &&
      req.query.state.trim()
    ) {
      apiUrl.searchParams.set(
        "filters[state.keyword]",
        req.query.state.trim()
      );
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();

      console.error("DATA.GOV.IN ERROR:", errorText);

      return res.status(response.status).json({
        demo: false,
        error: "Mandi API request failed"
      });
    }

    const result = await response.json();

    const records = Array.isArray(result.records)
      ? result.records
      : [];

    const mandiData = records.map((item: any) => ({
      state: item.state || "",
      district: item.district || "",
      mandi: item.market || "",
      crop: item.commodity || "",
      variety: item.variety || "",
      grade: item.grade || "",
      date: item.arrival_date || "",

      min: Number(item.min_price || 0),
      max: Number(item.max_price || 0),
      modal: Number(item.modal_price || 0)
    }));

    res.json({
      demo: false,
      source: "data.gov.in",
      updatedAt: new Date().toISOString(),
      count: mandiData.length,
      data: mandiData
    });

  } catch (error) {
    console.error("MANDI API ERROR:", error);

    res.status(500).json({
      demo: false,
      error: "Mandi data fetch failed"
    });
  }
});

/* ---------------- AI CHAT ---------------- */

app.post("/api/chat", (req, res) => {
  if (!process.env.AI_API_KEY) {
    return res.json({
      demo: true,
      reply:
        "AI service abhi configure nahi hai. Demo mode mein app chal raha hai. Aap fasal, mausam, mitti aur lakshan batayein."
    });
  }

  res.status(501).json({
    error: "AI provider adapter not implemented"
  });
});

/* ---------------- CROP ANALYSIS ---------------- */

app.post("/api/crop/analyze", (req, res) => {
  const crop = req.body.cropType || "फसल";

  res.json({
    demo: true,
    crop,

    issue:
      "पत्तियों में पोषक तत्वों की कमी जैसी समस्या संभव",

    confidence:
      "Demo / अनुमान",

    symptoms:
      "पीली पड़ती पत्तियां",

    causes:
      "मिट्टी, पानी या पोषण से जुड़े कई कारण हो सकते हैं",

    nextSteps:
      "फसल की उम्र, खेत की स्थिति और पत्तियों की तस्वीर की विशेषज्ञ या विश्वसनीय स्रोत से पुष्टि करें",

    prevention:
      "संतुलित खेती प्रबंधन रखें और स्थानीय कृषि सलाह का पालन करें"
  });
});

/* ---------------- ORDERS ---------------- */

app.post("/api/orders", (req, res) => {
  try {
    const items = Array.isArray(req.body.items)
      ? req.body.items
      : [];

    let total = 0;

    for (const item of items) {
      const product = db
        .prepare("SELECT * FROM products WHERE id = ?")
        .get(item.productId) as any;

      if (!product) {
        return res.status(400).json({
          error: "Product not found"
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: "Stock unavailable"
        });
      }

      total +=
        (product.discountPrice || product.price) *
        item.quantity;
    }

    const orderNo =
      "KS" +
      Date.now()
        .toString()
        .slice(-8);

    const result = db
      .prepare(`
        INSERT INTO orders
        (orderNo,total,status,paymentMethod,customer,createdAt)
        VALUES(?,?,?,?,?,?)
      `)
      .run(
        orderNo,
        total,
        "Order Placed",
        req.body.paymentMethod || "COD",
        JSON.stringify(req.body.customer || {}),
        new Date().toISOString()
      );

    for (const item of items) {
      db.prepare(
        "UPDATE products SET stock = stock - ? WHERE id = ?"
      ).run(
        item.quantity,
        item.productId
      );
    }

    res.json({
      id: Number(result.lastInsertRowid),
      orderNo,
      total,
      status: "Order Placed"
    });

  } catch (error) {
    console.error("ORDER ERROR:", error);

    res.status(500).json({
      error: "Order failed"
    });
  }
});

/* ---------------- ORDERS LIST ---------------- */

app.get("/api/orders", (_req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders ORDER BY id DESC")
    .all();

  res.json(orders);
});

/* ---------------- GOVERNMENT SCHEMES ---------------- */

app.get("/api/schemes", (_req, res) => {
  res.json({
    demo: true,
    message:
      "Verified government scheme feed configure नहीं है.",
    data: []
  });
});

/* ---------------- FRONTEND ---------------- */

const dist = path.join(
  __dirname,
  "../dist"
);

app.use(express.static(dist));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).end();
  }

  res.sendFile(
    path.join(dist, "index.html")
  );
});

/* ---------------- SERVER ---------------- */

const PORT =
  Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(
    `KisanSaathi AI server running on port ${PORT}`
  );
});
