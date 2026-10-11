const { createClient } = require("@libsql/client");

// Reemplazá estos valores con los de tu .env.local
const db = createClient({
  url: "libsql://xpipet-petxpi.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEwNzIzODYsImlkIjoiMDFhMGUwYWItMzgwMS03YjVhLTg3ZTYtMGE5YjQxMGRmMWRmIiwia2lkIjoidnJDVlBKVEphUnNSdjM4QWFBQWNlVmlzZ29EMUtTRnE5TnBmUlZXSEd5SSIsInJpZCI6ImVkODgwM2M3LTFlMjItNDRkYi1iNDQ3LTliZjk1ZjViZmFlYiJ9.FYjff7_LdGQ4KpkxcL8kkGNvpdvs-xCbgSFgsuOOiK8o24IDJsEOfMxS5foMoQBJ2k7Gj6Gg0LuGUkXTMiu6Aw",
});

async function fix() {
  try {
    console.log("Agregando photo_url...");
    await db.execute("ALTER TABLE pets ADD COLUMN photo_url TEXT");
    console.log("✅ photo_url agregada");
  } catch (e) {
    console.log("photo_url:", e.message);
  }

  try {
    console.log("Agregando updated_at...");
    await db.execute("ALTER TABLE pets ADD COLUMN updated_at TEXT");
    console.log("✅ updated_at agregada");
  } catch (e) {
    console.log("updated_at:", e.message);
  }

  await db.close();
  console.log("Listo");
  process.exit(0);
}

fix();