-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "city" TEXT,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "rateCenter" INTEGER,
ADD COLUMN     "rateExternal" INTEGER,
ADD COLUMN     "rateTravel" INTEGER,
ADD COLUMN     "specialties" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'פעיל';
