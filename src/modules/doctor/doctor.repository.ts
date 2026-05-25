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
        weeklyDefault: true,
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
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return prisma.doctorException.findMany({
      where: {
        doctorId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
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

  async upsertWeeklyDefault(doctorId: string, weeklyData: any, nonCustomSchedulesToDelete: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.doctorWeeklyDefault.upsert({
        where: { doctorId },
        update: weeklyData,
        create: { ...weeklyData, doctorId },
      });
      // Clear old non-custom schedules
      await tx.doctorSchedule.deleteMany({
        where: { doctorId, isCustom: false },
      });
    });
  }

  async upsertDaySchedule(doctorId: string, dayOfWeek: number, scheduleData: any, blocks: any[]) {
    return prisma.$transaction(async (tx) => {
      // 1. Upsert Schedule for that day
      const existing = await tx.doctorSchedule.findFirst({
        where: { doctorId, dayOfWeek },
      });

      if (existing) {
        await tx.doctorSchedule.update({
          where: { id: existing.id },
          data: { ...scheduleData, isCustom: true },
        });
      } else {
        await tx.doctorSchedule.create({
          data: { ...scheduleData, doctorId, dayOfWeek, isCustom: true },
        });
      }

      // 2. Refresh blocks for that day
      await tx.doctorAvailabilityBlock.deleteMany({
        where: { doctorId, dayOfWeek },
      });

      if (blocks.length > 0) {
        await tx.doctorAvailabilityBlock.createMany({
          data: blocks.map(b => ({ ...b, doctorId, dayOfWeek })),
        });
      }
    });
  }

  async deleteDaySchedule(doctorId: string, dayOfWeek: number) {
    return prisma.$transaction(async (tx) => {
      await tx.doctorSchedule.deleteMany({
        where: { doctorId, dayOfWeek },
      });
      await tx.doctorAvailabilityBlock.deleteMany({
        where: { doctorId, dayOfWeek },
      });
    });
  }
}
