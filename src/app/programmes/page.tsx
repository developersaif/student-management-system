import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import ViewProgram from "@/components/ViewProgram"

async function ProgrammesContent() {
	// Fetch initial programmes
	const initialProgrammes = await prisma.programme.findMany({
		include: {
			_count: {
				select: { students: true },
			},
		},
		orderBy: { createdAt: "desc" },
	})

	return <ViewProgram initialProgrammes={initialProgrammes} />
}

export default function ProgrammesPage() {
	return (
		<Suspense fallback={<div className="p-4 md:p-8 text-slate-500">Loading academic programmes...</div>}>
			<ProgrammesContent />
		</Suspense>
	)
}
