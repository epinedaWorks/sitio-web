-- AlterTable
-- "edad" pasa de número exacto a un rango de texto (ej. "25 - 34").
ALTER TABLE "AttendeeRegistration" ALTER COLUMN "edad" TYPE TEXT USING "edad"::TEXT;
ALTER TABLE "AttendeeRegistration" ADD COLUMN "aniosExperiencia" TEXT;
