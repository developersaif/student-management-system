"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import path from "path"
import fs from "fs/promises"

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB in bytes

// 1.  Create Assessment
export async function createAssessmentAction(formData: FormData) {
	const title = formData.get("title") as string
	const module = formData.get("module") as string
	const deadline = new Date(formData.get("deadline") as string)

	await prisma.assessment.create({
		data: { title, module, deadline },
	})

	revalidatePath("/assessments")
	revalidatePath("/marksheet")
	return { success: true }
}

// 2. Student Submit
export async function submitAssessmentAction(formData: FormData) {
	const assessmentId = formData.get("assessmentId") as string
	const studentId = formData.get("studentId") as string
	const file = formData.get("file") as File

	if (!file || file.size === 0) {
		return { success: false, error: "Please select a file to upload." }
	}

	// 50 MB File Size Validation Check
	if (file.size > MAX_FILE_SIZE) {
		const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
		return {
			success: false,
			error: `File size exceeds the 50 MB limit. Your file is ${fileSizeMB} MB.`,
		}
	}

	// File Format Validation (.pdf or .docx only)
	const allowedExtensions = ["pdf", "docx"]
	const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""

	if (!allowedExtensions.includes(fileExtension)) {
		return {
			success: false,
			error: "Invalid file format. Only .pdf and .docx files are accepted.",
		}
	}

	const assessment = await prisma.assessment.findUnique({
		where: { id: assessmentId },
	})

	if (!assessment) {
		return { success: false, error: "Assessment not found." }
	}

	const safeFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
	let fileUrl = ""

	// Check if vercel token exists (Production)
	if (process.env.BLOB_READ_WRITE_TOKEN) {
		// Production: Upload to Vercel Blob Cloud Storage
		const blob = await put(`submissions/${safeFileName}`, file, {
			access: "public",
		})
		fileUrl = blob.url
	} else {
		// Local Development: Save to local public/uploads directory
		const uploadDir = path.join(process.cwd(), "public", "uploads")
		await fs.mkdir(uploadDir, { recursive: true })

		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)
		const filePath = path.join(uploadDir, safeFileName)

		await fs.writeFile(filePath, buffer)
		fileUrl = `/uploads/${safeFileName}`
	}

	const now = new Date()
	const isLate = now > new Date(assessment.deadline)

	// Database Upsert
	await prisma.submission.upsert({
		where: {
			assessmentId_studentId: { assessmentId, studentId },
		},
		update: {
			fileName: file.name,
			fileUrl,
			isLate,
			submittedAt: now,
		},
		create: {
			assessmentId,
			studentId,
			fileName: file.name,
			fileUrl,
			isLate,
			submittedAt: now,
		},
	})

	revalidatePath("/assessments")
	revalidatePath("/marksheet")
	return { success: true }
}

// 3. Staff Update Grade
export async function recordGradeAction(formData: FormData) {
	const assessmentId = formData.get("assessmentId") as string
	const studentId = formData.get("studentId") as string
	const score = parseFloat(formData.get("score") as string)

	let gradeClass = "Fail"
	if (score >= 70) gradeClass = "Distinction"
	else if (score >= 60) gradeClass = "Merit"
	else if (score >= 40) gradeClass = "Pass"

	await prisma.grade.upsert({
		where: {
			assessmentId_studentId: { assessmentId, studentId },
		},
		update: {
			score,
			gradeClass,
		},
		create: {
			assessmentId,
			studentId,
			score,
			gradeClass,
			status: "WITHHELD",
		},
	})

	revalidatePath("/marksheet")
	return { success: true }
}

// 4. Staff Publish or Withhold Grade
export async function togglePublishGradeAction(gradeId: string, currentStatus: string) {
	const newStatus = currentStatus === "PUBLISHED" ? "WITHHELD" : "PUBLISHED"

	await prisma.grade.update({
		where: { id: gradeId },
		data: { status: newStatus as any },
	})

	revalidatePath("/marksheet")
	return { success: true }
}
