import { NextResponse, NextRequest } from "next/server";
import { AdminService } from "./admin.service";
import { StatsService } from "./stats.service";
import { CreateAdminSchema, LoginAdminSchema } from "./admin.validator";
import { apiHandler } from "../../lib/apiHandler";
import { setAuthCookie } from "../../lib/cookie";
import { authenticateAdmin } from "../../lib/middlewares/authMiddleware";

const adminService = new AdminService();
const statsService = new StatsService();

export const registerHandler = apiHandler(async (req: NextRequest) => {
  const body = await req.json();

  // Validate request body
  const validatedData = CreateAdminSchema.parse(body);

  // Call service
  const admin = await adminService.registerAdmin(validatedData);

  return NextResponse.json(
    {
      success: true,
      data: admin,
    },
    { status: 201 }
  );
});

export const loginHandler = apiHandler(async (req: NextRequest) => {
  const body = await req.json();

  // 1. Validate input
  const validatedData = LoginAdminSchema.parse(body);

  // 2. Call service
  const { admin, token } = await adminService.loginAdmin(validatedData);

  // 3. Prepare response
  const response = NextResponse.json(
    {
      success: true,
      message: "Login successful",
      admin,
    },
    { status: 200 }
  );

  // 4. Set HTTP-only cookie
  setAuthCookie(response, token);

  return response;
});

export const logoutHandler = apiHandler(async () => {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    { status: 200 }
  );

  // Clear cookie by setting it to empty and expiring it
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
});

export const getMeHandler = apiHandler(async (req: NextRequest) => {
  const admin = await authenticateAdmin(req);
  
  return NextResponse.json({
    success: true,
    user: admin,
  });
});

export const updateProfileHandler = apiHandler(async (req: NextRequest) => {
  const caller = await authenticateAdmin(req);
  const body = await req.json();
  
  // Only Super Admin can update
  const admin = await adminService.updateProfile(caller.role, caller.id, caller.id, body);
  
  return NextResponse.json({ success: true, data: admin });
});

export const updateCredentialsHandler = apiHandler(async (req: NextRequest) => {
  const caller = await authenticateAdmin(req);
  const body = await req.json();
  
  // Only Super Admin can update credentials
  const admin = await adminService.updateCredentials(caller.role, body.targetId || caller.id, body);
  
  return NextResponse.json({ success: true, data: admin });
});

export const getAllAdminsHandler = apiHandler(async (req: NextRequest) => {
  const caller = await authenticateAdmin(req);
  const admins = await adminService.getAllAdmins(caller.role);
  
  return NextResponse.json({ success: true, data: admins });
});

export const getStatsHandler = apiHandler(async () => {
  const stats = await statsService.getDashboardStats();
  return NextResponse.json({ success: true, data: stats });
});

export const deleteAdminHandler = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const caller = await authenticateAdmin(req);
  const { id: targetId } = await params;
  
  await adminService.deleteAdmin(caller.role, caller.id, targetId);
  
  return NextResponse.json({ success: true, message: "Admin deleted successfully" });
});

export const updateAdminHandler = apiHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const caller = await authenticateAdmin(req);
  const { id: targetId } = await params;
  const body = await req.json();

  if (body.password === "") {
    delete body.password;
  }

  const admin = await adminService.updateAdmin(caller.role, targetId, body);
  return NextResponse.json({ success: true, data: admin });
});
