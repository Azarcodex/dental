import { prisma } from "../../lib/prisma";

export class StatsService {
  async getDashboardStats() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const [doctorsCount, patientsCount, todayAppointmentsCount] = await Promise.all([
        prisma.doctor.count(),
        prisma.patient.count(),
        prisma.appointment.count({
          where: {
            date: {
              gte: todayStart,
              lte: todayEnd,
            },
            status: "BOOKED",
          },
        }),
      ]);

      const upcomingAppointmentsCount = await prisma.appointment.count({
        where: {
          date: {
            gt: todayEnd,
          },
          status: "BOOKED",
        },
      });

      return {
        doctors: doctorsCount,
        patients: patientsCount,
        todayAppointments: todayAppointmentsCount,
        upcomingAppointments: upcomingAppointmentsCount,
      };
    } catch (error) {
      console.error("Dashboard Stats Error:", error);
      throw error;
    }
  }
}
