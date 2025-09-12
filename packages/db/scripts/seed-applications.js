/* eslint-disable no-console */
const { PrismaClient } = require('../prisma/generated/prisma')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding applications (minimum target = 10)...')

  const MIN_APPLICATIONS = Number(process.env.MIN_APPLICATIONS || 10)

  // Phase 1: prefer NOT_VERIFIED non-admin users without application
  let users = await prisma.user.findMany({
    where: {
      role: { in: ['USER','STUDENT'] },
      userStatus: 'NOT_VERIFIED',
      applicationId: null,
    },
    include: { coursesOpted: true },
    take: MIN_APPLICATIONS,
  })

  // Phase 2: top-up with other eligible non-admins (still without application) if needed
  if (users.length < MIN_APPLICATIONS) {
    const alreadyIds = users.map(u => u.id)
    const extra = await prisma.user.findMany({
      where: {
        id: { notIn: alreadyIds },
        role: { in: ['USER','STUDENT'] },
        applicationId: null,
      },
      include: { coursesOpted: true },
      take: MIN_APPLICATIONS - users.length,
    })
    users = users.concat(extra)
  }

  if (!users.length) {
    console.log('No eligible users found to create applications.')
    return
  }

  // Use any existing course as preferred if the user doesn’t have one opted
  const courses = await prisma.course.findMany({ take: 10 })
  if (!courses.length) {
    console.warn('No courses found. Cannot create applications.')
    return
  }

  for (const user of users) {
    const preferredCourse = user.coursesOpted[0] || courses[Math.floor(Math.random() * courses.length)]

    await prisma.application.create({
      data: {
        firstName: user.name.split(' ')[0] || 'First',
        lastName: user.name.split(' ')[1] || 'Last',
        dateOfBirth: new Date('2002-01-01'),
        gender: 'OTHER',
        nationality: 'Indian',
        phoneNumber: `+91-9${Math.floor(100000000 + Math.random()*899999999)}`,
        address: '123 Main Street',
        city: 'City',
        state: 'State',
        pincode: '751001',
        class10Percentage: 85.0,
        class10Board: 'CBSE',
        class10YearOfPassing: 2018,
        class12Percentage: 88.0,
        class12Board: 'CBSE',
        class12YearOfPassing: 2020,
        class12Stream: 'Science',
        hasJeeMainsScore: true,
        jeeMainsScore: 200 + Math.floor(Math.random() * 50),
        jeeMainsRank: 10000 + Math.floor(Math.random() * 5000),
        jeeMainsYear: 2020,
        preferredCourseId: preferredCourse.id,
        userId: user.id,
      },
    })
  }

  console.log('Applications seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


