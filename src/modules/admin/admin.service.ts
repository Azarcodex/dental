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
    // 1. Check if admin already exists
    const existingAdmin = await this.repository.findByEmail(data.email);
    if (existingAdmin) {
      throw new AppError("Admin with this email already exists", 400);
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Save to database
    const admin = await this.repository.createAdmin({
      ...data,
      password: hashedPassword,
    });

    // 4. Return without password
    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  async loginAdmin(data: LoginAdminInput) {
    const { signToken } = await import("../../lib/jwt");

    // 1. Find admin
    const admin = await this.repository.findByEmail(data.email);
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
      email: admin.email,
      role: admin.role,
    });

    // 4. Return without password
    const { password, ...adminWithoutPassword } = admin;
    return {
      admin: adminWithoutPassword,
      token,
    };
  }
}
