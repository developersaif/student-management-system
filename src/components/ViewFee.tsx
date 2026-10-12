"use client"

import { useState } from "react"
import { RecordPaymentModal } from "@/components/RecordPaymentModal"
import { AlertCircle, CheckCircle2, Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface ViewFeeProps {
	initialStudents: any[]
}

export default function ViewFee({ initialStudents }: ViewFeeProps) {
	const router = useRouter()
	const [students, setStudents] = useState<any[]>(initialStudents)
	const [search, setSearch] = useState("")
	const [, setIsLoading] = useState(false)

	const fetchFeesData = async () => {
		setIsLoading(true)
		try {
			const res = await fetch("/api/assessments-data")
			if (res.ok) {
				const data = await res.json()
				setStudents(data.students || [])
			}
		} catch (err) {
			console.error("Failed to fetch fees data:", err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleRefresh = () => {
		fetchFeesData()
		router.refresh()
	}

	const getProgrammeFee = (student: any): number => {
		if (!student?.programme) return 0
		return student.programme.feeAmount ?? student.programme.fee ?? student.programme.tuitionFee ?? 0
	}

	const filteredStudents = students.filter((s) => s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.studentId?.toLowerCase().includes(search.toLowerCase()))

	return (
		<div className="p-4 md:p-8 space-y-6 max-w-full overflow-hidden">
			<div>
				<h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Fees & Financial Accounts</h1>
				<p className="text-xs md:text-sm text-slate-500">Track programme tuition fees, payment transactions, and overdue balances ($)</p>
			</div>

			<div className="relative max-w-md">
				<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
				<input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student by name or ID..." className="w-full pl-9 pr-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
			</div>

			{/* Touch-Scrollable Mobile Table Container */}
			<div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
				<table className="w-full min-w-[800px] text-left text-sm">
					<thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
						<tr>
							<th className="p-3.5 whitespace-nowrap">Student ID</th>
							<th className="p-3.5 whitespace-nowrap">Name</th>
							<th className="p-3.5 whitespace-nowrap">Programme</th>
							<th className="p-3.5 whitespace-nowrap">Total Fee</th>
							<th className="p-3.5 whitespace-nowrap">Total Paid</th>
							<th className="p-3.5 whitespace-nowrap">Outstanding Balance</th>
							<th className="p-3.5 whitespace-nowrap">Status</th>
							<th className="p-3.5 text-right whitespace-nowrap">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
						{filteredStudents.length > 0 ? (
							filteredStudents.map((student) => {
								const totalFee = getProgrammeFee(student)
								const totalPaid = (student.payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
								const balance = totalFee - totalPaid
								const isOverdue = balance > 0

								return (
									<tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
										<td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{student.studentId}</td>
										<td className="p-3.5 font-medium whitespace-nowrap">{student.fullName}</td>
										<td className="p-3.5 whitespace-nowrap">{student.programme?.name || "Unassigned"}</td>
										<td className="p-3.5 font-medium whitespace-nowrap">${totalFee.toLocaleString()}</td>
										<td className="p-3.5 text-emerald-600 font-medium whitespace-nowrap">${totalPaid.toLocaleString()}</td>
										<td className={`p-3.5 font-bold whitespace-nowrap ${balance > 0 ? "text-red-600 dark:text-red-400" : "text-slate-600"}`}>${balance.toLocaleString()}</td>
										<td className="p-3.5 whitespace-nowrap">
											{isOverdue ? (
												<span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 rounded-full flex items-center gap-1 w-fit">
													<AlertCircle className="w-3.5 h-3.5" />
													OVERDUE
												</span>
											) : (
												<span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full flex items-center gap-1 w-fit">
													<CheckCircle2 className="w-3.5 h-3.5" />
													PAID IN FULL
												</span>
											)}
										</td>
										<td className="p-3.5 text-right whitespace-nowrap">
											<RecordPaymentModal student={student} onPaymentRecorded={handleRefresh} />
										</td>
									</tr>
								)
							})
						) : (
							<tr>
								<td colSpan={8} className="p-8 text-center text-slate-500">
									No student records found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
