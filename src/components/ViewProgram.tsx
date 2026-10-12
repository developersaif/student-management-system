"use client"

import { useState } from "react"
import { AddProgrammeModal } from "@/components/AddProgrammeModal"
import { useRouter } from "next/navigation"

interface ViewProgramProps {
	initialProgrammes: any[]
}

export default function ViewProgram({ initialProgrammes }: ViewProgramProps) {
	const router = useRouter()
	const [programmes, setProgrammes] = useState<any[]>(initialProgrammes)
	const [, setIsLoading] = useState(false)

	// Fetch updated programmes after create/edit actions
	const fetchProgrammes = async () => {
		setIsLoading(true)
		try {
			const res = await fetch("/api/programmes-data")
			if (res.ok) {
				const data = await res.json()
				setProgrammes(data.programmes || [])
			}
		} catch (err) {
			console.error("Failed to load programmes:", err)
		} finally {
			setIsLoading(false)
		}
	}

	const handleRefresh = () => {
		fetchProgrammes()
		router.refresh()
	}

	return (
		<div className="p-4 md:p-8 space-y-6 max-w-full overflow-hidden">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Academic Programmes</h1>
					<p className="text-xs md:text-sm text-slate-500">Manage degree programmes and annual tuition fee amounts</p>
				</div>
				<AddProgrammeModal onSuccess={handleRefresh} />
			</div>

			<div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
				<table className="w-full min-w-[750px] text-left text-sm">
					<thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
						<tr>
							<th className="p-3.5 whitespace-nowrap">Code</th>
							<th className="p-3.5 whitespace-nowrap">Programme Name</th>
							<th className="p-3.5 whitespace-nowrap">Tuition Fee</th>
							<th className="p-3.5 whitespace-nowrap">Enrolled Students</th>
							<th className="p-3.5 text-right whitespace-nowrap">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
						{programmes.length > 0 ? (
							programmes.map((p) => (
								<tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
									<td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{p.code}</td>
									<td className="p-3.5 font-medium whitespace-nowrap">{p.name}</td>
									<td className="p-3.5 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">${Number(p.feeAmount).toLocaleString()}</td>
									<td className="p-3.5 whitespace-nowrap">{p._count?.students || 0} Students</td>
									<td className="p-3.5 text-right whitespace-nowrap">
										<AddProgrammeModal programmeToEdit={p} onSuccess={handleRefresh} />
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={5} className="p-8 text-center text-slate-500">
									No programmes found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
