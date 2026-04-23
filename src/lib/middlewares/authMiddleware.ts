import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { AppError } from "@/lib/apiHandler";

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

export async function authenticateAdmin(req: NextRequest): Promise<AuthenticatedAdmin> {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    throw new AppError("Unauthorized - No token provided", 401);
  }

  const decoded = verifyToken(token) as AuthenticatedAdmin | null;

  if (!decoded) {
    throw new AppError("Unauthorized - Invalid or expired token", 401);
  }

  return decoded;
}

export function authorizeRole(admin: AuthenticatedAdmin, roles: string[]) {
  if (!roles.includes(admin.role)) {
    throw new AppError("Forbidden - Insufficient permissions", 403);
  }
}
