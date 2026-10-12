"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function recordPaymentAction(formData: FormData) {
	try {
		const studentId = formData.get("studentId") as string
		const amountRaw = formData.get("amount") as string
		const referenceNumber = ((formData.get("referenceNumber") as string) || "").trim()
		const paymentDateRaw = formData.get("paymentDate") as string

		if (!studentId) {
			return { success: false, error: "Student ID is missing." }
		}

		const amount = parseFloat(amountRaw)
		if (isNaN(amount) || amount <= 0) {
			return { success: false, error: "Please enter a valid payment amount." }
		}

		if (!referenceNumber) {
			return { success: false, error: "Reference number is required." }
		}

		const paymentDate = paymentDateRaw ? new Date(paymentDateRaw) : new Date()

		// Record transaction
		await prisma.payment.create({
			data: {
				studentId,
				amount,
				referenceNumber,
				paymentDate,
			},
		})

		revalidatePath("/fees")
		revalidatePath("/students")
		revalidatePath("/")

		return { success: true }
	} catch (error: any) {
		// Catch Prisma Unique Constraint Error (P2002)
		if (error?.code === "P2002" || error?.message?.includes("referenceNumber")) {
			return {
				success: false,
				error: "This transaction reference number has already been used. Please enter a unique reference number.",
			}
		}

		console.error("Failed to record payment:", error)
		return {
			success: false,
			error: "An unexpected error occurred while processing the payment. Please try again.",
		}
	}
}
