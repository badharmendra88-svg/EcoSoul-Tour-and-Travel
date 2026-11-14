// One-time copy of the old SQLite database (prisma/dev.db) into PostgreSQL.
// Run after `npm run db:deploy` has created the tables, against an EMPTY database:
//   node scripts/sqlite-to-postgres.mjs [path/to/dev.db]
// Uses DIRECT_URL (Neon: the URL without "-pooler"), else DATABASE_URL. Everything is
// copied in one transaction, so a failure leaves the database as it was.
import "dotenv/config";
import Database from "better-sqlite3";
import pg from "pg";

const file = process.argv[2] || "prisma/dev.db";
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url?.startsWith("postgres")) throw new Error("Set DATABASE_URL (or DIRECT_URL) to the PostgreSQL database.");

const lite = new Database(file, { readonly: true, fileMustExist: true });
const db = new pg.Client({ connectionString: url });
await db.connect();
const q = (name) => `"${name.replace(/"/g, '""')}"`;

// Column types on the PostgreSQL side decide how SQLite values are converted
const { rows: cols } = await db.query(
  `SELECT table_name, column_name, data_type FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'`,
);
const tables = new Map();
for (const c of cols) {
  if (!tables.has(c.table_name)) tables.set(c.table_name, new Map());
  tables.get(c.table_name).set(c.column_name, c.data_type);
}

// Parents before children (foreign keys)
const { rows: fks } = await db.query(
  `SELECT tc.table_name AS child, ccu.table_name AS parent
   FROM information_schema.table_constraints tc
   JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'`,
);
const order = [];
const visit = (t, seen = new Set()) => {
  if (order.includes(t) || seen.has(t)) return;
  seen.add(t);
  for (const f of fks) if (f.child === t && f.parent !== t) visit(f.parent, seen);
  order.push(t);
};
[...tables.keys()].sort().forEach((t) => visit(t));

const convert = (v, type) => {
  if (v === null || v === undefined) return null;
  if (type === "boolean") return v === 1 || v === "1" || v === true || v === "true";
  if (type.startsWith("timestamp")) return new Date(typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v);
  return v;
};

const liteTables = new Set(lite.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((r) => r.name));
for (const t of order) {
  const { rows } = await db.query(`SELECT 1 FROM ${q(t)} LIMIT 1`);
  if (rows.length) throw new Error(`Table ${t} already has rows: run this only against an empty database.`);
}

await db.query("BEGIN");
try {
  for (const t of order) {
    if (!liteTables.has(t)) { console.log(`${t}: not in SQLite, skipped`); continue; }
    const types = tables.get(t);
    const rows = lite.prepare(`SELECT * FROM ${q(t)}`).all();
    for (const row of rows) {
      const names = Object.keys(row).filter((n) => types.has(n));
      const sql = `INSERT INTO ${q(t)} (${names.map(q).join(", ")}) VALUES (${names.map((_, i) => `$${i + 1}`).join(", ")})`;
      await db.query(sql, names.map((n) => convert(row[n], types.get(n))));
    }
    console.log(`${t}: ${rows.length}`);
  }
  await db.query("COMMIT");
  console.log("Done.");
} catch (e) {
  await db.query("ROLLBACK");
  throw e;
} finally {
  await db.end();
  lite.close();
}
