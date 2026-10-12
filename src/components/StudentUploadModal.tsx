"use client"

import React, { useState } from "react"
import { submitAssessmentAction } from "@/controllers/staff"
import { Upload, AlertTriangle, CheckCircle2 } from "lucide-react"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

export function StudentUploadModal({ assessment, students, onUploadSuccess }: { assessment: any; students: any[]; onUploadSuccess?: () => void }) {
	const [isOpen, setIsOpen] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const isPastDeadline = new Date() > new Date(assessment.deadline)

	// Identify student IDs who have ALREADY submitted for this assessment
	const submittedStudentIds = new Set((assessment?.submissions || []).map((s: any) => s.studentId))

	// Available students who have NOT submitted yet
	const unsubmittedStudents = students.filter((s) => !submittedStudentIds.has(s.id))

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)

		const formData = new FormData(e.currentTarget)
		const file = formData.get("file") as File

		if (file && file.size > MAX_FILE_SIZE) {
			const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
			const msg = `File size exceeds 50 MB limit. Your file is ${fileSizeMB} MB.`
			setError(msg)
			alert(msg)
			return
		}

		setIsSubmitting(true)
		const res = await submitAssessmentAction(formData)
		setIsSubmitting(false)

		if (!res.success) {
			setError(res.error || "Upload failed.")
			alert(res.error || "Upload failed.")
		} else {
			setIsOpen(false)
			// Instantly trigger UI refresh in parent component
			if (onUploadSuccess) {
				onUploadSuccess()
			}
		}
	}

	return (
		<>
			<button
				onClick={() => {
					setError(null)
					setIsOpen(true)
				}}
				className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer"
			>
				<Upload className="w-3.5 h-3.5" />
				Submit Assessment
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
					<div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
						<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{assessment.title}</h2>
						<p className="text-xs text-slate-500 mb-4">{assessment.module}</p>

						{isPastDeadline && (
							<div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
								<AlertTriangle className="w-4 h-4 shrink-0" />
								<span>
									The deadline has passed. Your submission will be visually flagged as <strong>LATE</strong>.
								</span>
							</div>
						)}

						{error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs font-semibold">⚠️ {error}</div>}

						<form onSubmit={handleSubmit} className="space-y-4">
							<input type="hidden" name="assessmentId" value={assessment.id} />

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Student Record</label>
								{unsubmittedStudents.length > 0 ? (
									<select name="studentId" required className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent dark:bg-slate-900 rounded-lg text-sm">
										<option value="">Select Student...</option>
										{unsubmittedStudents.map((s) => (
											<option key={s.id} value={s.id}>
												{s.fullName} ({s.studentId})
											</option>
										))}
									</select>
								) : (
									<div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-500 flex items-center gap-2">
										<CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
										All registered students have already submitted work for this assessment.
									</div>
								)}
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Upload Coursework File (.pdf, .docx — Max 50 MB)</label>
								<input name="file" type="file" accept=".pdf,.docx" required disabled={unsubmittedStudents.length === 0} className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm disabled:opacity-50" />
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
									Cancel
								</button>
								<button type="submit" disabled={isSubmitting || unsubmittedStudents.length === 0} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer">
									{isSubmitting ? "Uploading..." : "Confirm Submission"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
