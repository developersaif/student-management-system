import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
	console.log("🌱 Starting database seeding...")

	// 1. Safely clear existing database records
	try {
		await prisma.grade.deleteMany()
		await prisma.submission.deleteMany()
		await prisma.payment.deleteMany()
		await prisma.assessment.deleteMany()
		await prisma.student.deleteMany()
		await prisma.programme.deleteMany()
		console.log("🧹 Cleaned existing database tables.")
	} catch (err) {
		console.log("ℹ️ Table cleanup skipped (freshly created tables).")
	}

	// 2. Create 2 Programmes with Tuition Fees ($)
	const csProgramme = await prisma.programme.create({
		data: {
			name: "BSc Computer Science",
			code: "BSCS",
			feeAmount: 12000,
		},
	})

	const mbaProgramme = await prisma.programme.create({
		data: {
			name: "Master of Business Administration",
			code: "MBA",
			feeAmount: 15000,
		},
	})

	console.log("📚 Created 2 Programmes (BSCS & MBA).")

	// 3. Create 5 Enrolled Students (with dateOfBirth & academicYear)
	const student1 = await prisma.student.create({
		data: {
			studentId: "STU2026001",
			fullName: "Aarav Sharma",
			email: "aarav.sharma@example.com",
			dateOfBirth: new Date("2003-05-14"),
			academicYear: "Year 1",
			programmeId: csProgramme.id,
		},
	})

	const student2 = await prisma.student.create({
		data: {
			studentId: "STU2026002",
			fullName: "Nusrat Jahan",
			email: "nusrat.jahan@example.com",
			dateOfBirth: new Date("2002-11-20"),
			academicYear: "Year 2",
			programmeId: csProgramme.id,
		},
	})

	const student3 = await prisma.student.create({
		data: {
			studentId: "STU2026003",
			fullName: "Tariq Ahmed",
			email: "tariq.ahmed@example.com",
			dateOfBirth: new Date("2004-01-10"),
			academicYear: "Year 1",
			programmeId: csProgramme.id,
		},
	})

	const student4 = await prisma.student.create({
		data: {
			studentId: "STU2026004",
			fullName: "Zoe Rahman",
			email: "zoe.rahman@example.com",
			dateOfBirth: new Date("2001-08-05"),
			academicYear: "Year 3",
			programmeId: mbaProgramme.id,
		},
	})

	const student5 = await prisma.student.create({
		data: {
			studentId: "STU2026005",
			fullName: "David Miller",
			email: "david.miller@example.com",
			dateOfBirth: new Date("2000-03-25"),
			academicYear: "Year 2",
			programmeId: mbaProgramme.id,
		},
	})

	console.log("🎓 Created 5 Students.")

	// 4. Record Fee Payments (Fully paid vs Overdue accounts)
	// Student 1: Fully Paid ($12,000)
	await prisma.payment.createMany({
		data: [
			{
				studentId: student1.id,
				amount: 6000,
				referenceNumber: "TXN-2026-001A",
				paymentDate: new Date("2026-01-15"),
			},
			{
				studentId: student1.id,
				amount: 6000,
				referenceNumber: "TXN-2026-001B",
				paymentDate: new Date("2026-06-10"),
			},
		],
	})

	// Student 2: Partial Payment ($8,000 paid / $4,000 overdue)
	await prisma.payment.create({
		data: {
			studentId: student2.id,
			amount: 8000,
			referenceNumber: "TXN-2026-002A",
			paymentDate: new Date("2026-02-01"),
		},
	})

	// Student 3: Partial Payment ($5,000 paid / $7,000 overdue)
	await prisma.payment.create({
		data: {
			studentId: student3.id,
			amount: 5000,
			referenceNumber: "TXN-2026-003A",
			paymentDate: new Date("2026-03-01"),
		},
	})

	// Student 4: Fully Paid ($15,000)
	await prisma.payment.create({
		data: {
			studentId: student4.id,
			amount: 15000,
			referenceNumber: "TXN-2026-004A",
			paymentDate: new Date("2026-01-20"),
		},
	})

	// Student 5: Zero payments ($15,000 overdue - flagged on Registry Dashboard)

	console.log("💳 Created fee payment records and flagged overdue accounts.")

	// 5. Create Coursework Assessments
	const assessment1 = await prisma.assessment.create({
		data: {
			title: "Full-Stack Next.js Project",
			module: "CS501 Software Engineering",
			deadline: new Date("2026-11-15T23:59:59Z"),
		},
	})

	const assessment2 = await prisma.assessment.create({
		data: {
			title: "Database Architecture & Security",
			module: "CS502 Database Systems",
			deadline: new Date("2026-10-01T23:59:59Z"),
		},
	})

	console.log("📝 Created 2 Coursework Assessments.")

	// 6. Record Sample Student File Submissions
	await prisma.submission.create({
		data: {
			assessmentId: assessment1.id,
			studentId: student1.id,
			fileName: "aarav_sharma_nextjs_report.pdf",
			fileUrl: "/uploads/sample_report1.pdf",
			isLate: false,
			submittedAt: new Date("2026-10-10T14:30:00Z"),
		},
	})

	await prisma.submission.create({
		data: {
			assessmentId: assessment1.id,
			studentId: student2.id,
			fileName: "nusrat_jahan_project.pdf",
			fileUrl: "/uploads/sample_report2.pdf",
			isLate: false,
			submittedAt: new Date("2026-10-11T09:15:00Z"),
		},
	})

	await prisma.submission.create({
		data: {
			assessmentId: assessment2.id,
			studentId: student3.id,
			fileName: "tariq_db_security.docx",
			fileUrl: "/uploads/sample_report3.docx",
			isLate: true,
			submittedAt: new Date("2026-10-05T11:00:00Z"),
		},
	})

	console.log("📁 Created sample student file submissions.")

	// 7. Record Sample Grades with Status Flags
	await prisma.grade.create({
		data: {
			assessmentId: assessment1.id,
			studentId: student1.id,
			score: 85,
			gradeClass: "Distinction",
			status: "PUBLISHED",
		},
	})

	await prisma.grade.create({
		data: {
			assessmentId: assessment1.id,
			studentId: student2.id,
			score: 68,
			gradeClass: "Merit",
			status: "WITHHELD",
		},
	})

	await prisma.grade.create({
		data: {
			assessmentId: assessment2.id,
			studentId: student3.id,
			score: 52,
			gradeClass: "Pass",
			status: "PUBLISHED",
		},
	})

	console.log("🏆 Created sample grades and status flags (PUBLISHED / WITHHELD).")
	console.log("✅ Seeding completed successfully!")
}

main()
	.catch((e) => {
		console.error("❌ Error during seeding:", e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
