/* eslint-disable no-console */
const { PrismaClient } = require('../prisma/generated/prisma')

const prisma = new PrismaClient()

// Pass course IDs here or via env
const COURSE_IDS = [
  'fd14b8da-830c-4582-b985-9acf0df530ba',
  'b96b60e3-19e8-4994-922b-14260abb78b3',
  '77720655-a762-41a0-a2f2-510d3d344854',
  '60878027-3dc7-4913-a4cb-62ed619d956a',
  '46799e4a-86f2-41d2-b70e-21576e07fda8',
]

async function main() {
  console.log('Seeding semesters for provided courses...')

  for (const courseId of COURSE_IDS) {
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      console.warn(`Course not found: ${courseId}. Skipping.`)
      continue
    }

    // Create 8 semesters if not already present
    for (let semNum = 1; semNum <= 8; semNum++) {
      const code = `${course.code}-SEM-${semNum}`
      const existing = await prisma.semester.findFirst({ where: { code } })
      if (existing) {
        // also ensure subjects and exams exist for existing semester
        await ensureSubjectsAndExams(existing)
        continue
      }
      const semester = await prisma.semester.create({
        data: {
          number: semNum,
          code,
          courseId: courseId,
        },
      })
      await ensureSubjectsAndExams(semester)
    }

    console.log(`Semesters seeded for course ${course.code}`)
  }

  console.log('Semester seeding completed.')
}

async function ensureSubjectsAndExams(semester) {
  // Seed 5 subjects per semester if missing
  const existingSubjects = await prisma.subject.findMany({ where: { semesterId: semester.id } })
  if (existingSubjects.length < 5) {
    const countToCreate = 5 - existingSubjects.length
    for (let i = 1; i <= countToCreate; i++) {
      await prisma.subject.create({
        data: {
          name: `Subject ${semester.number}.${existingSubjects.length + i}`,
          code: `${semester.code}-SUB-${existingSubjects.length + i}`,
          credits: [2,3,4][Math.floor(Math.random()*3)],
          semesterId: semester.id,
        },
      })
    }
  }

  // Seed 2 exams per semester if missing
  const existingExams = await prisma.exam.findMany({ where: { semesterId: semester.id } })
  const needed = Math.max(0, 2 - existingExams.length)
  const examTypes = ['MID_TERM','FINAL_EXAM','QUIZ','PRACTICAL']
  for (let i = 0; i < needed; i++) {
    const examIdx = existingExams.length + i + 1
    await prisma.exam.create({
      data: {
        name: `Exam ${semester.number}.${examIdx}`,
        type: examTypes[examIdx % examTypes.length],
        examDate: new Date(Date.now() + (semester.number * 7 + examIdx) * 24 * 60 * 60 * 1000),
        maxMarks: 100,
        semesterId: semester.id,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
