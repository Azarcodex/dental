import prisma from "../../lib/prisma";

export class DoctorRepository {
  async findAll() {
    return prisma.doctor.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.doctor.findUnique({
      where: { id },
      include: {
        schedules: true,
        blocks: true,
        exceptions: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.doctor.update({
      where: { id },
      data,
    });
  }

  async getSchedule(doctorId: string, dayOfWeek: number) {
    return prisma.doctorSchedule.findFirst({
      where: { doctorId, dayOfWeek },
    });
  }

  async getAvailabilityBlocks(doctorId: string, dayOfWeek: number) {
    return prisma.doctorAvailabilityBlock.findMany({
      where: { doctorId, dayOfWeek },
    });
  }

  async getExceptions(doctorId: string, date: Date) {
    return prisma.doctorException.findMany({
      where: {
        doctorId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lte: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });
  }

  async create(data: any) {
    return prisma.doctor.create({
      data,
    });
  }

  async createSchedule(data: any) {
    return prisma.doctorSchedule.create({
      data,
    });
  }

  async createBlock(data: any) {
    return prisma.doctorAvailabilityBlock.create({
      data,
    });
  }

  async createException(data: any) {
    return prisma.doctorException.create({
      data,
    });
  }

  async setCompleteSchedule(doctorId: string, schedules: any[], blocks: any[]) {
    return prisma.$transaction([
      // 1. Clear existing weekly config
      prisma.doctorSchedule.deleteMany({ where: { doctorId } }),
      prisma.doctorAvailabilityBlock.deleteMany({ where: { doctorId } }),

      // 2. Create new weekly config
      prisma.doctorSchedule.createMany({
        data: schedules.map((s) => ({ ...s, doctorId })),
      }),
      prisma.doctorAvailabilityBlock.createMany({
        data: blocks.map((b) => ({ ...b, doctorId })),
      }),
    ]);
  }
}
