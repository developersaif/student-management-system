"use client"

import { useState } from "react"
import { togglePublishGradeAction } from "@/controllers/staff"
import { Eye, EyeOff } from "lucide-react"

export function PublishGradeButton({ grade, onGradeUpdated }: { grade: any; onGradeUpdated?: () => void }) {
	const [isPending, setIsPending] = useState(false)

	const isPublished = grade.status === "PUBLISHED"

	const handleToggle = async () => {
		setIsPending(true)
		await togglePublishGradeAction(grade.id, grade.status)
		setIsPending(false)

		// Trigger instant client-side data refresh
		if (onGradeUpdated) {
			onGradeUpdated()
		}
	}

	return (
		<button onClick={handleToggle} disabled={isPending} className={`cursor-pointer px-2.5 py-1 text-xs font-semibold rounded transition flex items-center gap-1 ${isPublished ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-200" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"}`}>
			{isPublished ? (
				<>
					<EyeOff className="w-3.5 h-3.5" />
					{isPending ? "Updating..." : "Withhold"}
				</>
			) : (
				<>
					<Eye className="w-3.5 h-3.5" />
					{isPending ? "Updating..." : "Publish Result"}
				</>
			)}
		</button>
	)
}
