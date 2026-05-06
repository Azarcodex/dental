import prisma from "../../lib/prisma";
import { CreateAdminInput } from "./admin.types";

export class AdminRepository {
  async createAdmin(data: CreateAdminInput) {
    return await prisma.admin.create({
      data: {
        ...data,
        email: data.email || null,
      },
    });
  }

  async findByEmail(email: string) {
    return await prisma.admin.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return await prisma.admin.findUnique({
      where: { username },
    });
  }

  async findById(id: string) {
    return await prisma.admin.findUnique({
      where: { id },
    });
  }

  async updateAdmin(id: string, data: any) {
    return await prisma.admin.update({
      where: { id },
      data,
    });
  }

  async findAll() {
    return await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteAdmin(id: string) {
    return await prisma.admin.delete({
      where: { id },
    });
  }
}
