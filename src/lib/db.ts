import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function query(sql: string, params: any[] = []): Promise<any> {
  const result = await db.execute({ sql, args: params });
  return result;
}

export { db };
export default db;