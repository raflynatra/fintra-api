import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

const NODE_ENV = process.env.NODE_ENV || "development";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Handle pool errors
 * This catches errors on idle connections (e.g., network issues)
 * Without this handler, the app would crash on connection errors
 */
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

/**
 * Handle successful connections
 * Useful for debugging connection issues
 */
pool.on("connect", () => {
  if (NODE_ENV === "development") {
    console.log("📦 Database connection established");
  }
});

/**
 * Handle connection removal from pool
 * Useful for monitoring pool health
 */
pool.on("remove", () => {
  if (NODE_ENV === "development") {
    console.log("🔌 Database connection removed from pool");
  }
});

/**
 * Test database connection
 *
 * Use this to verify the database is accessible before starting the server
 * @returns Promise that resolves if connection is successful
 * @throws Error if connection fails
 */
export async function testConnection(): Promise<void> {
  try {
    const client = await pool.connect();

    await client.query("SELECT NOW()");

    client.release();

    console.log("✅ Database connection test successful");
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    throw error;
  }
}

/**
 * Close all database connections
 *
 * Call this when shutting down the application gracefully
 * Ensures all database connections are properly closed
 */
export async function closeConnection(): Promise<void> {
  try {
    await pool.end();
    console.log("✅ All database connections closed");
  } catch (error) {
    console.error("❌ Error closing database connections:", error);
    throw error;
  }
}

export default pool;
