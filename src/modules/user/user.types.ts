export interface CreateUserRequest {
  name: string;
  email: string;
  password?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  status?: "0" | "1";
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  status: "0" | "1";
  createdAt: string;
}

export interface UserDatabaseRow {
  id: string;
  email: string;
  name: string;
  password: string;
  status: "0" | "1"; // '1' = active, '0' = inactive
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}
