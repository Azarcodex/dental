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
    // 1. Get or Create Patient
    const patient = await this.patientService.getOrCreatePatient(data.patientData);

    // 2. Validate Doctor exists and get snapshot info
    const doctor = await this.doctorRepo.findById(data.doctorId);
    if (!doctor || doctor.status !== "ACTIVE") {
      throw new AppError("Doctor not found or inactive", 404);
    }

    // 3. Verify slot availability via DoctorService
    const availableSlots = await this.doctorService.getAvailableSlots(
      data.doctorId,
      data.date
    );

    const targetSlot = availableSlots.find(s => s.time === data.startTime);
    
    if (!targetSlot || !targetSlot.available) {
      throw new AppError("Requested slot is no longer available", 400);
    }

    // 4. Fetch schedule for endTime calculation
    const date = new Date(data.date);
    const schedule = await this.doctorRepo.getSchedule(data.doctorId, date.getDay());
    if (!schedule) {
      throw new AppError("Doctor schedule not found for this day", 400);
    }

    const endTime = this.calculateEndTime(data.startTime, schedule.slotDuration);

    // 5. Generate Token (T-001, T-002...) scoped by doctor and date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const currentCount = await prisma.appointment.count({
      where: {
        doctorId: data.doctorId,
        date: { gte: startOfDay, lte: endOfDay }
      }
    });
    const token = `T-${(currentCount + 1).toString().padStart(3, '0')}`;

    // 6. Atomic Booking (DB unique constraint handles race conditions)
    try {
      return await this.appointmentRepo.create({
        doctorId: data.doctorId,
        patientId: patient.id,
        specialization: doctor.specialization,
        department: doctor.department,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime,
        bookingType: data.bookingType || "Online",
        status: "WAITING",
        token,
      });
    } catch (error: any) {
      console.error("CREATE_APPOINTMENT_ERROR", {
        error: error.message,
        code: error.code,
        data: { doctorId: data.doctorId, patientId: patient.id, startTime: data.startTime }
      });
      
      if (error.code === "P2002") {
        throw new AppError("This slot has already been booked by another patient", 409);
      }
      throw new AppError(`Booking failed: ${error.message}`, 500);
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
