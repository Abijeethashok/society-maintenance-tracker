import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
const key = () => new TextEncoder().encode(process.env.JWT_SECRET || "development-only-change-me-before-production");
export type Session = { id:string; email:string; role:Role; name:string };
export async function makeToken(user:Session) { return new SignJWT(user).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(key()); }
export async function session():Promise<Session|null> { const token=(await cookies()).get("smt_session")?.value; if(!token) return null; try{return (await jwtVerify(token,key())).payload as unknown as Session;}catch{return null;} }
export async function requireUser(role?:Role) { const user=await session(); if(!user) throw new AuthError(401,"Authentication required"); if(role && user.role!==role) throw new AuthError(403,"Insufficient permissions"); return user; }
export class AuthError extends Error { constructor(public status:number,message:string){super(message);} }
export const cookieOptions = {httpOnly:true, sameSite:"lax" as const, secure:process.env.NODE_ENV==="production", path:"/", maxAge:60*60*24*7};
