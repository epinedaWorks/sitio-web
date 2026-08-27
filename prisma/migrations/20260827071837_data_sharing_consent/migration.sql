-- AlterTable
ALTER TABLE "AttendeeRegistration" ADD COLUMN     "compartirDatos" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SpeakerSubmission" ADD COLUMN     "compartirDatos" BOOLEAN NOT NULL DEFAULT false;
