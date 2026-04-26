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
      return await prisma.$transaction(async (tx) => {
        // 1. Get or Create Patient (within transaction)
        const patient = await this.patientService.getOrCreatePatient(data.patientData);

        // 2. Validate Doctor exists and is active
        const doctor = await tx.doctor.findUnique({
          where: { id: data.doctorId },
        });

        if (!doctor || doctor.status !== "ACTIVE") {
          throw new AppError("Doctor not found or inactive", 404);
        }

        // 3. Verify slot availability
        // Note: Using getAvailableSlots from DoctorService (which uses doctorRepo)
        // This might perform separate reads, but for simplicity we keep it.
        // In a strictly atomic scenario, we'd replicate the logic here using 'tx'.
        const availableSlots = await this.doctorService.getAvailableSlots(
          data.doctorId,
          data.date
        );

        const targetSlot = availableSlots.find((s) => s.time === data.startTime);
        if (!targetSlot || !targetSlot.available) {
          throw new AppError("Requested slot is no longer available", 400);
        }

        // 4. Fetch schedule for endTime calculation
        const dateObj = new Date(data.date);
        const dayOfWeek = dateObj.getUTCDay(); // Using UTC to be consistent with YYYY-MM-DD input
        const schedule = await tx.doctorSchedule.findFirst({
          where: { doctorId: data.doctorId, dayOfWeek },
        });

        if (!schedule) {
          throw new AppError(`Doctor does not have a schedule configured for ${data.date}`, 400);
        }

        const endTime = this.calculateEndTime(data.startTime, schedule.slotDuration);

        // 5. Generate Token (scoped by doctor and date)
        // Use consistent date boundaries
        const startOfDay = new Date(`${data.date}T00:00:00.000Z`);
        const endOfDay = new Date(`${data.date}T23:59:59.999Z`);

        const currentCount = await tx.appointment.count({
          where: {
            doctorId: data.doctorId,
            date: { gte: startOfDay, lte: endOfDay },
          },
        });
        const token = `T-${(currentCount + 1).toString().padStart(3, "0")}`;

        // 6. DB Unique constraint handles double booking prevention
        return await tx.appointment.create({
          data: {
            doctorId: data.doctorId,
            patientId: patient.id,
            specialization: doctor.specialization,
            department: doctor.department,
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
                age: true,
                gender: true,
                bloodGroup: true,
              },
            },
          },
        });
      }, {
        timeout: 15000,
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
    const appointment = await this.appointmentRepo.findById(id);
    if (!appointment) throw new AppError("Appointment not found", 404);
    
    return this.appointmentRepo.updateStatus(id, "CANCELLED");
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
    const appointment = await this.appointmentRepo.findById(id);
    if (!appointment) throw new AppError("Appointment not found", 404);

    return this.appointmentRepo.updateStatus(id, status);
  }

  private calculateEndTime(start: string, duration: number): string {
    const [hours, minutes] = start.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes + duration;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
}
