-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "weekdays" TEXT[] DEFAULT ARRAY[]::TEXT[];
