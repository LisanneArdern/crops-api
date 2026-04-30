# Crops API

Small Express API for Harvestly crop data.

## Setup

```sh
npm install
npm run seed
npm run dev
```

The API runs on `http://localhost:4000` by default. Set `PORT` to use another port.

## Endpoints

- `GET /api/crops` lists all crops.
- `GET /api/crops?search=tomato` searches by common or botanical name.
- `GET /api/crops/:id` returns one crop.

Set `CORS_ORIGIN` if you want to restrict browser access to a specific frontend origin.
