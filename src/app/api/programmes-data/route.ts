import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
	try {
		const programmes = await prisma.programme.findMany({
			orderBy: { name: "asc" },
		})
		return NextResponse.json({ programmes })
	} catch (error) {
		console.error("Failed to fetch programmes:", error)
		return NextResponse.json({ programmes: [] }, { status: 500 })
	}
}
