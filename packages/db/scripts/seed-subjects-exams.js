/* eslint-disable no-console */
const { PrismaClient } = require('../prisma/generated/prisma')

const prisma = new PrismaClient()

// Optional: limit seeding to these specific semester IDs (provided by user)
const SEMESTER_IDS = [
  '1952d97e-a9b5-4643-aee5-fa98a3fab17a',
  '6462f1f3-d17c-4554-9abf-c15406adf40e',
  'd8a86bc2-b05c-43ca-bc14-8c957f226dae',
  'e8701b07-1a13-4aab-81a7-10984f6a460b',
  'de27ccad-8477-460a-821e-9eb5431e5fd7',
  'f35778ed-cd90-46c7-acef-a010e8ffcb61',
  'e3e4583d-5639-46ea-b302-bd504a4851cf',
  '9e428fb8-7022-4558-8476-d5ab2ca16e84',
  '62fd8658-c359-4b00-ad06-43274f629558',
  'e34a5bf7-cdcc-4d58-98ad-4781169caa63',
  'b8fd1457-20fb-4697-9e25-d90ab5e66a13',
  'da87c7e2-f10d-49a5-bdcc-546085ee1668',
  '228b294a-61ff-4b55-bc0e-27f5919afc64',
  'c4f18e99-7493-4880-90e5-d72074d18583',
  '61d423ec-93f7-46c6-8e7c-f2c1f8026fb6',
  'd7ec3e13-9cdd-4321-b45a-9b51dc712ecd',
  '20f160a8-30ce-4ec2-a35b-e9824d3c855e',
  '94a97bc3-e6fe-4c04-b4e6-a42982b5f318',
  'b93d4a47-a562-484f-aa7e-8208bf2afb73',
  '14e8916f-374d-428a-83b1-336d3a2ccae5',
  'f6ff70fd-2b31-4b4c-b45b-d4844ad3aa6e',
  'f216ed0c-ff26-463b-bea0-f2ddc9aee308',
  'd1518495-d697-440a-a997-b56481256a33',
  'daef5b40-bcab-4211-83f2-4405323198c6',
  '8bd93181-c734-4f3a-9a37-83dadbb93e49',
  'b55b2cd8-6ee2-4fd7-95d5-9b46324a3511',
  'eb0b6e2d-82ed-40bc-bb60-cf601bfa32e9',
  '3d0bd640-87cd-49b5-a1a3-029230bd1ac8',
  '36fe9aa2-afcb-4c76-945c-9a1402900cc1',
  '8a4194dd-2a41-4156-b0ee-cd5fe368a7fa',
  'b4801cdf-1c98-4b50-b638-9d42c877501d',
  'c653f413-c092-4e18-8a10-51319b627668',
  'd85bc981-b16d-48eb-a880-0efd024db426',
  '2d445d02-f962-4801-a1fc-6efc935f1e2f',
  'acfa734c-c2af-4504-80f3-53997118ec64',
  '24ba1e0d-5e57-4011-beee-7bb58de85085',
  '38624511-ba74-4b45-88fc-d7c90225d7fc',
  'b0d8fda8-253b-4dc6-a665-75436b2d3b51',
  'e67eea21-bbe1-4f41-b002-9909e1360605',
  'e9ef9391-2b91-43b4-8448-802acfa1f3d6',
]

async function main() {
  console.log('Seeding subjects and exams for all semesters...')

  const semesters = SEMESTER_IDS.length
    ? await prisma.semester.findMany({ where: { id: { in: SEMESTER_IDS } } })
    : await prisma.semester.findMany({})
  const examTypes = ['MID_TERM','FINAL_EXAM','QUIZ','PRACTICAL']

  for (const semester of semesters) {
    // Create 5 subjects if fewer exist
    const existingSubjects = await prisma.subject.findMany({ where: { semesterId: semester.id } })
    const toCreateSubjects = Math.max(0, 5 - existingSubjects.length)
    for (let i = 1; i <= toCreateSubjects; i++) {
      await prisma.subject.create({
        data: {
          name: `Subject ${semester.number}.${existingSubjects.length + i}`,
          code: `${semester.code}-SUB-${existingSubjects.length + i}`,
          credits: [2,3,4][Math.floor(Math.random()*3)],
          semesterId: semester.id,
        },
      })
    }

    // Create 2 exams if fewer exist
    const existingExams = await prisma.exam.findMany({ where: { semesterId: semester.id } })
    const toCreateExams = Math.max(0, 2 - existingExams.length)
    for (let i = 1; i <= toCreateExams; i++) {
      const idx = existingExams.length + i
      await prisma.exam.create({
        data: {
          name: `Exam ${semester.number}.${idx}`,
          type: examTypes[idx % examTypes.length],
          examDate: new Date(Date.now() + (semester.number * 10 + idx) * 24 * 60 * 60 * 1000),
          maxMarks: 100,
          semesterId: semester.id,
        },
      })
    }
  }

  console.log('Subjects and exams seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


