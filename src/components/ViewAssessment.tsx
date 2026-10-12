"use client"

import { useEffect, useState, useCallback } from "react"
import { useApp } from "@/context/AppContext"
import { AddAssessmentModal } from "@/components/AddAssessmentModal"
import { StudentUploadModal } from "@/components/StudentUploadModal"
import { Clock, CheckCircle2, AlertTriangle, FileText, Download } from "lucide-react"

interface ViewAssessmentProps {
	initialAssessments: any[]
	initialStudents: any[]
}

export default function ViewAssessment({ initialAssessments, initialStudents }: ViewAssessmentProps) {
	const { role } = useApp()
	const [assessments, setAssessments] = useState<any[]>(initialAssessments)
	const [students] = useState<any[]>(initialStudents)
	const [, setIsLoading] = useState(false)

	// Fetch assessment data after mutations/uploads
	const loadData = useCallback(async () => {
		setIsLoading(true)
		try {
			const res = await fetch("/api/assessments-data")
			if (res.ok) {
				const data = await res.json()
				setAssessments(data.assessments || [])
			}
		} catch (err) {
			console.error("Error loading assessments:", err)
		} finally {
			setIsLoading(false)
		}
	}, [])

	return (
		<div className="p-4 md:p-8 space-y-6 max-w-full overflow-hidden">
			{/* Top Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Coursework Assessments</h1>
					<p className="text-xs md:text-sm text-slate-500">{role === "STUDENT" ? "View open coursework assignments and upload your file submissions" : "Create assessments, review deadlines, and check submitted student files"}</p>
				</div>

				{(role === "STAFF" || role === "REGISTRY") && <AddAssessmentModal onAssessmentCreated={loadData} />}
			</div>

			{/* Assessment Cards List */}
			<div className="grid grid-cols-1 gap-4 md:gap-6">
				{assessments.map((assessment) => {
					const deadlineDate = new Date(assessment.deadline)

					return (
						<div key={assessment.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-xs space-y-4 overflow-hidden">
							{/* Header Info & Actions */}
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
								<div className="space-y-1 min-w-0 flex-1">
									<span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">{assessment.module}</span>
									<h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 break-words">{assessment.title}</h2>
								</div>

								<div className="flex flex-wrap items-center gap-2.5 shrink-0">
									<div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
										<Clock className="w-4 h-4 text-slate-400 shrink-0" />
										<span>Deadline: {deadlineDate.toLocaleString()}</span>
									</div>

									{role === "STUDENT" && <StudentUploadModal assessment={assessment} students={students} onUploadSuccess={loadData} />}
								</div>
							</div>

							{/* Submissions List Section */}
							<div className="space-y-3">
								<h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Submitted Student Files ({assessment.submissions?.length || 0})</h3>

								{assessment.submissions && assessment.submissions.length > 0 ? (
									<div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
										{assessment.submissions.map((sub: any) => (
											<div key={sub.id} className="p-3 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
												<div className="flex items-start gap-3 min-w-0">
													<FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
													<div className="min-w-0">
														<p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
															{sub.student?.fullName} ({sub.student?.studentId})
														</p>
														<p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
															<span className="truncate">File: {sub.fileName}</span>
															<a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-700 inline-flex items-center gap-0.5 shrink-0">
																<Download className="w-3 h-3" /> View / Download
															</a>
														</p>
													</div>
												</div>

												<div className="shrink-0 self-start sm:self-center">
													{sub.isLate ? (
														<span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 rounded-full inline-flex items-center gap-1 border border-amber-300/50">
															<AlertTriangle className="w-3 h-3 shrink-0" />
															LATE SUBMISSION
														</span>
													) : (
														<span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full inline-flex items-center gap-1 border border-emerald-300/50">
															<CheckCircle2 className="w-3 h-3 shrink-0" />
															ON TIME
														</span>
													)}
												</div>
											</div>
										))}
									</div>
								) : (
									<p className="text-xs text-slate-500 italic p-2">No submissions uploaded yet for this assessment.</p>
								)}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
