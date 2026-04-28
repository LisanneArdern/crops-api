const express = require("express");
const crops = require("./crops.json");

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
  res.json(crops);
});

app.get("/api/crops/:id", (req, res) => {
  const crop = crops.find((item) => item.id === req.params.id);

  if (!crop) {
    return res.status(404).json({ message: "Crop not found" });
  }

  res.json(crop);
});

app.listen(port, () => {
  console.log(`Crops API is running on http://localhost:${port}`);
});
