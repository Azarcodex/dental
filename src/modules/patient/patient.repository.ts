import prisma from "../../lib/prisma";
import { CreatePatientInput, UpdatePatientInput } from "./patient.types";

export class PatientRepository {
  async create(data: CreatePatientInput & { displayId?: string }) {
    return prisma.patient.create({
      data,
    });
  }

  async findAll() {
    return prisma.patient.findMany({
      include: {
        appointments: {
          include: { doctor: true },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByPhone(phone: string) {
    return prisma.patient.findUnique({
      where: { phone },
      include: {
        appointments: {
          include: { doctor: true },
          orderBy: { date: "desc" },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: { doctor: true },
          orderBy: { date: "desc" },
        },
      },
    });
  }

  async findLastDisplayId() {
    return prisma.patient.findFirst({
      where: { displayId: { startsWith: "P-" } },
      orderBy: { displayId: "desc" },
      select: { displayId: true },
    });
  }

  async update(id: string, data: UpdatePatientInput) {
    return prisma.patient.update({
      where: { id },
      data,
      include: { appointments: true },
    });
  }

  async findBySearch(query: string) {
    return prisma.patient.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { displayId: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        appointments: {
          include: { doctor: true },
          orderBy: { date: "desc" },
        },
      },
      take: 20,
    });
  }
}
