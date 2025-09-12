/* eslint-disable no-console */
const { PrismaClient } = require('../prisma/generated/prisma')

const prisma = new PrismaClient()

const UNIVERSITY_ID = '849b2f29-ad24-43d4-90dd-db4ec3b6ed5c'

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('Seeding database...')

  // Ensure only one university exists (keep the provided one)
  await prisma.university.deleteMany({ where: { id: { not: UNIVERSITY_ID } } }).catch(() => {})

  const uni = await prisma.university.findUnique({ where: { id: UNIVERSITY_ID } })
  if (!uni) {
    throw new Error(`University ${UNIVERSITY_ID} not found. Please create it first.`)
  }

  // Clean existing related data to avoid uniqueness conflicts
  await prisma.receipt.deleteMany().catch(() => {})
  await prisma.payment.deleteMany().catch(() => {})
  await prisma.examResult.deleteMany().catch(() => {})
  await prisma.exam.deleteMany().catch(() => {})
  await prisma.subject.deleteMany().catch(() => {})
  await prisma.semester.deleteMany().catch(() => {})
  await prisma.application.deleteMany().catch(() => {})
  await prisma.hostel.deleteMany().catch(() => {})
  await prisma.course.deleteMany().catch(() => {})
  await prisma.notice.deleteMany().catch(() => {})
  await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } }).catch(() => {})

  // Seed courses
  const courseNames = [
    ['Computer Science Engineering', 'CSE'],
    ['Mechanical Engineering', 'ME'],
    ['Electrical Engineering', 'EE'],
    ['Civil Engineering', 'CE'],
    ['Electronics & Communication', 'ECE'],
  ]

  const courses = []
  for (let i = 0; i < courseNames.length; i++) {
    const [name, code] = courseNames[i]
    const course = await prisma.course.create({
      data: {
        name,
        code: `${code}-${Date.now().toString().slice(-5)}-${i}`,
        credits: 0,
        totalSemester: 8,
        totalFees: 500000,
        universityId: UNIVERSITY_ID,
      },
    })
    courses.push(course)
  }

  // Skipping semesters and subjects for now per request

  // Seed hostels
  const hostels = []
  for (let i = 1; i <= 4; i++) {
    const hostel = await prisma.hostel.create({
      data: {
        name: `Hostel ${i}`,
        fees: 60000 + i * 5000,
        totalCapacity: 200,
        type: i % 2 === 0 ? 'AC' : 'NON_AC',
        universityId: UNIVERSITY_ID,
      },
    })
    hostels.push(hostel)
  }

  // Seed users (50 users)
  const roles = ['STUDENT', 'PROFESSOR']
  for (let i = 1; i <= 50; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: '$2a$10$4y6ZQqK8R3d5C2w9iKeGEO1w9P6h0o8x2hTjo0p5Xx9xXbT2m3w2S', // bcrypt for 'password'
        role: randomItem(roles),
        universityId: UNIVERSITY_ID,
        userStatus: 'VERIFIED',
      },
    })

    // Enroll some students to random courses and hostels
    if (user.role === 'STUDENT') {
      const course = randomItem(courses)
      await prisma.course.update({
        where: { id: course.id },
        data: {
          users: { connect: { id: user.id } },
          currentStudents: { increment: 1 },
        },
      })

      if (Math.random() < 0.4) {
        const hostel = randomItem(hostels)
        await prisma.user.update({
          where: { id: user.id },
          data: { hostelId: hostel.id },
        })
      }
    }
  }

  // Seed a few notices
  const notices = [
    { title: 'Welcome to the University', content: 'Orientation will be held next week.', type: 'GENERAL', priority: 'LOW', targetAudience: 'ALL' },
    { title: 'Exam Schedule Released', content: 'Please check the exam portal.', type: 'EXAM', priority: 'HIGH', targetAudience: 'STUDENTS' },
    { title: 'Hostel Maintenance', content: 'Scheduled maintenance this weekend.', type: 'HOSTEL', priority: 'MEDIUM', targetAudience: 'STUDENTS' },
  ]

  for (const n of notices) {
    await prisma.notice.create({
      data: {
        ...n,
        universityId: UNIVERSITY_ID,
      },
    })
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


