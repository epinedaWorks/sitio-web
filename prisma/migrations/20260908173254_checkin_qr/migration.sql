-- AlterTable
ALTER TABLE "AttendeeRegistration" ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "checkedInBy" TEXT,
ADD COLUMN     "checkinToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AttendeeRegistration_checkinToken_key" ON "AttendeeRegistration"("checkinToken");
