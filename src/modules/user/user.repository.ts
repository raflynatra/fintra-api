import { pool } from "@/configs/db";
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserDatabaseRow,
} from "./user.types";

export class UserRepository {
  async findAllActive(): Promise<Omit<UserDatabaseRow, "password">[]> {
    const query = `
      SELECT id, email, name, status, created_at, updated_at
      FROM users
      WHERE status = '1'
    `;

    const { rows } = await pool.query<Omit<UserDatabaseRow, "password">>(query);
    return rows;
  }

  async findById(id: string): Promise<Omit<UserDatabaseRow, "password">> {
    const query = `
      SELECT id, email, name, status, created_at, updated_at
      FROM users
      WHERE id = $1 AND status = '1'
    `;

    const { rows } = await pool.query<Omit<UserDatabaseRow, "password">>(
      query,
      [id],
    );
    return rows[0] ?? null;
  }

  /**
   * Find a user by their email address
   *
   * @param email - User's email address
   * @returns User data without password, or null if not found
   */
  async findByEmail(
    email: string,
  ): Promise<Omit<UserDatabaseRow, "password"> | null> {
    const query = `
      SELECT id, email, name, status, created_at, updated_at
      FROM users
      WHERE email = $1 AND status = '1'
    `;

    const result = await pool.query<Omit<UserDatabaseRow, "password">>(query, [
      email,
    ]);

    return result.rows[0] || null;
  }

  /**
   * Find a user with password for authentication
   *
   * @param email - User's email address
   * @returns User data including password, or null if not found
   */
  async findByEmailWithPassword(
    email: string,
  ): Promise<UserDatabaseRow | null> {
    const query = `
      SELECT id, email, name, password, status, created_at, updated_at
      FROM users
      WHERE email = $1 AND status = '1'
    `;

    const result = await pool.query<UserDatabaseRow>(query, [email]);

    return result.rows[0] || null;
  }

  /**
   * Check if a user exists with the given email
   *
   * @param email - Email to check
   * @returns true if user exists, false otherwise
   */
  async checkEmailExists(email: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM users WHERE email = $1
      ) as exists
    `;

    const result = await pool.query<{ exists: boolean }>(query, [email]);

    return result.rows[0].exists;
  }

  /**
   * Create a new user in the database
   *
   * @param userData - User registration data (email, name, hashed password)
   * @returns The newly created user data (without password)
   */
  async create(
    payload: CreateUserRequest & { password: string },
  ): Promise<Omit<UserDatabaseRow, "password">> {
    const query = `
      INSERT INTO users (email, name, password, status, created_at, updated_at)
      VALUES ($1, $2, $3, '1', NOW(), NOW())
      RETURNING id, email, name, status, created_at, updated_at
    `;

    const { rows } = await pool.query<Omit<UserDatabaseRow, "password">>(
      query,
      [payload.email, payload.name, payload.password],
    );

    return rows[0];
  }

  async updateById(
    id: string,
    payload: UpdateUserRequest,
  ): Promise<Omit<UserDatabaseRow, "password">> {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (payload.name) {
      fields.push(`name = $${index++}`);
      values.push(payload.name);
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    const query = `
      UPDATE users
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${index}
      RETURNING
        id,
        email,
        name,
        status,
        created_at,
        updated_at
    `;

    const { rows } = await pool.query<Omit<UserDatabaseRow, "password">>(
      query,
      [...values, id],
    );

    return rows[0];
  }

  async delete(id: string): Promise<Omit<UserDatabaseRow, "password">> {
    if (!id) throw new Error("No fields to push");

    const query = `
      UPDATE users
      SET status = '0', is_deleted = true
      WHERE id = $1
      RETURNING
        id,
        email,
        name,
        status,
        created_at,
        updated_at
    `;

    const { rows } = await pool.query<Omit<UserDatabaseRow, "password">>(
      query,
      [id],
    );

    return rows[0];
  }
}
