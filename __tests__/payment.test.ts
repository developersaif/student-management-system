import { vi, describe, beforeAll, afterAll, test, expect } from "vitest"
import "dotenv/config"
import { prisma } from "@/lib/prisma"

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}))

describe("Student Payment Records & Constraints", () => {
	let testProgrammeId: string
	let testStudentId: string

	beforeAll(async () => {
		// 1. Create a dummy programme
		const prog = await prisma.programme.create({
			data: {
				code: `PAY-${Date.now().toString().slice(-4)}`,
				name: "Financial Test Programme",
				feeAmount: 10000,
			},
		})
		testProgrammeId = prog.id

		// 2. Create a dummy student for the payments
		const student = await prisma.student.create({
			data: {
				studentId: `SMS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
				fullName: "Payment Test Student",
				email: `pay.student.${Date.now()}@example.com`,
				dateOfBirth: new Date("2002-04-10"),
				academicYear: "Year 1",
				programmeId: testProgrammeId,
			},
		})
		testStudentId = student.id
	})

	afterAll(async () => {
		// Clean up test records
		await prisma.payment.deleteMany({ where: { studentId: testStudentId } })
		await prisma.student.delete({ where: { id: testStudentId } })
		await prisma.programme.delete({ where: { id: testProgrammeId } })
		await prisma.$disconnect()
	})

	// ==================== PAYMENT TESTS ====================
	test("should successfully record a tuition fee payment", async () => {
		const payment = await prisma.payment.create({
			data: {
				studentId: testStudentId,
				amount: 5000,
				referenceNumber: `TXN-TEST-${Date.now()}`,
				paymentDate: new Date(),
			},
		})

		expect(payment).toBeDefined()
		expect(payment.amount).toBe(5000)
		expect(payment.studentId).toBe(testStudentId)
	})

	test("should fail when recording a payment with a duplicate reference number", async () => {
		const uniqueRef = `TXN-UNIQUE-${Date.now()}`

		// First payment with unique reference
		await prisma.payment.create({
			data: {
				studentId: testStudentId,
				amount: 2500,
				referenceNumber: uniqueRef,
			},
		})

		// Second payment attempting to use the same reference number should fail
		await expect(
			prisma.payment.create({
				data: {
					studentId: testStudentId,
					amount: 2500,
					referenceNumber: uniqueRef, // Duplicate!
				},
			}),
		).rejects.toThrow()
	})

	test("should fail when linking payment to a non-existent student ID", async () => {
		await expect(
			prisma.payment.create({
				data: {
					studentId: "non-existent-student-uuid",
					amount: 1000,
					referenceNumber: `TXN-FAIL-${Date.now()}`,
				},
			}),
		).rejects.toThrow()
	})
})
