/* eslint-disable no-console */
import {
  PrismaClient,
  UserRole,
  ExamType,
  ResultStatus,
  AttendanceStatus,
  SectionResourceType,
  ApplicationStatus,
  EnrollmentStatus,
  ComplaintCategory,
  ComplaintStatus,
  ComplaintPriority,
  UpdateType,
  PaymentType,
  PaymentStatus,
  NoticeType,
  NoticePriority,
  NoticeAudience,
  LiveClassType,
  LiveClassStatus,
  MeetingPlatform,
  AssignmentType,
  SectionEnrollmentStatus,
  ClassType,
  Gender,
  HostelType
} from "../prisma/generated/prisma";
import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start enhanced seeding for admin panel testing...");

  // Clean up existing data in the correct order to avoid constraint violations
  await prisma.complaintUpdate.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.attendanceSummary.deleteMany();
  await prisma.sectionEnrollment.deleteMany();
  await prisma.professorSectionAssignment.deleteMany();
  await prisma.sectionResource.deleteMany();
  await prisma.section.deleteMany();
  await prisma.liveClass.deleteMany();
  await prisma.studentEnrollment.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.course.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.user.deleteMany();
  await prisma.university.deleteMany();

  // Create University
  const university = await prisma.university.create({
    data: {
      name: "Central University of Technology",
    },
  });

  const hashedPassword = await hash("password123", 10);

  // Create Admin Users (multiple for testing)
  const admin1 = await prisma.user.create({
    data: {
      name: "John Admin",
      email: "admin@university.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      universityId: university.id,
      userStatus: "VERIFIED",
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      name: "Sarah Administrator",
      email: "admin2@university.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      universityId: university.id,
      userStatus: "VERIFIED",
    },
  });

  // Create Academic Years
  const academicYear2024 = await prisma.academicYear.create({
    data: {
      year: "2024-2025",
      startDate: new Date("2024-08-01"),
      endDate: new Date("2025-05-31"),
      isActive: true,
      universityId: university.id,
      calendarPdfUrl: "https://example.com/calendar-2024-2025.pdf",
      calendarPdfName: "Academic Calendar 2024-2025.pdf",
      calendarUploadedAt: new Date("2024-07-15"),
    },
  });

  const academicYear2023 = await prisma.academicYear.create({
    data: {
      year: "2023-2024",
      startDate: new Date("2023-08-01"),
      endDate: new Date("2024-05-31"),
      isActive: false,
      universityId: university.id,
      calendarPdfUrl: "https://example.com/calendar-2023-2024.pdf",
      calendarPdfName: "Academic Calendar 2023-2024.pdf",
      calendarUploadedAt: new Date("2023-07-10"),
    },
  });

  // Create Hostels
  const hostel1 = await prisma.hostel.create({
    data: {
      name: "Alpha Hostel",
      fees: 50000,
      totalCapacity: 200,
      type: HostelType.AC,
      universityId: university.id,
    },
  });

  const hostel2 = await prisma.hostel.create({
    data: {
      name: "Beta Hostel",
      fees: 40000,
      totalCapacity: 300,
      type: HostelType.NON_AC,
      universityId: university.id,
    },
  });

  // Create Courses with comprehensive semester and subject structure
  const course1 = await prisma.course.create({
    data: {
      name: "Bachelor of Technology in Computer Science",
      code: "BTECH-CSE",
      credits: 160,
      totalSemester: 8,
      totalFees: 800000,
      universityId: university.id,
    },
  });

  // Create semesters for course1
  const semester1 = await prisma.semester.create({
    data: {
      number: 1,
      code: "BTECH-CSE-S1",
      courseId: course1.id,
    },
  });

  const semester2 = await prisma.semester.create({
    data: {
      number: 2,
      code: "BTECH-CSE-S2",
      courseId: course1.id,
    },
  });

  // Create subjects for semester 1
  const subject1_1 = await prisma.subject.create({
    data: {
      name: "Introduction to Programming",
      code: "CS101",
      credits: 4,
      semesterId: semester1.id,
    },
  });

  const subject1_2 = await prisma.subject.create({
    data: {
      name: "Calculus",
      code: "MA101",
      credits: 4,
      semesterId: semester1.id,
    },
  });

  const subject1_3 = await prisma.subject.create({
    data: {
      name: "Physics",
      code: "PH101",
      credits: 3,
      semesterId: semester1.id,
    },
  });

  const subject1_4 = await prisma.subject.create({
    data: {
      name: "English Communication",
      code: "EN101",
      credits: 3,
      semesterId: semester1.id,
    },
  });

  // Create subjects for semester 2
  const subject2_1 = await prisma.subject.create({
    data: {
      name: "Data Structures",
      code: "CS102",
      credits: 4,
      semesterId: semester2.id,
    },
  });

  const subject2_2 = await prisma.subject.create({
    data: {
      name: "Discrete Mathematics",
      code: "MA102",
      credits: 4,
      semesterId: semester2.id,
    },
  });

  const subject2_3 = await prisma.subject.create({
    data: {
      name: "Digital Electronics",
      code: "EC101",
      credits: 3,
      semesterId: semester2.id,
    },
  });

  const subject2_4 = await prisma.subject.create({
    data: {
      name: "Environmental Science",
      code: "ES101",
      credits: 2,
      semesterId: semester2.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: "Bachelor of Business Administration",
      code: "BBA",
      credits: 120,
      totalSemester: 6,
      totalFees: 600000,
      universityId: university.id,
    },
  });

  // Create semester for course2
  const semester3 = await prisma.semester.create({
    data: {
      number: 1,
      code: "BBA-S1",
      courseId: course2.id,
    },
  });

  // Create subjects for BBA semester 1
  const subject3_1 = await prisma.subject.create({
    data: {
      name: "Principles of Management",
      code: "BBA101",
      credits: 3,
      semesterId: semester3.id,
    },
  });

  const subject3_2 = await prisma.subject.create({
    data: {
      name: "Business Communication",
      code: "BBA102",
      credits: 3,
      semesterId: semester3.id,
    },
  });

  const subject3_3 = await prisma.subject.create({
    data: {
      name: "Business Mathematics",
      code: "BBA103",
      credits: 4,
      semesterId: semester3.id,
    },
  });

  // Create third course - Mechanical Engineering
  const course3 = await prisma.course.create({
    data: {
      name: "Bachelor of Technology in Mechanical Engineering",
      code: "BTECH-ME",
      credits: 160,
      totalSemester: 8,
      totalFees: 750000,
      universityId: university.id,
    },
  });

  const semester4 = await prisma.semester.create({
    data: {
      number: 1,
      code: "BTECH-ME-S1",
      courseId: course3.id,
    },
  });

  const subject4_1 = await prisma.subject.create({
    data: {
      name: "Engineering Mechanics",
      code: "ME101",
      credits: 4,
      semesterId: semester4.id,
    },
  });

  const subject4_2 = await prisma.subject.create({
    data: {
      name: "Engineering Drawing",
      code: "ME102",
      credits: 3,
      semesterId: semester4.id,
    },
  });

  // Create Professor Users
  const professors = [];
  for (let i = 0; i < 8; i++) {
    const professor = await prisma.user.create({
      data: {
        name: `Dr. ${faker.person.fullName()}`,
        email: `prof${i + 1}@university.com`,
        password: hashedPassword,
        role: UserRole.PROFESSOR,
        universityId: university.id,
        userStatus: "VERIFIED",
      },
    });
    professors.push(professor);
  }

  // Create Student Users (more students for comprehensive testing)
  const students = [];
  for (let i = 0; i < 20; i++) {
    const student = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: `student${i + 1}@university.com`,
        password: hashedPassword,
        role: UserRole.STUDENT,
        universityId: university.id,
        userStatus: "VERIFIED",
        hostelId: i % 3 === 0 ? hostel1.id : i % 3 === 1 ? hostel2.id : null, // 60% hostel residents
      },
    });
    students.push(student);
  }

  // Create Applications for Students
  for (const student of students) {
    await prisma.application.create({
      data: {
        firstName: student.name.split(" ")[0],
        lastName: student.name.split(" ").slice(1).join(" "),
        dateOfBirth: faker.date.past({ years: 20 }),
        gender: faker.helpers.arrayElement([Gender.MALE, Gender.FEMALE]),
        nationality: "Indian",
        phoneNumber: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        pincode: faker.location.zipCode(),
        class10Percentage: faker.number.float({
          min: 60,
          max: 99,
          precision: 0.01,
        }),
        class10Board: "CBSE",
        class10YearOfPassing: 2020,
        class12Percentage: faker.number.float({
          min: 60,
          max: 99,
          precision: 0.01,
        }),
        class12Board: "CBSE",
        class12YearOfPassing: 2022,
        class12Stream: "Science",
        preferredCourseId: faker.helpers.arrayElement([course1.id, course2.id, course3.id]),
        status: ApplicationStatus.VERIFIED,
        userId: student.id,
        verifiedById: faker.helpers.arrayElement([admin1.id, admin2.id]),
      },
    });
  }

  // Create Student Enrollments (distribute students across courses and semesters)
  const enrollments = [];
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    let courseId, semesterId, currentSemester;

    if (i < 8) {
      // First 8 students in CSE
      courseId = course1.id;
      if (i < 4) {
        semesterId = semester1.id;
        currentSemester = 1;
      } else {
        semesterId = semester2.id;
        currentSemester = 2;
      }
    } else if (i < 14) {
      // Next 6 students in BBA
      courseId = course2.id;
      semesterId = semester3.id;
      currentSemester = 1;
    } else {
      // Remaining students in Mechanical Engineering
      courseId = course3.id;
      semesterId = semester4.id;
      currentSemester = 1;
    }

    const enrollment = await prisma.studentEnrollment.create({
      data: {
        studentId: student.id,
        courseId,
        semesterId,
        academicYearId: academicYear2024.id,
        currentSemester,
        status: EnrollmentStatus.ACTIVE,
        totalCredits: currentSemester * 14, // Approximate credits
        completedCredits: (currentSemester - 1) * 14,
        cgpa: faker.number.float({ min: 6.0, max: 9.5, precision: 0.01 }),
      },
    });
    enrollments.push(enrollment);
  }

  // Create Multiple Sections for comprehensive testing
  const sectionA_CSE_S1 = await prisma.section.create({
    data: {
      name: "Section A",
      code: "A",
      courseId: course1.id,
      semesterId: semester1.id,
      academicYearId: academicYear2024.id,
      maxStudents: 30,
    },
  });

  const sectionB_CSE_S1 = await prisma.section.create({
    data: {
      name: "Section B",
      code: "B",
      courseId: course1.id,
      semesterId: semester1.id,
      academicYearId: academicYear2024.id,
      maxStudents: 30,
    },
  });

  const sectionA_CSE_S2 = await prisma.section.create({
    data: {
      name: "Section A",
      code: "A",
      courseId: course1.id,
      semesterId: semester2.id,
      academicYearId: academicYear2024.id,
      maxStudents: 30,
    },
  });

  const sectionA_BBA_S1 = await prisma.section.create({
    data: {
      name: "Section A",
      code: "A",
      courseId: course2.id,
      semesterId: semester3.id,
      academicYearId: academicYear2024.id,
      maxStudents: 25,
    },
  });

  const sectionA_ME_S1 = await prisma.section.create({
    data: {
      name: "Section A",
      code: "A",
      courseId: course3.id,
      semesterId: semester4.id,
      academicYearId: academicYear2024.id,
      maxStudents: 25,
    },
  });

  // Create comprehensive section enrollments
  const cseS1Enrollments = enrollments.filter((e) => e.semesterId === semester1.id);
  const cseS2Enrollments = enrollments.filter((e) => e.semesterId === semester2.id);
  const bbaS1Enrollments = enrollments.filter((e) => e.semesterId === semester3.id);
  const meS1Enrollments = enrollments.filter((e) => e.semesterId === semester4.id);

  // Enroll CSE S1 students in sections (split between A and B)
  for (let i = 0; i < cseS1Enrollments.length; i++) {
    const enrollment = cseS1Enrollments[i];
    const sectionId = i < 2 ? sectionA_CSE_S1.id : sectionB_CSE_S1.id;
    await prisma.sectionEnrollment.create({
      data: {
        studentId: enrollment.studentId,
        sectionId,
        enrollmentId: enrollment.id,
        status: SectionEnrollmentStatus.ACTIVE,
      },
    });
  }

  // Enroll other students in their respective sections
  for (const enrollment of cseS2Enrollments) {
    await prisma.sectionEnrollment.create({
      data: {
        studentId: enrollment.studentId,
        sectionId: sectionA_CSE_S2.id,
        enrollmentId: enrollment.id,
        status: SectionEnrollmentStatus.ACTIVE,
      },
    });
  }

  for (const enrollment of bbaS1Enrollments) {
    await prisma.sectionEnrollment.create({
      data: {
        studentId: enrollment.studentId,
        sectionId: sectionA_BBA_S1.id,
        enrollmentId: enrollment.id,
        status: SectionEnrollmentStatus.ACTIVE,
      },
    });
  }

  for (const enrollment of meS1Enrollments) {
    await prisma.sectionEnrollment.create({
      data: {
        studentId: enrollment.studentId,
        sectionId: sectionA_ME_S1.id,
        enrollmentId: enrollment.id,
        status: SectionEnrollmentStatus.ACTIVE,
      },
    });
  }

  // Assign Professors to Sections with proper subject assignments
  const professorAssignments = [
    // CSE S1 Section A
    {
      professorId: professors[0].id,
      sectionId: sectionA_CSE_S1.id,
      subjectId: subject1_1.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
    {
      professorId: professors[1].id,
      sectionId: sectionA_CSE_S1.id,
      subjectId: subject1_2.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
    // CSE S1 Section B
    {
      professorId: professors[0].id,
      sectionId: sectionB_CSE_S1.id,
      subjectId: subject1_1.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
    {
      professorId: professors[1].id,
      sectionId: sectionB_CSE_S1.id,
      subjectId: subject1_2.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
    // CSE S2 Section A
    {
      professorId: professors[2].id,
      sectionId: sectionA_CSE_S2.id,
      subjectId: subject2_1.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
    {
      professorId: professors[3].id,
      sectionId: sectionA_CSE_S2.id,
      subjectId: subject2_2.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
    // BBA S1 Section A
    {
      professorId: professors[4].id,
      sectionId: sectionA_BBA_S1.id,
      subjectId: subject3_1.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
    {
      professorId: professors[5].id,
      sectionId: sectionA_BBA_S1.id,
      subjectId: subject3_2.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
    // ME S1 Section A
    {
      professorId: professors[6].id,
      sectionId: sectionA_ME_S1.id,
      subjectId: subject4_1.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
    {
      professorId: professors[7].id,
      sectionId: sectionA_ME_S1.id,
      subjectId: subject4_2.id,
      assignmentType: AssignmentType.INSTRUCTOR,
    },
  ];

  for (const assignment of professorAssignments) {
    await prisma.professorSectionAssignment.create({
      data: assignment,
    });
  }

  // Create Section Resources with proper user references
  const sectionResourcesData = [
    // CSE S1 Section A Resources
    {
      title: "Introduction to Programming - Lecture Notes",
      description: "Comprehensive notes covering basic programming concepts",
      resourceType: SectionResourceType.NOTES,
      sectionId: sectionA_CSE_S1.id,
      subjectId: subject1_1.id,
      uploadedBy: professors[0].id,
      fileUrl: "https://example.com/cs101-notes.pdf",
      fileName: "CS101_Lecture_Notes.pdf",
      fileSize: 2048576,
      mimeType: "application/pdf",
    },
    {
      title: "Programming Assignment 1",
      description: "Basic programming exercises and problems",
      resourceType: SectionResourceType.ASSIGNMENT,
      sectionId: sectionA_CSE_S1.id,
      subjectId: subject1_1.id,
      uploadedBy: professors[0].id,
      fileUrl: "https://example.com/cs101-assignment1.pdf",
      fileName: "CS101_Assignment_1.pdf",
      fileSize: 512000,
      mimeType: "application/pdf",
    },
    {
      title: "Calculus Formula Sheet",
      description: "Important formulas and theorems for calculus",
      resourceType: SectionResourceType.HANDOUT,
      sectionId: sectionA_CSE_S1.id,
      subjectId: subject1_2.id,
      uploadedBy: professors[1].id,
      fileUrl: "https://example.com/ma101-formulas.pdf",
      fileName: "MA101_Formula_Sheet.pdf",
      fileSize: 256000,
      mimeType: "application/pdf",
    },
    // CSE S2 Section A Resources
    {
      title: "Data Structures Presentation",
      description: "Slides covering arrays, linked lists, and trees",
      resourceType: SectionResourceType.SLIDES,
      sectionId: sectionA_CSE_S2.id,
      subjectId: subject2_1.id,
      uploadedBy: professors[2].id,
      fileUrl: "https://example.com/cs102-slides.pptx",
      fileName: "CS102_Data_Structures.pptx",
      fileSize: 4096000,
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
    // BBA S1 Section A Resources
    {
      title: "Management Principles Case Studies",
      description: "Real-world case studies for management principles",
      resourceType: SectionResourceType.REFERENCE,
      sectionId: sectionA_BBA_S1.id,
      subjectId: subject3_1.id,
      uploadedBy: professors[4].id,
      fileUrl: "https://example.com/bba101-cases.pdf",
      fileName: "BBA101_Case_Studies.pdf",
      fileSize: 1536000,
      mimeType: "application/pdf",
    },
    // ME S1 Section A Resources
    {
      title: "Engineering Mechanics Lab Manual",
      description: "Laboratory experiments and procedures",
      resourceType: SectionResourceType.HANDOUT,
      sectionId: sectionA_ME_S1.id,
      subjectId: subject4_1.id,
      uploadedBy: professors[6].id,
      fileUrl: "https://example.com/me101-lab-manual.pdf",
      fileName: "ME101_Lab_Manual.pdf",
      fileSize: 3072000,
      mimeType: "application/pdf",
    },
  ];

  for (const resourceData of sectionResourcesData) {
    await prisma.sectionResource.create({
      data: resourceData,
    });
  }

  // Create comprehensive attendance records for testing
  const allSectionEnrollments = await prisma.sectionEnrollment.findMany({
    include: {
      section: true,
      enrollment: true,
    },
  });

  // Create attendance for the last 30 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (const sectionEnrollment of allSectionEnrollments) {
    // Get subjects for this section's semester
    let sectionSubjects = [];
    if (sectionEnrollment.section.semesterId === semester1.id) {
      sectionSubjects = [subject1_1, subject1_2, subject1_3, subject1_4];
    } else if (sectionEnrollment.section.semesterId === semester2.id) {
      sectionSubjects = [subject2_1, subject2_2, subject2_3, subject2_4];
    } else if (sectionEnrollment.section.semesterId === semester3.id) {
      sectionSubjects = [subject3_1, subject3_2, subject3_3];
    } else if (sectionEnrollment.section.semesterId === semester4.id) {
      sectionSubjects = [subject4_1, subject4_2];
    }

    for (const subject of sectionSubjects) {
      // Create attendance for each subject for the last 15 days (excluding weekends)
      for (let i = 0; i < 15; i++) {
        const attendanceDate = new Date(startDate);
        attendanceDate.setDate(attendanceDate.getDate() + i * 2); // Every other day

        // Skip weekends
        if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) {
          continue;
        }

        const status = faker.helpers.arrayElement([
          AttendanceStatus.PRESENT,
          AttendanceStatus.PRESENT,
          AttendanceStatus.PRESENT,
          AttendanceStatus.ABSENT, // 25% chance of being absent
        ]);

        await prisma.attendance.create({
          data: {
            studentId: sectionEnrollment.studentId,
            enrollmentId: sectionEnrollment.enrollmentId,
            subjectId: subject.id,
            sectionId: sectionEnrollment.sectionId,
            date: attendanceDate,
            status,
            classType: ClassType.REGULAR,
            markedBy: professors[0].id, // First professor marks attendance
            academicYearId: academicYear2024.id,
            remarks: status === AttendanceStatus.ABSENT ? "Absent without notice" : null,
          },
        });
      }
    }
  }

  // Create Attendance Summaries
  for (const sectionEnrollment of allSectionEnrollments) {
    let sectionSubjects = [];
    if (sectionEnrollment.section.semesterId === semester1.id) {
      sectionSubjects = [subject1_1, subject1_2, subject1_3, subject1_4];
    } else if (sectionEnrollment.section.semesterId === semester2.id) {
      sectionSubjects = [subject2_1, subject2_2, subject2_3, subject2_4];
    } else if (sectionEnrollment.section.semesterId === semester3.id) {
      sectionSubjects = [subject3_1, subject3_2, subject3_3];
    } else if (sectionEnrollment.section.semesterId === semester4.id) {
      sectionSubjects = [subject4_1, subject4_2];
    }

    for (const subject of sectionSubjects) {
      const totalClasses = 10; // Approximate classes in the period
      const presentClasses = faker.number.int({ min: 6, max: 10 });
      const attendancePercentage = (presentClasses / totalClasses) * 100;

      await prisma.attendanceSummary.create({
        data: {
          studentId: sectionEnrollment.studentId,
          enrollmentId: sectionEnrollment.enrollmentId,
          subjectId: subject.id,
          academicYearId: academicYear2024.id,
          totalClasses,
          presentClasses,
          absentClasses: totalClasses - presentClasses,
          attendancePercentage,
          fromDate: startDate,
          toDate: new Date(),
        },
      });
    }
  }

  // Create Payments for Students
  for (const student of students) {
    // Course fee payment
    await prisma.payment.create({
      data: {
        userId: student.id,
        type: PaymentType.COURSE,
        courseId: enrollments.find(e => e.studentId === student.id)?.courseId,
        amount: 100000,
        status: faker.helpers.arrayElement([PaymentStatus.VERIFIED, PaymentStatus.PENDING]),
        verifiedById: faker.helpers.arrayElement([admin1.id, admin2.id]),
      },
    });

    // Hostel fee payment (if student has hostel)
    if (student.hostelId) {
      await prisma.payment.create({
        data: {
          userId: student.id,
          type: PaymentType.HOSTEL,
          hostelId: student.hostelId,
          amount: student.hostelId === hostel1.id ? 50000 : 40000,
          status: faker.helpers.arrayElement([PaymentStatus.VERIFIED, PaymentStatus.PENDING]),
          verifiedById: faker.helpers.arrayElement([admin1.id, admin2.id]),
        },
      });
    }
  }

  // Create Exams and Results
  const midTermExam = await prisma.exam.create({
    data: {
      name: "Mid-Term Examination",
      type: ExamType.FINAL_EXAM,
      examDate: new Date("2024-10-15"),
      maxMarks: 100,
      semesterId: semester1.id,
    },
  });

  const finalExam = await prisma.exam.create({
    data: {
      name: "Final Examination",
      type: ExamType.FINAL_EXAM,
      examDate: new Date("2024-12-15"),
      maxMarks: 100,
      semesterId: semester2.id,
    },
  });

  // Create exam results for CSE students
  for (const student of students.slice(0, 8)) {
    const totalMarks = faker.number.int({ min: 40, max: 98 });
    const examResult = await prisma.examResult.create({
      data: {
        studentId: student.id,
        examId: midTermExam.id,
        totalMarksObtained: totalMarks,
        percentage: totalMarks,
        status: totalMarks >= 50 ? ResultStatus.PASS : ResultStatus.FAIL,
        remarks: totalMarks >= 50 ? "Good" : "Needs Improvement",
      },
    });

    // Create grades for individual subjects
    const subjects = [subject1_1, subject1_2, subject1_3, subject1_4];
    for (const subject of subjects) {
      const subjectMarks = faker.number.int({ min: 35, max: 100 });
      await prisma.grade.create({
        data: {
          marksObtained: subjectMarks,
          examResultId: examResult.id,
          subjectId: subject.id,
        },
      });
    }
  }

  // Create Live Classes
  const liveClasses = [
    {
      title: "Introduction to Programming - Week 1",
      description: "Basic programming concepts and syntax",
      subjectId: subject1_1.id,
      semesterId: semester1.id,
      academicYearId: academicYear2024.id,
      sectionId: sectionA_CSE_S1.id,
      instructorId: professors[0].id,
      scheduledAt: new Date("2024-09-20T10:00:00Z"),
      duration: 60,
      classType: LiveClassType.LECTURE,
      status: LiveClassStatus.COMPLETED,
      platform: MeetingPlatform.GOOGLE_MEET,
      meetingUrl: "https://meet.google.com/abc-defg-hij",
    },
    {
      title: "Data Structures Lab Session",
      description: "Hands-on implementation of arrays and linked lists",
      subjectId: subject2_1.id,
      semesterId: semester2.id,
      academicYearId: academicYear2024.id,
      sectionId: sectionA_CSE_S2.id,
      instructorId: professors[2].id,
      scheduledAt: new Date("2024-09-21T14:00:00Z"),
      duration: 90,
      classType: LiveClassType.PRACTICAL,
      status: LiveClassStatus.SCHEDULED,
      platform: MeetingPlatform.ZOOM,
      meetingUrl: "https://zoom.us/j/123456789",
    },
  ];

  for (const liveClass of liveClasses) {
    await prisma.liveClass.create({
      data: liveClass,
    });
  }

  // Create Complaints
  const complaints = [
    {
      title: "Hostel Wi-Fi Issues",
      description: "The Wi-Fi connection in Alpha Hostel is very slow and frequently disconnects.",
      category: ComplaintCategory.HOSTEL,
      priority: ComplaintPriority.MEDIUM,
      studentId: students[0].id,
      status: ComplaintStatus.OPEN,
      location: "Alpha Hostel - Room 201",
    },
    {
      title: "Library Book Shortage",
      description: "Not enough copies of required textbooks available in the library.",
      category: ComplaintCategory.LIBRARY,
      priority: ComplaintPriority.HIGH,
      studentId: students[1].id,
      status: ComplaintStatus.IN_PROGRESS,
      assignedTo: admin1.id,
      adminNotes: "Contacted book supplier for additional copies",
    },
    {
      title: "Mess Food Quality",
      description: "The food quality in the mess has deteriorated significantly.",
      category: ComplaintCategory.FOOD,
      priority: ComplaintPriority.HIGH,
      studentId: students[2].id,
      status: ComplaintStatus.RESOLVED,
      resolvedBy: admin2.id,
      resolvedAt: new Date(),
      resolutionNote: "Spoke with mess contractor and improved menu implemented",
    },
    {
      title: "Classroom Projector Not Working",
      description: "The projector in Room 101 has been malfunctioning for a week.",
      category: ComplaintCategory.INFRASTRUCTURE,
      priority: ComplaintPriority.MEDIUM,
      studentId: students[3].id,
      status: ComplaintStatus.OPEN,
      location: "Academic Block - Room 101",
    },
    {
      title: "Fee Payment Portal Issues",
      description: "Unable to make online fee payment due to website errors.",
      category: ComplaintCategory.FINANCIAL,
      priority: ComplaintPriority.CRITICAL,
      studentId: students[4].id,
      status: ComplaintStatus.IN_PROGRESS,
      assignedTo: admin1.id,
      urgency: true,
    },
  ];

  for (const complaint of complaints) {
    const createdComplaint = await prisma.complaint.create({
      data: complaint,
    });

    // Add some complaint updates
    await prisma.complaintUpdate.create({
      data: {
        complaintId: createdComplaint.id,
        updatedBy: complaint.studentId,
        updateType: UpdateType.COMMENT,
        message: "This issue is affecting my studies. Please resolve quickly.",
        isInternal: false,
      },
    });

    if (complaint.assignedTo) {
      await prisma.complaintUpdate.create({
        data: {
          complaintId: createdComplaint.id,
          updatedBy: complaint.assignedTo,
          updateType: UpdateType.ASSIGNMENT,
          message: "Complaint has been assigned for investigation.",
          isInternal: false,
        },
      });
    }
  }

  // Create Notices
  const notices = [
    {
      title: "Mid-Term Exam Schedule",
      content: "The mid-term examinations for the first semester will commence on October 15th, 2024. Students are advised to check their individual timetables on the student portal.",
      type: NoticeType.EXAM,
      priority: NoticePriority.HIGH,
      targetAudience: NoticeAudience.STUDENTS,
      universityId: university.id,
    },
    {
      title: 'Annual Tech Fest "Innovate 2024"',
      content: "Get ready for the biggest tech fest of the year! Innovate 2024 will be held from November 1st to 3rd. Registration is now open for various competitions and events.",
      type: NoticeType.GENERAL,
      priority: NoticePriority.MEDIUM,
      targetAudience: NoticeAudience.ALL,
      universityId: university.id,
    },
    {
      title: "Hostel Maintenance Schedule",
      content: "Scheduled maintenance work will be carried out in all hostels this weekend. Water supply may be affected between 10 AM to 4 PM on Saturday.",
      type: NoticeType.HOSTEL,
      priority: NoticePriority.MEDIUM,
      targetAudience: NoticeAudience.STUDENTS,
      universityId: university.id,
    },
    {
      title: "Faculty Meeting - Academic Planning",
      content: "All faculty members are requested to attend the academic planning meeting scheduled for September 25th at 2 PM in the conference hall.",
      type: NoticeType.ACADEMIC,
      priority: NoticePriority.HIGH,
      targetAudience: NoticeAudience.FACULTY,
      universityId: university.id,
    },
    {
      title: "Library Extended Hours",
      content: "The library will remain open until 11 PM during the examination period to facilitate student preparation.",
      type: NoticeType.GENERAL,
      priority: NoticePriority.LOW,
      targetAudience: NoticeAudience.STUDENTS,
      universityId: university.id,
    },
  ];

  for (const notice of notices) {
    await prisma.notice.create({
      data: notice,
    });
  }

  console.log("Enhanced seeding completed successfully!");
  console.log(`Created:
- 1 University
- 2 Academic Years
- 2 Admin users
- 8 Professor users
- 20 Student users with complete applications
- 3 Courses with comprehensive semester and subject structure
- 5 Sections across different courses and semesters
- ${allSectionEnrollments.length} Section enrollments
- 10 Professor-section assignments
- 6 Section resources with proper user references
- Comprehensive attendance records for 30 days
- Attendance summaries for all student-subject combinations
- ${students.length * 2} Payment records (course and hostel fees)
- 2 Exams with results and grades
- 2 Live classes with different platforms
- 5 Complaints across various categories with updates
- 5 Notices for different audiences
- Academic calendar entries with proper relationships`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });