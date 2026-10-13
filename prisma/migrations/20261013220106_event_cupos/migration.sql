-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "charlaAbierta" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inscripcionAbierta" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inscripcionMensaje" TEXT NOT NULL DEFAULT 'Ya se llenó el cupo de inscripción para este evento. ¡Gracias por tu interés! Síguenos en redes para enterarte de la próxima edición.',
ADD COLUMN     "modalidadMensaje" TEXT NOT NULL DEFAULT 'Ya se llenó el cupo para esta modalidad.',
ADD COLUMN     "proyectoAbierta" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tallerAbierta" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "VolunteerApplication" ALTER COLUMN "areas" DROP DEFAULT;
