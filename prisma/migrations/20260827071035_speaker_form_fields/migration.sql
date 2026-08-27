-- CreateEnum
CREATE TYPE "SpeakerNivel" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO');

-- AlterTable
ALTER TABLE "SpeakerSubmission" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "cargo" TEXT,
ADD COLUMN     "comentarios" TEXT,
ADD COLUMN     "comoSeEntero" TEXT,
ADD COLUMN     "edad" INTEGER,
ADD COLUMN     "empresa" TEXT,
ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "nivel" "SpeakerNivel",
ADD COLUMN     "pais" TEXT,
ADD COLUMN     "sigueComunidad" BOOLEAN;
