import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import ViewFee from "@/components/ViewFee"

async function FeesContent() {
	// Fetch initial paymets
	const initialStudents = await prisma.student.findMany({
		include: {
			programme: true,
			payments: true,
		},
		orderBy: { createdAt: "desc" },
	})

	return <ViewFee initialStudents={initialStudents} />
}

export default function FeesPage() {
	return (
		<Suspense fallback={<div className="p-4 md:p-8 text-slate-500">Loading fee records...</div>}>
			<FeesContent />
		</Suspense>
	)
}
