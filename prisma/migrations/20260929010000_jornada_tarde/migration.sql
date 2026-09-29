-- AlterTable
-- Nuevo puesto de escaneo: jornada de la tarde (para quienes se quedan
-- después de almuerzo).
ALTER TABLE "AttendeeRegistration" ADD COLUMN "tardeAt" TIMESTAMP(3);
ALTER TABLE "AttendeeRegistration" ADD COLUMN "tardeBy" TEXT;
