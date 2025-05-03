// db.js (Refactored for robust SQLite usage)

import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
SQLite.DEBUG(true);

let dbInstance = null;

export async function initDB() {
  if (dbInstance) return dbInstance;

  try {
    dbInstance = await SQLite.openDatabase({ name: 'figures.db', location: 'default' });

    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS figures (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        series TEXT,
        year INTEGER,
        manufacturer TEXT,
        purchase_price REAL,
        notes TEXT,
        photo_uri TEXT,
        description TEXT,
        theme TEXT,
        country TEXT,
        size TEXT,
        release_date TEXT,
        asst_number TEXT,
        model_number TEXT,
        packaging TEXT,
        quantity INTEGER
      );
    `);

    console.log('✅ DB initialized');
    return dbInstance;
  } catch (error) {
    console.error('❌ Failed to initialize DB:', error);
    throw error;
  }
}

export async function getDB() {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

export async function insertFigure(
  name, series, year, manufacturer, purchasePrice, notes, photoUri,
  description, theme, country, size, releaseDate, asstNumber, modelNumber, packaging, quantity
) {
  const db = await getDB();
  return db.executeSql(
    `INSERT INTO figures (
      name, series, year, manufacturer, purchase_price, notes, photo_uri,
      description, theme, country, size, release_date, asst_number, model_number, packaging, quantity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, series, year, manufacturer, purchasePrice, notes, photoUri,
      description, theme, country, size, releaseDate, asstNumber, modelNumber, packaging, quantity
    ]
  );
}

export async function fetchFigures() {
  const db = await getDB();
  const [result] = await db.executeSql('SELECT * FROM figures;');
  return result.rows.raw();
}

export async function fetchFigureById(id) {
  const db = await getDB();
  const [result] = await db.executeSql('SELECT * FROM figures WHERE id = ?;', [id]);
  return result.rows.length > 0 ? result.rows.item(0) : null;
}

export async function updateFigure(
  id, name, series, year, manufacturer, purchasePrice, notes, photoUri,
  description, theme, country, size, releaseDate, asstNumber, modelNumber, packaging, quantity
) {
  const db = await getDB();
  return db.executeSql(
    `UPDATE figures SET
      name = ?, series = ?, year = ?, manufacturer = ?, purchase_price = ?, notes = ?, photo_uri = ?,
      description = ?, theme = ?, country = ?, size = ?, release_date = ?, asst_number = ?, model_number = ?, packaging = ?, quantity = ?
      WHERE id = ?`,
    [
      name, series, year, manufacturer, purchasePrice, notes, photoUri,
      description, theme, country, size, releaseDate, asstNumber, modelNumber, packaging, quantity,
      id
    ]
  );
}

export async function deleteFigure(id) {
  const db = await getDB();
  return db.executeSql('DELETE FROM figures WHERE id = ?;', [id]);
}

export async function bulkInsertFigures(figures) {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      figures.forEach(f => {
        tx.executeSql(
          `INSERT INTO figures (
            name, series, year, manufacturer, purchase_price, notes, photo_uri,
            description, theme, country, size, release_date, asst_number, model_number, packaging, quantity
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            f.name, f.series, f.year, f.manufacturer, f.purchase_price, f.notes, f.photo_uri,
            f.description, f.theme, f.country, f.size, f.release_date, f.asst_number, f.model_number, f.packaging, f.quantity
          ]
        );
      });
    }, reject, resolve);
  });
}

export async function resetDatabase() {
  const db = await getDB();
  await db.executeSql('DROP TABLE IF EXISTS figures;');
  dbInstance = null; // Force reinitialization
  await initDB();     // Now it will recreate the table
  console.log('🧨 Database reset and reinitialized');
}

