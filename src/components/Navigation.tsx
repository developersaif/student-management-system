"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Users, DollarSign, FileText, Award, LayoutDashboard, BookOpen, Menu, X } from "lucide-react"
import { useApp, Role } from "@/context/AppContext"

export function Navigation() {
	const pathname = usePathname()
	const router = useRouter()
	const { role, setRole } = useApp()
	const [mounted, setMounted] = useState(false)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		setIsOpen(false)
	}, [pathname])

	const registryLinks = [
		{ href: "/", label: "Overview", icon: LayoutDashboard },
		{ href: "/students", label: "Enrolment", icon: Users },
		{ href: "/programmes", label: "Programmes", icon: BookOpen },
		{ href: "/fees", label: "Fees & Payments", icon: DollarSign },
	]

	const staffLinks = [
		{ href: "/assessments", label: "Assessments", icon: FileText },
		{ href: "/marksheet", label: "Marksheet", icon: Award },
	]

	const studentLinks = [
		{ href: "/assessments", label: "My Assessments", icon: FileText },
		{ href: "/marksheet", label: "My Results", icon: Award },
	]

	const activeRole = mounted ? role : "REGISTRY"

	const links = activeRole === "REGISTRY" ? registryLinks : activeRole === "STAFF" ? staffLinks : studentLinks

	const handleRoleSwitch = (newRole: Role) => {
		if (newRole === role) return
		setRole(newRole)

		if (newRole === "STAFF" || newRole === "STUDENT") {
			if (pathname === "/" || pathname === "/students" || pathname === "/programmes" || pathname === "/fees") {
				router.push("/assessments")
			} else {
				router.refresh()
			}
		} else if (newRole === "REGISTRY") {
			router.push("/")
		}
	}

	const navContent = (
		<div className="flex flex-col justify-between h-full p-4 space-y-4">
			<div className="space-y-4">
				{/* Sleek, Professional Brand Header */}
				<div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
					<div className="flex items-center gap-2.5">
						<div className="px-3 py-1 rounded-lg bg-blue-600 text-white font-black text-sm tracking-widest shadow-xs">SMS</div>
						<span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Management</span>
					</div>
					<button onClick={() => setIsOpen(false)} className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
						<X className="w-4 h-4" />
					</button>
				</div>

				{/* Clean 3-Way Role Switcher without "Active Context" text */}
				<div className="p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
					<div className="grid grid-cols-3 gap-1">
						<button onClick={() => handleRoleSwitch("REGISTRY")} className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all duration-150 text-center cursor-pointer ${role === "REGISTRY" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}>
							Registry
						</button>
						<button onClick={() => handleRoleSwitch("STAFF")} className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all duration-150 text-center cursor-pointer ${role === "STAFF" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}>
							Staff
						</button>
						<button onClick={() => handleRoleSwitch("STUDENT")} className={`py-1.5 px-1 rounded-lg text-xs font-semibold transition-all duration-150 text-center cursor-pointer ${role === "STUDENT" ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}>
							Student
						</button>
					</div>
				</div>

				{/* Dynamic Nav Links */}
				<div className="space-y-1">
					<p className="px-2 text-[10px] font-bold tracking-wider uppercase text-slate-400 mb-1">Navigation</p>
					<nav className="space-y-1">
						{links.map((link) => {
							const Icon = link.icon
							const isActive = pathname === link.href

							return (
								<Link key={link.href} href={link.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive ? "bg-blue-600 text-white font-semibold shadow-xs" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"}`}>
									<Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
									{link.label}
								</Link>
							)
						})}
					</nav>
				</div>
			</div>

			{/* Footer System Status */}
			<div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
				<span className="font-medium">System Status</span>
				<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-200/50 dark:border-emerald-800/50">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
					Online
				</span>
			</div>
		</div>
	)

	if (!mounted) return null

	return (
		<>
			{/* Mobile Header */}
			<div className="md:hidden flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 sticky top-0 z-40">
				<div className="flex items-center gap-2">
					<div className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-black text-sm tracking-wider">SMS</div>
				</div>
				<button onClick={() => setIsOpen(true)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer">
					<Menu className="w-5 h-5" />
				</button>
			</div>

			{/* Mobile Drawer Overlay */}
			{isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 md:hidden transition-opacity" />}

			{/* Mobile Slide-Out Drawer */}
			<aside className={`fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-50 transform transition-transform duration-200 ease-out md:hidden shadow-2xl border-r border-slate-200 dark:border-slate-800 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>{navContent}</aside>

			{/* Desktop Persistent Sidebar */}
			<aside className="hidden md:flex w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 shrink-0 overflow-y-auto">{navContent}</aside>
		</>
	)
}
