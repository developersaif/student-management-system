"use client"

import React, { useState } from "react"
import { recordPaymentAction } from "@/controllers/payment"
import { DollarSign, AlertCircle } from "lucide-react"

export function RecordPaymentModal({ student, onPaymentRecorded }: { student: any; onPaymentRecorded?: () => void }) {
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError(null)
		setIsSubmitting(true)

		const formData = new FormData(e.currentTarget)
		const res = await recordPaymentAction(formData)

		setIsSubmitting(false)

		if (!res.success) {
			setError(res.error || "Failed to record payment.")
		} else {
			setIsOpen(false)
			if (onPaymentRecorded) onPaymentRecorded()
		}
	}

	return (
		<>
			<button
				onClick={() => {
					setError(null)
					setIsOpen(true)
				}}
				className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
			>
				<DollarSign className="w-3.5 h-3.5" />
				Record Payment
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
					<div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl">
						<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Record Fee Payment</h2>
						<p className="text-xs text-slate-500 mb-4">
							{student.fullName} ({student.studentId})
						</p>

						{error && (
							<div className="mb-4 p-3 bg-red-100 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs font-semibold flex items-start gap-2">
								<AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
								<span className="break-words whitespace-normal flex-1">{error}</span>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<input type="hidden" name="studentId" value={student.id} />

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Payment Amount ($)</label>
								<input name="amount" type="number" step="0.01" required placeholder="e.g. 1500" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Reference Number</label>
								<input name="referenceNumber" type="text" required placeholder="e.g. TXN-2026-9981" className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
								<p className="text-[11px] text-slate-400 mt-1">Reference numbers must be unique across all transactions.</p>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Payment Date</label>
								<input name="paymentDate" type="date" defaultValue={new Date().toISOString().split("T")[0]} required className="w-full px-3 py-2 border dark:border-slate-700 bg-transparent rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
									Cancel
								</button>
								<button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer">
									{isSubmitting ? "Recording..." : "Confirm Payment"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	)
}
