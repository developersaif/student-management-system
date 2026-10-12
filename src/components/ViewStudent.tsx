"use client"
import { useEffect, useState, useCallback } from "react"
import { Search, Loader2 } from "lucide-react"
import { AddStudentModal } from "@/components/AddStudentModal"
import { DeleteStudentButton } from "@/components/DeleteStudentButton"
import { useApp } from "@/context/AppContext"
import { useDebounce } from "@/hooks/useDebounce"
import { searchStudentsAction } from "@/controllers/student"

interface ViewStudentProps {
	initialStudents: any[]
	initialProgrammes: any[]
}

export default function ViewStudent({ initialStudents, initialProgrammes }: ViewStudentProps) {
	const { role } = useApp()
	const [students, setStudents] = useState<any[]>(initialStudents)
	const [programmes] = useState<any[]>(initialProgrammes)
	const [search, setSearch] = useState("")
	const [selectedProgramme, setSelectedProgramme] = useState("ALL")
	const [selectedStatus, setSelectedStatus] = useState("ALL")

	const [isSearching, setIsSearching] = useState(false)
	const debouncedSearch = useDebounce(search, 500)

	// Search students dynamically when filters/search change
	const fetchDirectoryData = useCallback(async () => {
		setIsSearching(true)
		try {
			const res = await searchStudentsAction({
				search: debouncedSearch,
				programmeId: selectedProgramme,
				status: selectedStatus,
			})

			if (res.success) {
				setStudents(res.students || [])
			}
		} catch (err) {
			console.error("Failed to load student directory data:", err)
		} finally {
			setIsSearching(false)
		}
	}, [debouncedSearch, selectedProgramme, selectedStatus])

	// Skip initial mount so we don't duplicate the server's initial fetch
	const [isMounted, setIsMounted] = useState(false)
	useEffect(() => {
		if (!isMounted) {
			setIsMounted(true)
			return
		}
		fetchDirectoryData()
	}, [fetchDirectoryData, isMounted])

	const getStudentStatus = (student: any): string => {
		const rawStatus = student.status || student.enrolmentStatus || "ENROLLED"
		return String(rawStatus).toUpperCase()
	}

	const getStatusBadge = (statusKey: string) => {
		switch (statusKey) {
			case "ENROLLED":
				return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/50"
			case "DEFERRED":
				return "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/50"
			case "WITHDRAWN":
				return "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300/50"
			case "COMPLETED":
				return "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300/50"
			default:
				return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
		}
	}

	const formatStatusText = (statusKey: string) => {
		switch (statusKey) {
			case "ENROLLED":
				return "Enrolled"
			case "DEFERRED":
				return "Deferred"
			case "WITHDRAWN":
				return "Withdrawn"
			case "COMPLETED":
				return "Completed"
			default:
				return statusKey
		}
	}

	return (
		<div className="p-4 md:p-8 space-y-6 max-w-full overflow-hidden">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Student Enrolment Directory</h1>
					<p className="text-xs md:text-sm text-slate-500">Manage student enrolment records, status flags, and academic allocations</p>
				</div>

				{role === "REGISTRY" && <AddStudentModal programmes={programmes} onSuccess={fetchDirectoryData} />}
			</div>

			{/* Database Search & Filters */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				<div className="relative">
					{isSearching ? <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" /> : <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
					<input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search database by name, ID, or email..." className="w-full pl-9 pr-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
				</div>

				<div>
					<select value={selectedProgramme} onChange={(e) => setSelectedProgramme(e.target.value)} className="w-full px-3 py-2 border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm">
						<option value="ALL">All Programmes</option>
						{programmes.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</div>

				<div>
					<select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm">
						<option value="ALL">All Enrolment Statuses</option>
						<option value="ENROLLED">Enrolled</option>
						<option value="DEFERRED">Deferred</option>
						<option value="WITHDRAWN">Withdrawn</option>
						<option value="COMPLETED">Completed</option>
					</select>
				</div>
			</div>

			{/* Table */}
			<div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
				<table className="w-full min-w-[850px] text-left text-sm">
					<thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
						<tr>
							<th className="p-3.5 whitespace-nowrap">Student ID</th>
							<th className="p-3.5 whitespace-nowrap">Full Name</th>
							<th className="p-3.5 whitespace-nowrap">Email</th>
							<th className="p-3.5 whitespace-nowrap">Programme</th>
							<th className="p-3.5 whitespace-nowrap">Academic Year</th>
							<th className="p-3.5 whitespace-nowrap">Date of Birth</th>
							<th className="p-3.5 whitespace-nowrap">Status</th>
							{role === "REGISTRY" && <th className="p-3.5 text-right whitespace-nowrap">Actions</th>}
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
						{students.length > 0 ? (
							students.map((student) => {
								const statusKey = getStudentStatus(student)

								return (
									<tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
										<td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{student.studentId}</td>
										<td className="p-3.5 font-medium whitespace-nowrap">{student.fullName}</td>
										<td className="p-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{student.email}</td>
										<td className="p-3.5 whitespace-nowrap">{student.programme?.name || "Unassigned"}</td>
										<td className="p-3.5 whitespace-nowrap">{student.academicYear || "Year 1"}</td>
										<td className="p-3.5 text-slate-500 whitespace-nowrap">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A"}</td>
										<td className="p-3.5 whitespace-nowrap">
											<span className={`px-2.5 py-1 text-xs font-bold rounded-full inline-block ${getStatusBadge(statusKey)}`}>{formatStatusText(statusKey)}</span>
										</td>
										{role === "REGISTRY" && (
											<td className="p-3.5 text-right whitespace-nowrap flex items-center justify-end gap-1">
												<AddStudentModal studentToEdit={student} programmes={programmes} onSuccess={fetchDirectoryData} />
												<DeleteStudentButton student={student} onStudentDeleted={fetchDirectoryData} />
											</td>
										)}
									</tr>
								)
							})
						) : (
							<tr>
								<td colSpan={role === "REGISTRY" ? 8 : 7} className="p-8 text-center text-slate-500">
									No student records found in database matching your query.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
