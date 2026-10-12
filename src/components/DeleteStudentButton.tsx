"use client"

import React, { useState } from "react"
import { deleteStudentAction } from "@/controllers/student"
import { Trash2 } from "lucide-react"

export function DeleteStudentButton({ student, onStudentDeleted }: { student: any; onStudentDeleted: () => void }) {
	const [isDeleting, setIsDeleting] = useState(false)

	const handleDelete = async () => {
		if (!confirm(`Are you sure you want to delete ${student.fullName} (${student.studentId})? This will also remove their grades, payments, and submissions.`)) {
			return
		}

		setIsDeleting(true)
		const res = await deleteStudentAction(student.id)
		setIsDeleting(false)

		if (!res.success) {
			alert(res.error || "Failed to delete student.")
		} else {
			onStudentDeleted()
		}
	}

	return (
		<button onClick={handleDelete} disabled={isDeleting} title="Delete Student Record" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition disabled:opacity-50 cursor-pointer">
			<Trash2 className="w-4 h-4" />
		</button>
	)
}
