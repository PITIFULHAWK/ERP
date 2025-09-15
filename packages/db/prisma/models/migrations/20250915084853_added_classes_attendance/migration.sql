-- CreateEnum
CREATE TYPE "public"."CalendarFileType" AS ENUM ('IMAGE', 'PDF', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "public"."ClassType" AS ENUM ('REGULAR', 'PRACTICAL', 'TUTORIAL', 'SEMINAR', 'EXAM', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EnrollmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPPED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "public"."LiveClassType" AS ENUM ('LECTURE', 'PRACTICAL', 'TUTORIAL', 'SEMINAR', 'WORKSHOP', 'EXAM', 'REVIEW', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."LiveClassStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "public"."MeetingPlatform" AS ENUM ('ZOOM', 'GOOGLE_MEET', 'GOOGLE_CLASSROOM', 'MICROSOFT_TEAMS', 'WEBEX', 'CUSTOM_WEBRTC', 'CUSTOM_WEBSOCKET', 'HYBRID', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ResourceType" AS ENUM ('PRESENTATION', 'DOCUMENT', 'VIDEO', 'AUDIO', 'LINK', 'ASSIGNMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SectionEnrollmentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRANSFERRED', 'DROPPED');

-- CreateEnum
CREATE TYPE "public"."AssignmentType" AS ENUM ('INSTRUCTOR', 'ASSISTANT', 'LAB_INSTRUCTOR', 'GUEST_LECTURER', 'SUBSTITUTE');

-- CreateEnum
CREATE TYPE "public"."SectionResourceType" AS ENUM ('NOTES', 'ASSIGNMENT', 'SLIDES', 'HANDOUT', 'REFERENCE', 'VIDEO', 'AUDIO', 'LINK', 'ANNOUNCEMENT', 'SYLLABUS', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."Semester" DROP CONSTRAINT "Semester_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subject" DROP CONSTRAINT "Subject_semesterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."courses" DROP CONSTRAINT "courses_universityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."hostels" DROP CONSTRAINT "hostels_universityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."placements" DROP CONSTRAINT "placements_createdById_fkey";

-- CreateTable
CREATE TABLE "public"."academic_years" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "universityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."academic_calendars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isHoliday" BOOLEAN NOT NULL DEFAULT false,
    "academicYearId" TEXT NOT NULL,
    "courseId" TEXT,
    "semesterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."calendar_attachments" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileType" "public"."CalendarFileType" NOT NULL,
    "description" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calendarId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendances" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "sectionId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "classType" "public"."ClassType" NOT NULL DEFAULT 'REGULAR',
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "markedBy" TEXT NOT NULL,
    "remarks" TEXT,
    "academicYearId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."attendance_summaries" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "totalClasses" INTEGER NOT NULL DEFAULT 0,
    "presentClasses" INTEGER NOT NULL DEFAULT 0,
    "absentClasses" INTEGER NOT NULL DEFAULT 0,
    "attendancePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "currentSemester" INTEGER NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalCredits" INTEGER NOT NULL DEFAULT 0,
    "completedCredits" INTEGER NOT NULL DEFAULT 0,
    "cgpa" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."live_classes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subjectId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "sectionId" TEXT,
    "instructorId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "classType" "public"."LiveClassType" NOT NULL DEFAULT 'LECTURE',
    "status" "public"."LiveClassStatus" NOT NULL DEFAULT 'SCHEDULED',
    "meetingUrl" TEXT,
    "meetingId" TEXT,
    "meetingPassword" TEXT,
    "platform" "public"."MeetingPlatform",
    "classroomId" TEXT,
    "classroomInviteCode" TEXT,
    "teamsThreadId" TEXT,
    "teamsChannelId" TEXT,
    "webrtcConfig" TEXT,
    "websocketEndpoint" TEXT,
    "streamingKey" TEXT,
    "customPlatformData" TEXT,
    "recordingUrl" TEXT,
    "isRecorded" BOOLEAN NOT NULL DEFAULT false,
    "attendanceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "autoAttendance" BOOLEAN NOT NULL DEFAULT false,
    "maxStudents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL DEFAULT 60,
    "currentStudents" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."section_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."SectionEnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."professor_section_assignments" (
    "id" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT,
    "assignmentType" "public"."AssignmentType" NOT NULL DEFAULT 'INSTRUCTOR',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canMarkAttendance" BOOLEAN NOT NULL DEFAULT true,
    "canCreateResources" BOOLEAN NOT NULL DEFAULT true,
    "canConductLiveClasses" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professor_section_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."section_resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" "public"."SectionResourceType" NOT NULL DEFAULT 'NOTES',
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "content" TEXT,
    "sectionId" TEXT NOT NULL,
    "subjectId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_universityId_year_key" ON "public"."academic_years"("universityId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_subjectId_date_key" ON "public"."attendances"("studentId", "subjectId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_summaries_studentId_subjectId_academicYearId_key" ON "public"."attendance_summaries"("studentId", "subjectId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollments_studentId_courseId_academicYearId_key" ON "public"."student_enrollments"("studentId", "courseId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "sections_courseId_semesterId_academicYearId_code_key" ON "public"."sections"("courseId", "semesterId", "academicYearId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "section_enrollments_studentId_sectionId_key" ON "public"."section_enrollments"("studentId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "professor_section_assignments_professorId_sectionId_subject_key" ON "public"."professor_section_assignments"("professorId", "sectionId", "subjectId");

-- AddForeignKey
ALTER TABLE "public"."academic_years" ADD CONSTRAINT "academic_years_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "public"."universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."academic_calendars" ADD CONSTRAINT "academic_calendars_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."academic_calendars" ADD CONSTRAINT "academic_calendars_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."academic_calendars" ADD CONSTRAINT "academic_calendars_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calendar_attachments" ADD CONSTRAINT "calendar_attachments_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "public"."academic_calendars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."student_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendances" ADD CONSTRAINT "attendances_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_summaries" ADD CONSTRAINT "attendance_summaries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_summaries" ADD CONSTRAINT "attendance_summaries_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."student_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_summaries" ADD CONSTRAINT "attendance_summaries_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."attendance_summaries" ADD CONSTRAINT "attendance_summaries_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "public"."universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_enrollments" ADD CONSTRAINT "student_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_enrollments" ADD CONSTRAINT "student_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_enrollments" ADD CONSTRAINT "student_enrollments_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_enrollments" ADD CONSTRAINT "student_enrollments_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hostels" ADD CONSTRAINT "hostels_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "public"."universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."live_classes" ADD CONSTRAINT "live_classes_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."live_classes" ADD CONSTRAINT "live_classes_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."live_classes" ADD CONSTRAINT "live_classes_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."live_classes" ADD CONSTRAINT "live_classes_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."live_classes" ADD CONSTRAINT "live_classes_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sections" ADD CONSTRAINT "sections_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "public"."academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section_enrollments" ADD CONSTRAINT "section_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section_enrollments" ADD CONSTRAINT "section_enrollments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section_enrollments" ADD CONSTRAINT "section_enrollments_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "public"."student_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professor_section_assignments" ADD CONSTRAINT "professor_section_assignments_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professor_section_assignments" ADD CONSTRAINT "professor_section_assignments_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."professor_section_assignments" ADD CONSTRAINT "professor_section_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section_resources" ADD CONSTRAINT "section_resources_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section_resources" ADD CONSTRAINT "section_resources_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."section_resources" ADD CONSTRAINT "section_resources_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Semester" ADD CONSTRAINT "Semester_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
