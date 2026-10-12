import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import ViewMarksheet from "@/components/ViewMarksheet"

async function MarksheetContent() {
	// Fetch initial  marksheet
	const initialAssessments = await prisma.assessment.findMany({
		include: {
			submissions: {
				include: {
					student: true,
				},
			},
			grades: true,
		},
		orderBy: { deadline: "asc" },
	})

	return <ViewMarksheet initialAssessments={initialAssessments} />
}

export default function MarksheetPage() {
	return (
		<Suspense fallback={<div className="p-4 md:p-8 text-slate-500">Loading academic marksheets...</div>}>
			<MarksheetContent />
		</Suspense>
	)
}
