import { ComplaintStatus } from "@prisma/client";
export const overdueThresholdDays = () => Math.max(1, Number(process.env.OVERDUE_THRESHOLD_DAYS ?? 3));
export const isOverdue = (createdAt: Date, status: ComplaintStatus) => status !== "RESOLVED" && Date.now() - createdAt.getTime() > overdueThresholdDays()*86400000;
