import { NextResponse } from "next/server";
export const error = (message:string, status=400, details?:unknown) => NextResponse.json({error:{message, details}}, {status});
export const ok = (data:unknown, status=200) => NextResponse.json({data}, {status});
