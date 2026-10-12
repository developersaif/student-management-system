"use client"

import React, { useState } from "react"
import { recordGradeAction } from "@/controllers/staff"
import { Award } from "lucide-react"

export function GradeEntryModal({ assessment, student, existingGrade, onGradeUpdated }: { assessment: any; student: any; existingGrade?: any; onGradeUpdated?: () => void }) {
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitting(true)
		const formData = new FormData(e.currentTarget)
		await recordGradeAction(formData)
		setIsSubmitting(false)
		setIsOpen(false)

		// Trigger instant client-side data refresh
		if (onGradeUpdated) {
			onGradeUpdated()
		}
	}

	return (
		<>
			<button onClick={() => setIsOpen(true)} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition flex items-center gap-1 cursor-pointer">
				<Award className="w-3.5 h-3.5" />
				{existingGrade ? "Edit Grade" : "Enter Grade"}
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
					<div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
						<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Grade Entry</h2>
						<p className="text-xs text-slate-500 mb-4">
							{student.fullName} ({student.studentId}) — {assessment.title}
						</p>

						<form onSubmit={handleSubmit} className="space-y-4">
							<input type="hidden" name="assessmentId" value={assessment.id} />
							<input type="hidden" name="studentId" value={student.id} />

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Score / Mark (0 - 100)</label>
								<input name="score" type="number" min="0" max="100" step="0.1" defaultValue={existingGrade?.score ?? ""} required placeholder="e.g. 78" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
							</div>

							<div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg space-y-1">
								<p className="font-semibold text-slate-700 dark:text-slate-300">Grade Class Boundaries:</p>
								<p>
									• 70% – 100%: <strong>Distinction</strong>
								</p>
								<p>
									• 60% – 69%: <strong>Merit</strong>
								</p>
								<p>
									• 40% – 59%: <strong>Pass</strong>
								</p>
								<p>
									• 0% – 39%: <strong>Fail</strong>
								</p>
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border dark:border-slate-700 rounded-lg text-sm cursor-pointer">
									Cancel
								</button>
								<button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
									{isSubmitting ? "Saving..." : "Save Grade"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
