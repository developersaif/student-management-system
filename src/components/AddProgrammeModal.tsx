"use client"
import React, { useState } from "react"
import { createProgrammeAction, updateProgrammeAction } from "@/controllers/program"
import { Plus, AlertCircle, Edit } from "lucide-react"

interface AddProgrammeModalProps {
	programmeToEdit?: any
	onSuccess?: () => void
}

export function AddProgrammeModal({ programmeToEdit, onSuccess }: AddProgrammeModalProps) {
	const isEditing = !!programmeToEdit
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsSubmitting(true)

		const formData = new FormData(e.currentTarget)
		if (isEditing) {
			formData.append("id", programmeToEdit.id)
		}

		const res = isEditing ? await updateProgrammeAction(formData) : await createProgrammeAction(formData)

		setIsSubmitting(false)

		if (!res.success) {
			setError(res.error || (isEditing ? "Failed to update programme." : "Failed to add programme."))
		} else {
			setIsOpen(false)
			if (onSuccess) onSuccess()
		}
	}

	return (
		<>
			{isEditing ? (
				<button
					onClick={() => {
						setError(null)
						setIsOpen(true)
					}}
					className="px-2.5 py-1 text-xs border dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
				>
					<Edit className="w-3 h-3 text-slate-500" />
					Edit
				</button>
			) : (
				<button
					onClick={() => {
						setError(null)
						setIsOpen(true)
					}}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
				>
					<Plus className="w-4 h-4" />
					Add Programme
				</button>
			)}

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 text-left">
					<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
						<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{isEditing ? "Edit Academic Programme" : "Add Academic Programme"}</h2>
						<p className="text-xs text-slate-500 mb-4">{isEditing ? "Update details for this programme." : "Enter programme details to add it to the system."}</p>

						{error && (
							<div className="mb-4 p-3 bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold flex items-start gap-2.5">
								<AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
								<span className="break-words whitespace-normal leading-relaxed flex-1">{error}</span>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Programme Code *</label>
								<input name="code" type="text" defaultValue={isEditing ? programmeToEdit.code : ""} required placeholder="e.g. BSCS" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm uppercase" />
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Programme Name *</label>
								<input name="name" type="text" defaultValue={isEditing ? programmeToEdit.name : ""} required placeholder="e.g. BSc Computer Science" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Fee Amount ($) *</label>
								<input name="feeAmount" type="number" step="0.01" defaultValue={isEditing ? programmeToEdit.feeAmount : ""} required placeholder="e.g. 5000" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
							</div>

							<div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-800">
								<button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
									Cancel
								</button>
								<button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer">
									{isSubmitting ? (isEditing ? "Saving..." : "Adding...") : isEditing ? "Save Changes" : "Create Programme"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
