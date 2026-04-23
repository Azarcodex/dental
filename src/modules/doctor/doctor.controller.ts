import { NextResponse } from "next/server";
import { DoctorService } from "./doctor.service";
import { CreateBlockSchema, CreateDoctorSchema, CreateExceptionSchema, CreateScheduleSchema, SlotQuerySchema, UpdateDoctorSchema } from "./doctor.types";
import { apiHandler } from "../../lib/apiHandler";

const doctorService = new DoctorService();

export const getSlotsHandler = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: doctorId } = await params;
  const url = new URL(req.url);
  const date = url.searchParams.get("date");

  // Validate query params
  const { date: validatedDate } = SlotQuerySchema.parse({ date });

  const slots = await doctorService.getAvailableSlots(doctorId, validatedDate);

  return NextResponse.json({
    success: true,
    slots,
  });
});

export const createDoctorHandler = apiHandler(async (req: Request) => {
  const body = await req.json();
  const data = CreateDoctorSchema.parse(body);
  const doctor = await doctorService.createDoctor(data);
  return NextResponse.json({ success: true, data: doctor }, { status: 201 });
});

export const addScheduleHandler = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: doctorId } = await params;
  const body = await req.json();
  const data = CreateScheduleSchema.parse(body);
  const schedule = await doctorService.addSchedule(doctorId, data);
  return NextResponse.json({ success: true, data: schedule }, { status: 201 });
});

export const addBlockHandler = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: doctorId } = await params;
  const body = await req.json();
  const data = CreateBlockSchema.parse(body);
  const block = await doctorService.addBlock(doctorId, data);
  return NextResponse.json({ success: true, data: block }, { status: 201 });
});

export const addExceptionHandler = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: doctorId } = await params;
  const body = await req.json();
  const data = CreateExceptionSchema.parse(body);
  const exception = await doctorService.addException(doctorId, data);
  return NextResponse.json({ success: true, data: exception }, { status: 201 });
});

export const getAllDoctorsHandler = apiHandler(async () => {
  const doctors = await doctorService.getAllDoctors();
  return NextResponse.json({ success: true, data: doctors });
});

export const getDoctorByIdHandler = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: doctorId } = await params;
  const doctor = await doctorService.getDoctorById(doctorId);
  return NextResponse.json({ success: true, data: doctor });
});

export const updateDoctorHandler = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: doctorId } = await params;
  const body = await req.json();
  const data = UpdateDoctorSchema.parse(body);
  const doctor = await doctorService.updateDoctor(doctorId, data);
  return NextResponse.json({ success: true, data: doctor });
});

export const saveCompleteScheduleHandler = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id: doctorId } = await params;
  const body = await req.json();
  // We can add a Zod schema later for strictness, but for now we trust the payload structure
  const result = await doctorService.setCompleteSchedule(doctorId, body);
  return NextResponse.json({ success: true, data: result });
});
