import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { Users, BookOpen, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react"

function getProgrammeFee(student: any): number {
	if (!student?.programme) return 0
	return student.programme.feeAmount ?? student.programme.fee ?? student.programme.tuitionFee ?? 0
}

async function DashboardContent() {
	const students = await prisma.student.findMany({
		include: {
			programme: true,
			payments: true,
		},
		orderBy: { fullName: "asc" },
	})

	const programmesCount = await prisma.programme.count()

	const overdueStudents = students.filter((s) => {
		const totalFee = getProgrammeFee(s)
		const totalPaid = (s.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
		return totalFee - totalPaid > 0
	})

	const totalOverdueAmount = overdueStudents.reduce((sum, s) => {
		const totalFee = getProgrammeFee(s)
		const totalPaid = (s.payments || []).reduce((pSum, p) => pSum + (p.amount || 0), 0)
		return sum + (totalFee - totalPaid)
	}, 0)

	return (
		<div className="p-4 md:p-8 space-y-6 max-w-full overflow-hidden">
			<div>
				<h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Registry Dashboard</h1>
				<p className="text-xs md:text-sm text-slate-500">Overview of institutional enrolment, academic programmes, and flagged financial balances</p>
			</div>

			{/* Top Metric Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
					<div className="flex items-center gap-3">
						<Users className="w-8 h-8 text-blue-500 shrink-0" />
						<div className="min-w-0">
							<p className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Total Students</p>
							<h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{students.length} Enrolled</h2>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
					<div className="flex items-center gap-3">
						<BookOpen className="w-8 h-8 text-purple-500 shrink-0" />
						<div className="min-w-0">
							<p className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Programmes</p>
							<h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">{programmesCount} Courses</h2>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
					<div className="flex items-center gap-3">
						<AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
						<div className="min-w-0">
							<p className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Overdue Accounts</p>
							<h2 className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400 truncate">{overdueStudents.length} Flagged</h2>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs">
					<div className="flex items-center gap-3">
						<DollarSign className="w-8 h-8 text-amber-500 shrink-0" />
						<div className="min-w-0">
							<p className="text-xs uppercase text-slate-400 font-semibold tracking-wider">Total Outstanding</p>
							<h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">${totalOverdueAmount.toLocaleString()}</h2>
						</div>
					</div>
				</div>
			</div>

			{/* Flagged Overdue Students List */}
			{overdueStudents.length > 0 ? (
				<div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-xl p-4 md:p-6 shadow-xs space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
						<h2 className="text-sm md:text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
							<AlertTriangle className="w-5 h-5 shrink-0" />
							Flagged Students with Overdue Balances ({overdueStudents.length})
						</h2>
						<span className="text-xs font-medium text-slate-500">Immediate Registry Action Required</span>
					</div>

					<div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
						{overdueStudents.map((s) => {
							const totalFee = getProgrammeFee(s)
							const totalPaid = (s.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0)
							const balance = totalFee - totalPaid

							return (
								<div key={s.id} className="p-3 bg-red-50/30 dark:bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
									<div className="min-w-0">
										<span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
											{s.fullName} ({s.studentId})
										</span>
										<span className="text-xs text-slate-500 block truncate mt-0.5">
											Programme: {s.programme?.name || "Unassigned"} • Email: {s.email}
										</span>
									</div>

									<div className="text-left sm:text-right shrink-0">
										<p className="font-bold text-red-600 dark:text-red-400 text-sm">${balance.toLocaleString()} Overdue</p>
										<p className="text-xs text-slate-400">
											Paid: ${totalPaid.toLocaleString()} / Total: ${totalFee.toLocaleString()}
										</p>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			) : (
				<div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
					<CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
					<span>All enrolled students are fully up to date with their tuition fee payments.</span>
				</div>
			)}
		</div>
	)
}

export default function OverviewPage() {
	return (
		<Suspense fallback={<div className="p-4 md:p-8 text-slate-500">Loading Registry Dashboard...</div>}>
			<DashboardContent />
		</Suspense>
	)
}
