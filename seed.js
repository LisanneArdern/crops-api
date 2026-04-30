const db = require("./db");
const crops = require("./crops.seed.json");

const insertCrop = db.prepare(`
  INSERT INTO crops (
    id,
    name,
    botanical_name,
    sun,
    spread_cm,
    row_spacing_cm,
    description,
    photo
  )
  VALUES (
    @id,
    @name,
    @botanical_name,
    @sun,
    @spread_cm,
    @row_spacing_cm,
    @description,
    @photo
  )
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    botanical_name = excluded.botanical_name,
    sun = excluded.sun,
    spread_cm = excluded.spread_cm,
    row_spacing_cm = excluded.row_spacing_cm,
    description = excluded.description,
    photo = excluded.photo
`);

const seedCrops = db.transaction((items) => {
  for (const crop of items) {
    insertCrop.run(crop);
  }
});

seedCrops(crops);

console.log(`Seeded ${crops.length} crops.`);
