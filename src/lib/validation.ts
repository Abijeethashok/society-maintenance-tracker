import { z } from "zod";
export const registerSchema=z.object({name:z.string().trim().min(2).max(80),email:z.string().email(),password:z.string().min(8).max(128)});
export const complaintSchema=z.object({title:z.string().trim().min(3).max(140),description:z.string().trim().min(10).max(3000),category:z.enum(["ELECTRICAL","PLUMBING","CLEANING","MAINTENANCE","LIFT","WATER","OTHER"]),priority:z.enum(["LOW","MEDIUM","HIGH"]).default("MEDIUM"),photoUrl: z.string().min(1).optional().nullable()});
export const noticeSchema=z.object({title:z.string().trim().min(3).max(160),content:z.string().trim().min(5).max(5000),important:z.boolean().default(false)});
