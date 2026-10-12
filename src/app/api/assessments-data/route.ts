import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
	const assessments = await prisma.assessment.findMany({
		include: {
			submissions: {
				include: { student: true },
				// orderBy: { submittedAt: "desc" },
			},
			grades: {
				include: { student: true },
			},
		},
		orderBy: { deadline: "asc" },
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
