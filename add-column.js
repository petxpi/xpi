require('dotenv').config({ path: '.env.local' });
const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addColumn() {
  try {
    console.log("Agregando updated_at...");
    await db.execute("ALTER TABLE pets ADD COLUMN updated_at TEXT");
    console.log("✅ Columna updated_at agregada");
  } catch (e) {
    if (e.message.includes("duplicate")) {
      console.log("ℹ️ Ya existe");
    } else {
      console.error("❌ Error:", e.message);
    }
  }
  
  await db.close();
  process.exit(0);
}

addColumn();