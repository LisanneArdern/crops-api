const express = require("express");
const db = require("./db");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Crops API",
    endpoints: {
      crops: "/api/crops",
      cropById: "/api/crops/:id"
    }
  });
});

app.get("/api/crops", (req, res) => {
  const crops = db.prepare("SELECT * FROM crops ORDER BY name").all();

  res.json(crops);
});

app.get("/api/crops/:id", (req, res) => {
  const crop = db.prepare("SELECT * FROM crops WHERE id = ?").get(req.params.id);

  if (!crop) {
    return res.status(404).json({ message: "Crop not found" });
  }

  res.json(crop);
});

app.listen(port, () => {
  console.log(`Crops API is running on http://localhost:${port}`);
});
