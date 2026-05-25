import prisma from "../../lib/prisma";

export class AppointmentRepository {
  async findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
    });
  }

  async findDashboardAppointments(filters: { date: Date; doctorId?: string; status?: string }) {
    const startOfDay = new Date(filters.date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(filters.doctorId && { doctorId: filters.doctorId }),
        ...(filters.status && filters.status !== "ALL" && { status: filters.status }),
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        patient: {
          select: {
            fullName: true,
            phone: true,
            displayId: true,
            gender: true,
            age: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });
  }

  async findByPatientId(patientId: string) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          }
        }
      },
      orderBy: { date: "desc" },
    });
  }

  async create(data: any) {
    return prisma.appointment.create({
      data,
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        patient: {
          select: {
            fullName: true,
            phone: true,
            displayId: true,
            gender: true,
            age: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }

  async getDashboardCounts(date: Date, doctorId?: string) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const where = {
      date: { gte: startOfDay, lte: endOfDay },
      ...(doctorId && { doctorId }),
    };

    const [total, pending, waiting, done] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.count({ where: { ...where, status: "PENDING" } }),
      prisma.appointment.count({ where: { ...where, status: "WAITING" } }),
      prisma.appointment.count({ where: { ...where, status: "DONE" } }),
    ]);

    return { total, pending, waiting, done };
  }

  async getAppointmentsByDate(doctorId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELLED" }
      },
      select: { startTime: true }
    });
  }
}
