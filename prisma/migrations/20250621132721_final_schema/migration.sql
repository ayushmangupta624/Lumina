-- CreateTable
CREATE TABLE "Coursevideo" (
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoFilePath" TEXT,
    "courseId" TEXT NOT NULL,
    "mainContentUrl" TEXT,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "Coursevideo_pkey" PRIMARY KEY ("videoId")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "lessonId" TEXT NOT NULL,
    "lessonName" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("lessonId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coursevideo_lessonId_key" ON "Coursevideo"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_courseId_lessonId_key" ON "Lesson"("courseId", "lessonId");

-- AddForeignKey
ALTER TABLE "Coursevideo" ADD CONSTRAINT "Coursevideo_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("lessonId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;
