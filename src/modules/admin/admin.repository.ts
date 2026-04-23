import prisma from "../../lib/prisma";
import { CreateAdminInput } from "./admin.types";

export class AdminRepository {
  async createAdmin(data: CreateAdminInput) {
    return await prisma.admin.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return await prisma.admin.findUnique({
      where: { email },
    });
  }
}
