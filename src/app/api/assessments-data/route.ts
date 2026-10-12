import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
	const assessments = await prisma.assessment.findMany({
		include: {
			submissions: {
				include: { student: true },
			},
			grades: {
				include: { student: true },
			},
		},
		orderBy: { deadline: "desc" },
	})

	const students = await prisma.student.findMany({
		include: {
			programme: true,
			payments: true,
		},
		orderBy: { fullName: "asc" },
	})
	return NextResponse.json({ assessments, students })
}
