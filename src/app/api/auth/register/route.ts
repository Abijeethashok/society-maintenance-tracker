import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { error, ok } from "@/lib/errors";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const parsed = registerSchema.safeParse(await req.json());

    if (!parsed.success) {
      return error(
        "Invalid registration data",
        422,
        parsed.error.flatten()
      );
    }

    const {
      name,
      email: rawEmail,
      password,
    } = parsed.data;

    const email = rawEmail.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return error("Email is already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "RESIDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return ok(user, 201);
  } catch (e) {
    console.error("Registration error:", e);

    return error(
      e instanceof Error ? e.message : "Registration failed",
      500
    );
  }
}