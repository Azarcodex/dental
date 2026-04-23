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

      // Handle Custom App Errors (if you decide to create a custom error class)
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
