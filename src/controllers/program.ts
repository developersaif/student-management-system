"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createProgrammeAction(formData: FormData) {
	try {
		const code = ((formData.get("code") as string) || "").trim()
		const name = ((formData.get("name") as string) || "").trim()
		const feeAmountRaw = formData.get("feeAmount") as string
		const feeAmount = feeAmountRaw ? parseFloat(feeAmountRaw) : 0

		if (!code || !name) {
			return { success: false, error: "Programme code and name are required." }
		}

		await prisma.programme.create({
			data: {
				code,
				name,
				feeAmount,
			},
		})

		revalidatePath("/programmes")
		revalidatePath("/students")
		revalidatePath("/fees")

		return { success: true }
	} catch (error: any) {
		if (error?.code === "P2002") {
			return {
				success: false,
				error: "This programme code or name has already been added.",
			}
		}

		console.error("Failed to create programme:", error)
		return {
			success: false,
			error: "Failed to add programme. Please check details and try again.",
		}
	}
}

export async function updateProgrammeAction(formData: FormData) {
	try {
		const id = formData.get("id") as string
		const code = ((formData.get("code") as string) || "").trim()
		const name = ((formData.get("name") as string) || "").trim()
		const feeAmountRaw = formData.get("feeAmount") as string
		const feeAmount = feeAmountRaw ? parseFloat(feeAmountRaw) : 0

		if (!id || !code || !name) {
			return { success: false, error: "Programme ID, code, and name are required." }
		}

		await prisma.programme.update({
			where: { id },
			data: {
				code,
				name,
				feeAmount,
			},
		})

		revalidatePath("/programmes")
		revalidatePath("/students")
		revalidatePath("/fees")

		return { success: true }
	} catch (error: any) {
		if (error?.code === "P2002") {
			return {
				success: false,
				error: "Another programme with this code or name already exists.",
			}
		}

		console.error("Failed to update programme:", error)
		return {
			success: false,
			error: "Failed to update programme.",
		}
	}
}
