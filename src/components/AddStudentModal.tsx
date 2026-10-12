"use client"

import React, { useState } from "react"
import { createStudentAction, updateStudentAction } from "@/controllers/student"
import { UserPlus, Edit3, AlertCircle } from "lucide-react"

interface AddStudentModalProps {
	studentToEdit?: any | null
	programmes: any[]
	onSuccess: () => void
}

export function AddStudentModal({ studentToEdit = null, programmes, onSuccess }: AddStudentModalProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const isEditing = Boolean(studentToEdit)
	const defaultDob = studentToEdit?.dateOfBirth ? new Date(studentToEdit.dateOfBirth).toISOString().split("T")[0] : "2002-01-01"

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsSubmitting(true)

		const formData = new FormData(e.currentTarget)
		const res = isEditing ? await updateStudentAction(formData) : await createStudentAction(formData)

		setIsSubmitting(false)

		if (!res.success) {
			setError(res.error || "Failed to save student record.")
		} else {
			setIsOpen(false)
			onSuccess()
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
					title="Edit Student Details"
					className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition cursor-pointer"
				>
					<Edit3 className="w-4 h-4" />
				</button>
			) : (
				<button
					onClick={() => {
						setError(null)
						setIsOpen(true)
					}}
					className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
				>
					<UserPlus className="w-4 h-4" />
					Add Student
				</button>
			)}

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 text-left">
					<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
						<div className="flex justify-between items-start mb-4">
							<div>
								<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{isEditing ? "Edit Student Profile" : "Enrol New Student"}</h2>
								<p className="text-xs text-slate-500">{isEditing ? "Update student information and enrolment status." : "Student ID will be auto-generated (e.g., SMS-2026-0001)."}</p>
							</div>
							{isEditing && <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">{studentToEdit.studentId}</span>}
						</div>

						{error && (
							<div className="mb-4 p-3 bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold flex items-center gap-2">
								<AlertCircle className="w-4 h-4 shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							{isEditing && <input type="hidden" name="id" value={studentToEdit.id} />}

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Full Name *</label>
								<input name="fullName" type="text" defaultValue={studentToEdit?.fullName || ""} required placeholder="e.g. Sarah Connor" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email Address *</label>
								<input name="email" type="email" defaultValue={studentToEdit?.email || ""} required placeholder="e.g. sarah.c@example.com" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Programme *</label>
									<select name="programmeId" defaultValue={studentToEdit?.programmeId || ""} required className="w-full px-3 py-2 border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm">
										<option value="">Select Programme</option>
										{programmes.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name} ({p.code})
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Academic Year</label>
									<select name="academicYear" defaultValue={studentToEdit?.academicYear || "Year 1"} className="w-full px-3 py-2 border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm">
										<option value="Year 1">Year 1</option>
										<option value="Year 2">Year 2</option>
										<option value="Year 3">Year 3</option>
										<option value="Postgraduate">Postgraduate</option>
									</select>
								</div>
							</div>

							{/* Reordered: Date of Birth first, then Enrolment Status */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Date of Birth</label>
									<input name="dateOfBirth" type="date" defaultValue={defaultDob} required className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm" />
								</div>

								<div>
									<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Enrolment Status</label>
									<select name="status" defaultValue={studentToEdit?.status || "ENROLLED"} className="w-full px-3 py-2 border dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm">
										<option value="ENROLLED">Enrolled</option>
										<option value="DEFERRED">Deferred</option>
										<option value="WITHDRAWN">Withdrawn</option>
										<option value="COMPLETED">Completed</option>
									</select>
								</div>
							</div>

							<div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-800">
								<button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
									Cancel
								</button>
								<button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer">
									{isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Enrol Student"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
