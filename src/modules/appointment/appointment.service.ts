import { AppointmentRepository } from "./appointment.repository";
import { DoctorRepository } from "../doctor/doctor.repository";
import { DoctorService } from "../doctor/doctor.service";
import { PatientService } from "../patient/patient.service";
import { AppError } from "../../lib/apiHandler";
import { CreateAppointmentInput } from "./appointment.types";
import prisma from "../../lib/prisma";

export class AppointmentService {
  private appointmentRepo: AppointmentRepository;
  private doctorRepo: DoctorRepository;
  private doctorService: DoctorService;
  private patientService: PatientService;

  constructor() {
    this.appointmentRepo = new AppointmentRepository();
    this.doctorRepo = new DoctorRepository();
    this.doctorService = new DoctorService();
    this.patientService = new PatientService();
  }

  async createAppointment(data: CreateAppointmentInput) {
    try {
      // 1. Verify slot availability BEFORE starting the transaction
      // This is a read-only check and doesn't need to hold a transaction lock
      const availableSlots = await this.doctorService.getAvailableSlots(
        data.doctorId,
        data.date
      );

      const targetSlot = availableSlots.find((s) => s.time === data.startTime);
      if (!targetSlot || !targetSlot.available) {
        throw new AppError("Requested slot is no longer available", 400);
      }

      return await prisma.$transaction(async (tx) => {
        // 2. Get or Create Patient INSIDE the transaction
        let patient = await tx.patient.findUnique({
          where: { phone: data.patientData.phone },
        });

        if (patient) {
          // Update existing patient with latest details
          patient = await tx.patient.update({
            where: { id: patient.id },
            data: {
              fullName: data.patientData.fullName,
              gender: data.patientData.gender,
              age: data.patientData.age,
            },
          });
        } else {
          // Generate display ID
          const lastPatient = await tx.patient.findFirst({
            where: { displayId: { startsWith: "P-" } },
            orderBy: { displayId: "desc" },
            select: { displayId: true },
          });
          let nextId = "P-001";
          if (lastPatient?.displayId) {
            const currentNum = parseInt(lastPatient.displayId.replace("P-", ""));
            nextId = `P-${(currentNum + 1).toString().padStart(3, "0")}`;
          }

          patient = await tx.patient.create({
            data: {
              fullName: data.patientData.fullName,
              phone: data.patientData.phone,
              gender: data.patientData.gender,
              age: data.patientData.age,
              displayId: nextId,
            },
          });
        }

        // 3. Validate Doctor exists and is active
        const doctor = await tx.doctor.findUnique({
          where: { id: data.doctorId },
          include: {
            schedules: true,
            weeklyDefault: true,
          },
        });

        if (!doctor || doctor.status !== "ACTIVE") {
          throw new AppError("Doctor not found or inactive", 404);
        }

        // 4. Re-check slot availability within transaction (double-booking guard)
        const startOfDay = new Date(`${data.date}T00:00:00.000Z`);
        const endOfDay = new Date(`${data.date}T23:59:59.999Z`);

        const existingBooking = await tx.appointment.findFirst({
          where: {
            doctorId: data.doctorId,
            date: { gte: startOfDay, lte: endOfDay },
            startTime: data.startTime,
            status: { not: "CANCELLED" },
          },
        });

        if (existingBooking) {
          throw new AppError("This time slot has already been booked. Please pick another time.", 409);
        }

        // 5. Get active schedule for endTime calculation
        const dateObj = new Date(`${data.date}T00:00:00.000Z`);
        const dayOfWeek = dateObj.getUTCDay();

        const customSchedule = doctor.schedules.find(
          (s) => s.dayOfWeek === dayOfWeek && s.isCustom
        );

        let slotDuration: number;
        if (customSchedule) {
          slotDuration = customSchedule.slotDuration;
        } else if (
          doctor.weeklyDefault &&
          doctor.weeklyDefault.activeDays.split(",").map(Number).includes(dayOfWeek)
        ) {
          slotDuration = doctor.weeklyDefault.slotDuration;
        } else {
          throw new AppError(`Doctor does not have a schedule configured for ${data.date}`, 400);
        }

        const endTime = this.calculateEndTime(data.startTime, slotDuration);

        // 6. Generate Token (scoped by doctor and date)
        const currentCount = await tx.appointment.count({
          where: {
            doctorId: data.doctorId,
            date: { gte: startOfDay, lte: endOfDay },
          },
        });
        const token = `T-${(currentCount + 1).toString().padStart(3, "0")}`;

        // 7. Create appointment
        const appointment = await tx.appointment.create({
          data: {
            doctorId: data.doctorId,
            patientId: patient.id,
            specialization: doctor.specialization,
            date: startOfDay,
            startTime: data.startTime,
            endTime,
            bookingType: data.bookingType || "Online",
            status: "WAITING",
            token,
          },
          include: {
            doctor: {
              select: { firstName: true, lastName: true, profilePhoto: true },
            },
            patient: {
              select: {
                fullName: true,
                phone: true,
                displayId: true,
                gender: true,
              },
            },
          },
        });

        // 8. Trigger real-time notification to admin
        try {
          const { pusherServer } = await import("../../lib/pusher");
          await pusherServer.trigger("admin-notifications", "new-appointment", {
            patientName: patient.fullName,
            doctorName: `Dr. ${doctor.lastName}`,
            time: data.startTime,
            token: token
          });
        } catch (pusherError) {
          // Don't fail the whole booking if notification fails
          console.error("PUSHER_TRIGGER_ERROR", pusherError);
        }

        return appointment;
      }, {
        timeout: 30000,
        maxWait: 15000,
      });
    } catch (error: any) {
      console.error("CREATE_APPOINTMENT_ERROR_DETAIL", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        data: { doctorId: data.doctorId, startTime: data.startTime, date: data.date }
      });

      if (error instanceof AppError) throw error;

      // Handle Prisma Unique Constraint Violations
      if (error.code === "P2002") {
        const target = error.meta?.target || [];
        if (target.includes("startTime")) {
          throw new AppError("This time slot has just been booked by someone else. Please pick another time.", 409);
        }
        if (target.includes("token")) {
          throw new AppError("A booking conflict occurred. Please try again in a moment.", 409);
        }
        throw new AppError("This slot or token is already booked.", 409);
      }

      // Handle Transaction Failures
      if (error.message?.includes("Transaction")) {
        throw new AppError("The booking could not be completed due to a temporary conflict. Please try again.", 409);
      }

      throw new AppError(`Booking process failed: ${error.message || "Unknown error"}`, 500);
    }
  }

  async cancelAppointment(id: string) {
    return this.updateStatus(id, "CANCELLED");
  }

  async getAppointmentsByPatient(patientId: string) {
    return this.appointmentRepo.findByPatientId(patientId);
  }

  async getDashboardData(filters: { date: string; doctorId?: string; status?: string }) {
    const date = new Date(filters.date);
    return this.appointmentRepo.findDashboardAppointments({
      date,
      doctorId: filters.doctorId,
      status: filters.status,
    });
  }

  async getDashboardStats(dateStr: string, doctorId?: string) {
    const date = new Date(dateStr);
    return this.appointmentRepo.getDashboardCounts(date, doctorId);
  }

  async updateStatus(id: string, status: string) {
    return await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id },
      });
      if (!appointment) {
        throw new AppError("Appointment not found", 404);
      }

      if (appointment.status === "DONE") {
        throw new AppError("Cannot change status of a completed appointment", 400);
      }
      if (appointment.status === "CANCELLED") {
        throw new AppError("Cannot change status of a cancelled appointment", 400);
      }

      return tx.appointment.update({
        where: { id },
        data: { status },
      });
    });
  }

  private calculateEndTime(start: string, duration: number): string {
    const [hours, minutes] = start.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes + duration;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
}
