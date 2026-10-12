"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Auto-generate ID based on the highest existing sequence
async function generateStudentId(): Promise<string> {
	const year = new Date().getFullYear()

	// Find the latest student ID created this year
	const latestStudent = await prisma.student.findFirst({
		where: { studentId: { startsWith: `SMS-${year}-` } },
		orderBy: { studentId: "desc" },
	})

	let nextSeq = 1
	if (latestStudent) {
		const parts = latestStudent.studentId.split("-")
		const lastSeq = parseInt(parts[2], 10)
		if (!isNaN(lastSeq)) {
			nextSeq = lastSeq + 1
		}
	}
	return `SMS-${year}-${String(nextSeq).padStart(4, "0")}`
}

// Create Student
export async function createStudentAction(formData: FormData) {
	try {
		const fullName = ((formData.get("fullName") as string) || "").trim()
		const email = ((formData.get("email") as string) || "").trim().toLowerCase()
		const programmeId = formData.get("programmeId") as string
		const academicYear = ((formData.get("academicYear") as string) || "Year 1").trim()
		const status = (formData.get("status") as any) || "ENROLLED"
		const dateOfBirthRaw = formData.get("dateOfBirth") as string

		if (!fullName || !email || !programmeId) {
			return { success: false, error: "Please fill in all required fields." }
		}

		const studentId = await generateStudentId()
		const dateOfBirth = dateOfBirthRaw ? new Date(dateOfBirthRaw) : new Date("2000-01-01")

		await prisma.student.create({
			data: {
				studentId,
				fullName,
				email,
				programmeId,
				academicYear,
				status,
				dateOfBirth,
			},
		})

		revalidatePath("/students")
		revalidatePath("/fees")
		revalidatePath("/")

		return { success: true }
	} catch (error: any) {
		if (error?.code === "P2002") {
			const target = error.meta?.target
			if (Array.isArray(target) && target.includes("email")) {
				return { success: false, error: "A student with this Email address already exists." }
			}
			if (Array.isArray(target) && target.includes("studentId")) {
				return { success: false, error: "Student ID generation collision. Please try submitting again." }
			}
			return { success: false, error: "A unique constraint failed (Email or Student ID already exists)." }
		}
		console.error("Failed to create student:", error)
		return { success: false, error: "Failed to create student." }
	}
}

// Update Student
export async function updateStudentAction(formData: FormData) {
	try {
		const id = formData.get("id") as string
		const fullName = ((formData.get("fullName") as string) || "").trim()
		const email = ((formData.get("email") as string) || "").trim().toLowerCase()
		const programmeId = formData.get("programmeId") as string
		const academicYear = ((formData.get("academicYear") as string) || "Year 1").trim()
		const status = (formData.get("status") as any) || "ENROLLED"
		const dateOfBirthRaw = formData.get("dateOfBirth") as string

		if (!id || !fullName || !email || !programmeId) {
			return { success: false, error: "Please fill in all required fields." }
		}

		const dateOfBirth = dateOfBirthRaw ? new Date(dateOfBirthRaw) : new Date("2000-01-01")

		await prisma.student.update({
			where: { id },
			data: {
				fullName,
				email,
				programmeId,
				academicYear,
				status,
				dateOfBirth,
			},
		})

		revalidatePath("/students")
		revalidatePath("/fees")
		revalidatePath("/")

		return { success: true }
	} catch (error: any) {
		if (error?.code === "P2002") {
			return { success: false, error: "Another student is already using this Email address." }
		}
		console.error("Failed to update student:", error)
		return { success: false, error: "Failed to update student details." }
	}
}

// Delete Student
export async function deleteStudentAction(studentDbId: string) {
	try {
		if (!studentDbId) return { success: false, error: "Student ID missing." }

		await prisma.grade.deleteMany({ where: { studentId: studentDbId } })
		await prisma.submission.deleteMany({ where: { studentId: studentDbId } })
		await prisma.payment.deleteMany({ where: { studentId: studentDbId } })

		await prisma.student.delete({ where: { id: studentDbId } })

		revalidatePath("/students")
		revalidatePath("/fees")
		revalidatePath("/")

		return { success: true }
	} catch (error: any) {
		console.error("Failed to delete student:", error)
		return { success: false, error: "Failed to delete student record." }
	}
}

// students search
export interface StudentFilterOptions {
	search?: string
	programmeId?: string
	status?: string
}

export async function searchStudentsAction(options: StudentFilterOptions = {}) {
	try {
		const { search = "", programmeId = "ALL", status = "ALL" } = options

		const where: any = {}

		if (programmeId && programmeId !== "ALL") {
			where.programmeId = programmeId
		}

		if (status && status !== "ALL") {
			where.status = status
		}

		const trimmedSearch = search.trim()
		if (trimmedSearch) {
			where.OR = [{ fullName: { contains: trimmedSearch, mode: "insensitive" } }, { studentId: { contains: trimmedSearch, mode: "insensitive" } }, { email: { contains: trimmedSearch, mode: "insensitive" } }]
		}

		const students = await prisma.student.findMany({
			where,
			include: {
				programme: true,
			},
			orderBy: { createdAt: "desc" },
		})

		return { success: true, students }
	} catch (error) {
		console.error("Failed to search students:", error)
		return { success: false, students: [], error: "Failed to search student directory." }
	}
}
