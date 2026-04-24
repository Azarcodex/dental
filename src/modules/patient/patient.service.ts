import { PatientRepository } from "./patient.repository";
import { CreatePatientInput } from "./patient.types";

export class PatientService {
  private repository: PatientRepository;

  constructor() {
    this.repository = new PatientRepository();
  }

  async getOrCreatePatient(data: CreatePatientInput) {
    // 1. Try to find existing patient by phone
    const existingPatient = await this.repository.findByPhone(data.phone);
    if (existingPatient) {
      return existingPatient;
    }

    return this.createPatient(data);
  }

  async getPatientById(id: string) {
    return this.repository.findById(id);
  }

  async createPatient(data: CreatePatientInput) {
    // 1. Generate next Display ID (P-001, P-002...)
    const lastPatient = await this.repository.findLastDisplayId();
    let nextId = "P-001";
    if (lastPatient?.displayId) {
      const currentNum = parseInt(lastPatient.displayId.replace("P-", ""));
      nextId = `P-${(currentNum + 1).toString().padStart(3, "0")}`;
    }

    // 2. Attempt to create
    try {
      return await this.repository.create({ ...data, displayId: nextId });
    } catch (error: any) {
      // 3. Handle race condition: 
      if (error.code === "P2002") {
        const patient = await this.repository.findByPhone(data.phone);
        if (patient) return patient;
      }
      throw error;
    }
  }

  async getAllPatients(query?: string) {
    if (query) {
      return this.repository.findBySearch(query);
    }
    return this.repository.findAll();
  }

  async getPatientStats() {
    return this.repository.getStats();
  }

  async searchPatientByPhone(phone: string) {
    return this.repository.findByPhone(phone);
  }

  async searchPatients(query: string) {
    return this.repository.findBySearch(query);
  }
}
