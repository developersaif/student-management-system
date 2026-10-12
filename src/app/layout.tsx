import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/context/AppContext"
import { Navigation } from "@/components/Navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Student Management System",
	description: "Role-based Student Management System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen`}>
				<AppProvider>
					<div className="flex flex-col md:flex-row min-h-screen w-full">
						<Navigation />
						<main className="flex-1 w-full max-w-full overflow-x-hidden min-w-0">{children}</main>
					</div>
				</AppProvider>
			</body>
		</html>
	)
}
