import { ComplaintStatus, Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { isOverdue } from "./overdue";
export const serializeComplaint=(c:any)=>({...c,overdue:isOverdue(c.createdAt,c.status)});
export async function changeStatus(id:string, userId:string, status:ComplaintStatus, note?:string){
 const complaint=await prisma.complaint.findUnique({where:{id},include:{resident:true}}); if(!complaint) throw Object.assign(new Error("Complaint not found"),{status:404});
 const valid=(complaint.status==="OPEN"&&status==="IN_PROGRESS")||(complaint.status==="IN_PROGRESS"&&status==="RESOLVED");
 if(!valid) throw Object.assign(new Error(`Invalid transition from ${complaint.status} to ${status}`),{status:422});
 return prisma.$transaction(async tx=>{const updated=await tx.complaint.update({where:{id},data:{status,resolvedAt:status==="RESOLVED"?new Date():null},include:{resident:true}}); await tx.complaintHistory.create({data:{complaintId:id,changedById:userId,previousStatus:complaint.status,newStatus:status,note}}); return updated;});
}
export function filters(params:URLSearchParams):Prisma.ComplaintWhereInput { const where:Prisma.ComplaintWhereInput={}; const s=params.get("status"),p=params.get("priority"),c=params.get("category"),q=params.get("q"); if(s) where.status=s as any;if(p)where.priority=p as any;if(c)where.category=c as any;if(q)where.OR=[{title:{contains:q,mode:"insensitive"}},{description:{contains:q,mode:"insensitive"}},{resident:{name:{contains:q,mode:"insensitive"}}}]; return where; }
