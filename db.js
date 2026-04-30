const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "crops.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS crops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    botanical_name TEXT NOT NULL,
    sun TEXT NOT NULL,
    spread_cm INTEGER NOT NULL,
    row_spacing_cm INTEGER NOT NULL,
    description TEXT NOT NULL,
    photo TEXT NOT NULL
  )
`);

module.exports = db;
