"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type Role = "REGISTRY" | "STAFF" | "STUDENT"

interface AppContextType {
	role: Role
	setRole: (role: Role) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
	const [role, setRoleState] = useState<Role>("REGISTRY")

	// Load persisted role from localStorage safely on mount (client-side only)
	useEffect(() => {
		const savedRole = localStorage.getItem("sms_user_role") as Role
		if (savedRole && ["REGISTRY", "STAFF", "STUDENT"].includes(savedRole)) {
			setRoleState(savedRole)
		}
	}, [])

	const setRole = (newRole: Role) => {
		setRoleState(newRole)
		localStorage.setItem("sms_user_role", newRole)
	}

	return <AppContext.Provider value={{ role, setRole }}>{children}</AppContext.Provider>
}

export function useApp() {
	const context = useContext(AppContext)
	if (!context) {
		throw new Error("useApp must be used within an AppProvider")
	}
	return context
}
