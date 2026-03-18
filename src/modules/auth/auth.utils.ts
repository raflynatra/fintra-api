import { UserDatabaseRow } from "../user";

/**
 * Format database row dates to ISO strings
 *
 * @param user - User data from database
 * @returns User data with formatted dates
 *
 * Why? PostgreSQL returns Date objects, but we want ISO strings for JSON responses
 */
export function formatUserDates(
  user: Omit<UserDatabaseRow, "password" | "is_deleted">,
): {
  id: string;
  email: string;
  name: string;
  status: "0" | "1";
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    createdAt: user.created_at.toISOString(),
    updatedAt: user.updated_at.toISOString(),
  };
}
