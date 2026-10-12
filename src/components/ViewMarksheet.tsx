"use client"

import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { GradeEntryModal } from "@/components/GradeEntryModal"
import { PublishGradeButton } from "@/components/PublishGradeButton"
import { useRouter } from "next/navigation"

interface ViewMarksheetProps {
	initialAssessments: any[]
}

export default function ViewMarksheet({ initialAssessments }: ViewMarksheetProps) {
	const router = useRouter()
	const { role } = useApp()
	const [assessments, setAssessments] = useState<any[]>(initialAssessments)
	const [, setIsLoading] = useState(false)

	// Fetch updated assessments and grades after entry/publication
	const loadMarksheet = async () => {
		setIsLoading(true)
		try {
			const res = await fetch("/api/assessments-data")
			if (res.ok) {
				const data = await res.json()
				setAssessments(data.assessments || [])
			}
		} catch (err) {
			console.error("Error fetching marksheet data:", err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleRefresh = () => {
		loadMarksheet()
		router.refresh()
	}

	return (
		<div className="p-4 md:p-8 space-y-6 max-w-full overflow-hidden">
			<div>
				<h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Academic Marksheet & Results</h1>
				<p className="text-xs md:text-sm text-slate-500">{role === "STUDENT" ? "View your published academic grades and module classifications" : "Enter numeric grades, apply classifications, and manage result publication"}</p>
			</div>

			<div className="space-y-6">
				{assessments.map((assessment) => {
					const submissions = assessment?.submissions || []
					const grades = assessment?.grades || []

					const visibleSubmissions = submissions.filter((sub: any) => {
						const grade = grades.find((g: any) => g.studentId === sub.studentId)

						if (role === "STUDENT") {
							return grade && grade.status === "PUBLISHED"
						}

						return true
					})

					if (role === "STUDENT" && visibleSubmissions.length === 0) {
						return null
					}

					return (
						<div key={assessment.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
							<div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
								<div>
									<span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{assessment.module}</span>
									<h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 break-words">{assessment.title}</h2>
								</div>
								<span className="text-xs text-slate-500 shrink-0">Total Submissions: {submissions.length}</span>
							</div>

							{visibleSubmissions.length > 0 ? (
								<div className="w-full overflow-x-auto">
									<table className="w-full min-w-[750px] text-left text-sm">
										<thead className="bg-slate-100/50 dark:bg-slate-800/20 text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
											<tr>
												<th className="p-3 whitespace-nowrap">Student ID</th>
												<th className="p-3 whitespace-nowrap">Student Name</th>
												<th className="p-3 whitespace-nowrap">Score (%)</th>
												<th className="p-3 whitespace-nowrap">Grade Class</th>
												<th className="p-3 whitespace-nowrap">Status</th>
												{(role === "STAFF" || role === "REGISTRY") && <th className="p-3 text-right whitespace-nowrap">Actions</th>}
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
											{visibleSubmissions.map((sub: any) => {
												const grade = grades.find((g: any) => g.studentId === sub.studentId)

												return (
													<tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
														<td className="p-3 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{sub.student?.studentId || "N/A"}</td>
														<td className="p-3 font-medium whitespace-nowrap">{sub.student?.fullName || "Unassigned"}</td>
														<td className="p-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{grade ? `${grade.score}%` : "—"}</td>
														<td className="p-3 whitespace-nowrap">{grade ? <span className={`px-2 py-0.5 text-xs font-bold rounded-full inline-block ${grade.gradeClass === "Distinction" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" : grade.gradeClass === "Merit" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" : grade.gradeClass === "Pass" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"}`}>{grade.gradeClass}</span> : <span className="text-xs text-slate-400">Ungraded</span>}</td>
														<td className="p-3 whitespace-nowrap">{grade ? <span className={`px-2 py-0.5 text-xs font-bold rounded-full inline-block ${grade.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}>{grade.status}</span> : "—"}</td>

														{(role === "STAFF" || role === "REGISTRY") && (
															<td className="p-3 text-right whitespace-nowrap flex justify-end gap-2 items-center">
																<GradeEntryModal assessment={assessment} student={sub.student} existingGrade={grade} onGradeUpdated={handleRefresh} />
																{grade && <PublishGradeButton grade={grade} onGradeUpdated={handleRefresh} />}
															</td>
														)}
													</tr>
												)
											})}
										</tbody>
									</table>
								</div>
							) : (
								<div className="p-4 text-xs text-slate-500 italic">No submissions or grades recorded for this assessment yet.</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
