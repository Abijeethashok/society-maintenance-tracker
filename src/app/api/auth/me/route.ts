import { session } from "@/lib/auth"; import { error,ok } from "@/lib/errors"; export async function GET(){const u=await session();return u?ok(u):error("Authentication required",401);}
