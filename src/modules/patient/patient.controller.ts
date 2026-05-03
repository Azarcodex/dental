import { NextResponse } from "next/server";
import { PatientService } from "./patient.service";
import { CreatePatientSchema } from "./patient.types";
import { apiHandler } from "../../lib/apiHandler";

const patientService = new PatientService();

export const createPatientHandler = apiHandler(async (req: Request) => {
  const body = await req.json();
  const validatedData = CreatePatientSchema.parse(body);

  const patient = await patientService.getOrCreatePatient(validatedData);

  return NextResponse.json({
    success: true,
    data: patient,
  }, { status: 201 });
});

export const getPatientByIdHandler = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  if (!id) throw new Error("Patient ID is required");

  const patient = await patientService.getPatientById(id);

  if (!patient) {
    return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: patient,
  });
});

export const getPatientsHandler = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const phone = url.searchParams.get("phone");
  const query = url.searchParams.get("query") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  if (phone) {
    const patient = await patientService.searchPatientByPhone(phone);
    return NextResponse.json({ success: true, data: patient });
  }

  const { items, total } = await patientService.getPaginatedPatients(page, limit, query);
  
  return NextResponse.json({ 
    success: true, 
    data: items,
    meta: {
      totalCount: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit
    }
  });
});

export const getPatientRegistryHandler = apiHandler(async (req: Request) => {
  const url = new URL(req.url);
  const query = url.searchParams.get("query") || "";
  
  const [patients, stats] = await Promise.all([
    patientService.getAllPatients(query),
    patientService.getPatientStats()
  ]);

  return NextResponse.json({
    success: true,
    data: { patients, stats }
  });
});
