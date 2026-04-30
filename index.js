const express = require("express");
const db = require("./db");

const app = express();
const port = process.env.PORT || 4000;

function normalizeSearchValue(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getSearchWords(value) {
  return normalizeSearchValue(value).split(" ").filter(Boolean);
}

function getLevenshteinDistance(firstValue, secondValue) {
  const first = normalizeSearchValue(firstValue);
  const second = normalizeSearchValue(secondValue);
  const distances = Array.from({ length: first.length + 1 }, (_, index) => [
    index
  ]);

  for (let column = 1; column <= second.length; column += 1) {
    distances[0][column] = column;
  }

  for (let row = 1; row <= first.length; row += 1) {
    for (let column = 1; column <= second.length; column += 1) {
      const substitutionCost = first[row - 1] === second[column - 1] ? 0 : 1;
      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + substitutionCost
      );
    }
  }

  return distances[first.length][second.length];
}

function getTypoTolerance(searchTerm) {
  if (searchTerm.length < 4) {
    return 0;
  }

  return searchTerm.length < 7 ? 1 : 2;
}

function getCropMatchScore(crop, searchTerm) {
  const normalizedTerm = normalizeSearchValue(searchTerm);
  const searchableText = normalizeSearchValue(
    `${crop.name} ${crop.botanical_name}`
  );

  if (!normalizedTerm || searchableText.includes(normalizedTerm)) {
    return 0;
  }

  const tolerance = getTypoTolerance(normalizedTerm);
  const words = getSearchWords(searchableText);
  const closestDistance = Math.min(
    ...words.map(word => getLevenshteinDistance(normalizedTerm, word))
  );

  return closestDistance <= tolerance ? closestDistance : null;
}

function getSearchTerm(query) {
  const searchTerm = query.search || query.filter || "";

  if (Array.isArray(searchTerm) || typeof searchTerm !== "string") {
    const error = new Error("Search term must be a single string.");
    error.status = 400;
    throw error;
  }

  return searchTerm.trim();
}

function handleRoute(routeHandler) {
  return (req, res, next) => {
    try {
      routeHandler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get("/", handleRoute((req, res) => {
  res.json({
    message: "Crops API",
    endpoints: {
      crops: "/api/crops?search=tomato",
      cropById: "/api/crops/:id"
    }
  });
}));

app.get("/api/crops", handleRoute((req, res) => {
  const searchTerm = getSearchTerm(req.query);
  const crops = db.prepare("SELECT * FROM crops ORDER BY name").all();
  const filteredCrops = searchTerm
    ? crops
        .map(crop => ({
          crop,
          score: getCropMatchScore(crop, searchTerm)
        }))
        .filter(({ score }) => score !== null)
        .sort((first, second) => {
          if (first.score !== second.score) {
            return first.score - second.score;
          }

          return first.crop.name.localeCompare(second.crop.name);
        })
        .map(({ crop }) => crop)
    : crops;

  res.json(filteredCrops);
}));

app.get("/api/crops/:id", handleRoute((req, res) => {
  const crop = db.prepare("SELECT * FROM crops WHERE id = ?").get(req.params.id);

  if (!crop) {
    return res.status(404).json({ message: "Crop not found" });
  }

  res.json(crop);
}));

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.use((error, req, res, next) => {
  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    message: status >= 500 ? "Something went wrong." : error.message
  });
});

app.listen(port, () => {
  console.log(`Crops API is running on http://localhost:${port}`);
});
