import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { searchStudentsAction } from "@/controllers/student"
import ViewStudent from "@/components/ViewStudent"

async function StudentDirectoryContent() {
	// Fetch initial student
	const studentRes = await searchStudentsAction({
		search: "",
		programmeId: "ALL",
		status: "ALL",
	})
	const initialStudents = studentRes.success ? studentRes.students || [] : []

	// Fetch initial programmes
	const initialProgrammes = await prisma.programme.findMany({
		orderBy: { createdAt: "desc" },
	})

	return <ViewStudent initialStudents={initialStudents} initialProgrammes={initialProgrammes} />
}

export default function StudentsPage() {
	return (
		<Suspense fallback={<div className="p-4 md:p-8 text-slate-500">Loading student enrolment records...</div>}>
			<StudentDirectoryContent />
		</Suspense>
	)
}
