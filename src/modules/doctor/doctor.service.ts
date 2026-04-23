import { DoctorRepository } from "./doctor.repository";
import { AppointmentRepository } from "../appointment/appointment.repository";
import { AppError } from "../../lib/apiHandler";

export class DoctorService {
  private doctorRepo: DoctorRepository;
  private appointmentRepo: AppointmentRepository;

  constructor() {
    this.doctorRepo = new DoctorRepository();
    this.appointmentRepo = new AppointmentRepository();
  }

  async getAllDoctors() {
    return this.doctorRepo.findAll();
  }

  async getDoctorById(id: string) {
    const doctor = await this.doctorRepo.findById(id);
    if (!doctor) throw new AppError("Doctor not found", 404);
    return doctor;
  }

  async updateDoctor(id: string, data: any) {
    return this.doctorRepo.update(id, data);
  }

  async getAvailableSlots(doctorId: string, dateStr: string) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    // 1. Fetch Doctor and Schedule
    const doctor = await this.doctorRepo.findById(doctorId);
    if (!doctor || doctor.status !== "ACTIVE") {
      throw new AppError("Doctor not found or inactive", 404);
    }

    const schedule = await this.doctorRepo.getSchedule(doctorId, dayOfWeek);
    if (!schedule) return [];

    // 2. Generate Base Slots
    let slots = this.generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDuration
    );

    // 3. Handle Availability Blocks (Breaks/Manual Blocks) - Treat as EXCLUSIONS
    const blocks = await this.doctorRepo.getAvailabilityBlocks(doctorId, dayOfWeek);
    if (blocks.length > 0) {
      slots = slots.filter((slot) => {
        const slotStart = this.timeToMinutes(slot);
        const slotEnd = slotStart + schedule.slotDuration;
        
        // If any block overlaps with this slot range, exclude the slot
        const hasOverlap = blocks.some((block: any) => {
          const blockStart = this.timeToMinutes(block.startTime);
          const blockEnd = this.timeToMinutes(block.endTime);
          return Math.max(slotStart, blockStart) < Math.min(slotEnd, blockEnd);
        });
        
        return !hasOverlap;
      });
    }

    // 4. Handle Exceptions (Leave/Unavailability)
    const exceptions = await this.doctorRepo.getExceptions(doctorId, date);
    for (const ex of exceptions) {
      if (ex.isFullDay) return [];
      if (ex.startTime && ex.endTime) {
        slots = slots.filter(
          (slot) => !this.isTimeInRange(slot, ex.startTime!, ex.endTime!)
        );
      }
    }

    // 5. Categorize Slots
    const appointments = await this.appointmentRepo.getAppointmentsByDate(doctorId, date);
    const bookedTimes = new Set(appointments.map((a) => a.startTime));
    
    return slots.map(slot => ({
      time: slot,
      available: !bookedTimes.has(slot)
    }));
  }

  async createDoctor(data: any) {
    return this.doctorRepo.create(data);
  }

  async addSchedule(doctorId: string, data: any) {
    return this.doctorRepo.createSchedule({ ...data, doctorId });
  }

  async addBlock(doctorId: string, data: any) {
    return this.doctorRepo.createBlock({ ...data, doctorId });
  }

  async addException(doctorId: string, data: any) {
    return this.doctorRepo.createException({ ...data, doctorId });
  }

  async setCompleteSchedule(doctorId: string, data: any) {
    const { days, startTime, endTime, slotDuration, blocks } = data;

    const schedules = days.map((day: number) => ({
      dayOfWeek: day,
      startTime,
      endTime,
      slotDuration,
    }));

    // Every block (break or manual) applies to every active day in this new uniform system
    const allBlocks: any[] = [];
    days.forEach((day: number) => {
      blocks.forEach((block: any) => {
        allBlocks.push({
          dayOfWeek: day,
          startTime: block.startTime,
          endTime: block.endTime,
        });
      });
    });

    return this.doctorRepo.setCompleteSchedule(doctorId, schedules, allBlocks);
  }

  private generateTimeSlots(start: string, end: string, duration: number): string[] {
    const slots: string[] = [];
    let current = this.timeToMinutes(start);
    const endTime = this.timeToMinutes(end);

    while (current + duration <= endTime) {
      slots.push(this.minutesToTime(current));
      current += duration;
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  private isTimeInRange(time: string, start: string, end: string): boolean {
    const t = this.timeToMinutes(time);
    const s = this.timeToMinutes(start);
    const e = this.timeToMinutes(end);
    return t >= s && t < e; // Using < end because a slot starting AT end is not in range
  }
}
