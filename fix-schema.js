const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function fixSchema() {
  const columns = [
    { name: "photo_url", type: "TEXT" },
    { name: "updated_at", type: "TEXT" },
  ];

  for (const col of columns) {
    try {
      console.log(`Agregando columna ${col.name}...`);
      await db.execute(`ALTER TABLE pets ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✅ ${col.name} agregada`);
    } catch (error) {
      if (error.message.includes("duplicate column")) {
        console.log(`ℹ️ ${col.name} ya existe`);
      } else {
        console.error(`❌ Error con ${col.name}:`, error.message);
      }
    }
  }

  await db.close();
  console.log("\n✅ Base de datos actualizada");
  process.exit(0);
}

fixSchema();