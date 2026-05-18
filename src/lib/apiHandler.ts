import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

type Handler = (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse;

export const apiHandler = (handler: Handler) => {
  return async (req: NextRequest, context: any) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error("API Route Error:", error);

      // Handle Zod Validation Errors
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation Error",
            errors: error.issues.map((e) => ({
              path: e.path,
              message: e.message,
            })),
          },
          { status: 400 },
        );
      }

      // Handle Prisma Errors
      if (error.code && typeof error.code === 'string' && error.code.startsWith('P')) {
        console.error(`[Prisma Error] ${error.code}:`, error.meta || {});
        return NextResponse.json(
          {
            success: false,
            message: `Database Error (${error.code})`,
          },
          { status: 500 },
        );
      }

      // Handle Custom App Errors
      const status = error.status || 500;
      const message = error.message || "Internal Server Error";

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status },
      );
    }
  };
};

export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}
