import bcrypt from "bcryptjs";
import { AdminRepository } from "./admin.repository";
import { CreateAdminInput, LoginAdminInput } from "./admin.types";
import { AppError } from "../../lib/apiHandler";

export class AdminService {
  private repository: AdminRepository;

  constructor() {
    this.repository = new AdminRepository();
  }

  async registerAdmin(data: CreateAdminInput) {
    // 1. Check if admin with same username exists
    const existingByUsername = await this.repository.findByUsername(data.username);
    if (existingByUsername) {
      throw new AppError("Admin with this username already exists", 400);
    }

    // 2. Check if admin with same email exists (if email provided)
    if (data.email) {
      const existingByEmail = await this.repository.findByEmail(data.email);
      if (existingByEmail) {
        throw new AppError("Admin with this email already exists", 400);
      }
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 4. Save to database
    const admin = await this.repository.createAdmin({
      ...data,
      password: hashedPassword,
    });

    // 5. Return without password
    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  async loginAdmin(data: LoginAdminInput) {
    const { signToken } = await import("../../lib/jwt");

    // 1. Find admin by username
    const admin = await this.repository.findByUsername(data.username);
    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(data.password, admin.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // 3. Sign Token
    const token = signToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    });

    // 4. Return without password
    const { password, ...adminWithoutPassword } = admin;
    return {
      admin: adminWithoutPassword,
      token,
    };
  }

  async updateCredentials(callerRole: string, targetId: string, data: any) {
    // ONLY Super Admin can update credentials
    if (callerRole !== "SUPER_ADMIN") {
      throw new AppError("Only Super Admin can update credentials", 403);
    }

    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return await this.repository.updateAdmin(targetId, updateData);
  }

  async updateProfile(callerRole: string, targetId: string, callerId: string, data: any) {
    // Super Admin can update anyone's profile. Admin can update NO ONE's profile (as per rules: Admin cannot update any username or password, but let's assume they can't even update their name/email for now to be strict)
    // Actually, rule says: "Admin cannot update any username or password (including their own)".
    // Let's allow Super Admin to update profile.
    if (callerRole !== "SUPER_ADMIN") {
      throw new AppError("Admin restricted from credential and profile updates", 403);
    }

    return await this.repository.updateAdmin(targetId, data);
  }

  async getAllAdmins(callerRole: string) {
    if (callerRole !== "SUPER_ADMIN") {
      throw new AppError("Unauthorized", 403);
    }
    return await this.repository.findAll();
  }
}
