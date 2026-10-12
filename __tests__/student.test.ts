import { vi, describe, beforeAll, afterAll, test, expect } from "vitest"
import "dotenv/config"
import { createStudentAction, updateStudentAction, deleteStudentAction } from "@/controllers/student"
import { prisma } from "@/lib/prisma"

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}))

describe("Student CRUD", () => {
	let testProgrammeId: string

	beforeAll(async () => {
		// Seed a dummy programme for testing foreign key requirements
		const prog = await prisma.programme.create({
			data: {
				code: `TST-${Date.now().toString().slice(-4)}`,
				name: "Test Programme",
				feeAmount: 5000,
			},
		})
		testProgrammeId = prog.id
	})

	afterAll(async () => {
		// Clean up test data
		await prisma.student.deleteMany({ where: { programmeId: testProgrammeId } })
		await prisma.programme.delete({ where: { id: testProgrammeId } })
		await prisma.$disconnect()
	})

	test("should successfully create a new student with valid data", async () => {
		const formData = new FormData()
		formData.append("fullName", "Alice Test")
		formData.append("email", `alice.${Date.now()}@example.com`)
		formData.append("programmeId", testProgrammeId)
		formData.append("academicYear", "Year 1")
		formData.append("dateOfBirth", "2005-06-20")

		const res = await createStudentAction(formData)
		expect(res.success).toBe(true)
	})

	test("should fail creation when required fields are missing", async () => {
		const formData = new FormData()
		formData.append("fullName", "")
		formData.append("email", "")
		formData.append("programmeId", "")
		formData.append("status", "")

		const res = await createStudentAction(formData)
		expect(res.success).toBe(false)
		expect(res.error).toContain("Please fill in all required fields.")
	})

	test("should fail creation when duplicate email is registered", async () => {
		const duplicateEmail = `duplicate.${Date.now()}@example.com`

		const formData1 = new FormData()
		formData1.append("fullName", "User One")
		formData1.append("email", duplicateEmail)
		formData1.append("programmeId", testProgrammeId)
		await createStudentAction(formData1)

		const formData2 = new FormData()
		formData2.append("fullName", "User Two")
		formData2.append("email", duplicateEmail)
		formData2.append("programmeId", testProgrammeId)

		const res = await createStudentAction(formData2)
		expect(res.success).toBe(false)
		expect(res.error).toContain("Email address already exists")
	})

	test("should successfully update an existing student", async () => {
		// Create a student directly in DB to update
		const email = `update.${Date.now()}@example.com`
		const student = await prisma.student.create({
			data: {
				studentId: `SMS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
				fullName: "Bob Original",
				email,
				dateOfBirth: new Date("2000-01-01"),
				academicYear: "Year 1",
				programmeId: testProgrammeId,
			},
		})

		const formData = new FormData()
		formData.append("id", student.id)
		formData.append("fullName", "Bob Updated")
		formData.append("email", email)
		formData.append("programmeId", testProgrammeId)
		formData.append("academicYear", "Year 2")
		formData.append("dateOfBirth", "2000-01-01")

		const res = await updateStudentAction(formData)
		expect(res.success).toBe(true)

		// Verify database update
		const updated = await prisma.student.findUnique({ where: { id: student.id } })
		expect(updated?.fullName).toBe("Bob Updated")
		expect(updated?.academicYear).toBe("Year 2")
	})

	test("should fail update when required fields are missing", async () => {
		const formData = new FormData()
		formData.append("id", "")
		formData.append("fullName", "")
		formData.append("email", "bob@example.com")
		formData.append("programmeId", testProgrammeId)

		const res = await updateStudentAction(formData)
		expect(res.success).toBe(false)
		expect(res.error).toContain("Please fill in all required fields.")
	})

	test("should successfully delete a student record", async () => {
		// Create a student to delete
		const email = `delete.${Date.now()}@example.com`
		const student = await prisma.student.create({
			data: {
				studentId: `SMS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
				fullName: "Charlie ToDelete",
				email,
				dateOfBirth: new Date("2002-05-05"),
				academicYear: "Year 1",
				programmeId: testProgrammeId,
			},
		})

		const res = await deleteStudentAction(student.id)
		expect(res.success).toBe(true)

		// Verify student is removed from database
		const found = await prisma.student.findUnique({ where: { id: student.id } })
		expect(found).toBeNull()
	})

	test("should handle missing student ID gracefully during deletion", async () => {
		const res = await deleteStudentAction("")
		expect(res.success).toBe(false)
		expect(res.error).toContain("Student ID missing")
	})
})
