"use client"

import { useState } from "react"
import { createAssessmentAction } from "@/controllers/staff"

export function AddAssessmentModal({ onAssessmentCreated }: { onAssessmentCreated?: () => void }) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			<button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition cursor-pointer">
				+ Create Assessment
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl text-left">
						<h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Create New Assessment</h2>
						<form
							action={async (formData) => {
								await createAssessmentAction(formData)
								setIsOpen(false)
								if (onAssessmentCreated) onAssessmentCreated()
							}}
							className="space-y-4"
						>
							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Module Name / Code</label>
								<input name="module" type="text" required placeholder="e.g. CS101 - Software Engineering" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Assessment Title</label>
								<input name="title" type="text" required placeholder="e.g. Coursework 1: Database System Design" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Submission Deadline</label>
								<input name="deadline" type="datetime-local" required className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
									Cancel
								</button>
								<button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
									Publish Assessment
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
