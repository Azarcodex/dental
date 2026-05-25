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
    const date = new Date(`${dateStr}T00:00:00.000Z`);
    const dayOfWeek = date.getUTCDay();

    // 1. Fetch Doctor and Schedule
    const doctor = await this.doctorRepo.findById(doctorId);
    if (!doctor || doctor.status !== "ACTIVE") {
      throw new AppError("Doctor not found or inactive", 404);
    }

    let activeStartTime, activeEndTime, activeSlotDuration, activeBreaks: any[] = [];
    
    const customSchedule = doctor.schedules.find((s: any) => s.dayOfWeek === dayOfWeek && s.isCustom);
    
    if (customSchedule) {
      activeStartTime = customSchedule.startTime;
      activeEndTime = customSchedule.endTime;
      activeSlotDuration = customSchedule.slotDuration;
      const dayBlocks = doctor.blocks.filter((b: any) => b.dayOfWeek === dayOfWeek);
      activeBreaks = dayBlocks.map((b: any) => ({ startTime: b.startTime, endTime: b.endTime }));
    } else if (doctor.weeklyDefault && doctor.weeklyDefault.activeDays.split(",").map(Number).includes(dayOfWeek)) {
      activeStartTime = doctor.weeklyDefault.startTime;
      activeEndTime = doctor.weeklyDefault.endTime;
      activeSlotDuration = doctor.weeklyDefault.slotDuration;
      try {
        activeBreaks = JSON.parse(doctor.weeklyDefault.breaks || "[]");
      } catch (e) {
        activeBreaks = [];
      }
    } else {
      return []; // Not an active working day
    }

    // 2. Generate Base Slots
    let slots = this.generateTimeSlots(
      activeStartTime,
      activeEndTime,
      activeSlotDuration
    );

    // 3. Handle Availability Blocks (Breaks/Manual Blocks) - Treat as EXCLUSIONS
    if (activeBreaks.length > 0) {
      slots = slots.filter((slot) => {
        const slotStart = this.timeToMinutes(slot);
        const slotEnd = slotStart + activeSlotDuration;
        
        // If any block overlaps with this slot range, exclude the slot
        const hasOverlap = activeBreaks.some((block: any) => {
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
    if (data.type === "global") {
      const { days, startTime, endTime, slotDuration, breaks } = data;
      const weeklyData = {
        activeDays: days.join(","),
        startTime,
        endTime,
        slotDuration,
        breaks: JSON.stringify(breaks),
      };
      return this.doctorRepo.upsertWeeklyDefault(doctorId, weeklyData, []);
    } else if (data.type === "day") {
      const { dayOfWeek, startTime, endTime, slotDuration, breaks, manualBlocks } = data;
      const scheduleData = { startTime, endTime, slotDuration };
      const combinedBlocks = [
        ...breaks,
        ...manualBlocks.map((t: string) => ({
          startTime: t,
          endTime: this.minutesToTime(this.timeToMinutes(t) + slotDuration)
        }))
      ];
      return this.doctorRepo.upsertDaySchedule(doctorId, dayOfWeek, scheduleData, combinedBlocks);
    } else if (data.type === "reset-day") {
      return this.doctorRepo.deleteDaySchedule(doctorId, data.dayOfWeek);
    }
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
