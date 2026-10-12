import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import ViewAssessment from "@/components/ViewAssessment"

async function AssessmentsContent() {
	// Fetch initial assessments
	const initialAssessments = await prisma.assessment.findMany({
		include: {
			submissions: {
				include: {
					student: true,
				},
			},
		},
		orderBy: { deadline: "asc" },
	})

	// Fetch initial students list
	const initialStudents = await prisma.student.findMany({
		orderBy: { createdAt: "desc" },
	})

	return <ViewAssessment initialAssessments={initialAssessments} initialStudents={initialStudents} />
}

export default function AssessmentsPage() {
	return (
		<Suspense fallback={<div className="p-4 md:p-8 text-slate-500">Loading coursework assessments...</div>}>
			<AssessmentsContent />
		</Suspense>
	)
}
