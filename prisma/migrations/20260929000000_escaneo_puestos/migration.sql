-- AlterTable
-- Nuevos puestos de escaneo del día del evento (exposición de proyectos,
-- coffee break y almuerzo), además de la entrada que ya existía.
ALTER TABLE "AttendeeRegistration" ADD COLUMN "proyectosAt" TIMESTAMP(3);
ALTER TABLE "AttendeeRegistration" ADD COLUMN "proyectosBy" TEXT;
ALTER TABLE "AttendeeRegistration" ADD COLUMN "coffeeAt" TIMESTAMP(3);
ALTER TABLE "AttendeeRegistration" ADD COLUMN "coffeeBy" TEXT;
ALTER TABLE "AttendeeRegistration" ADD COLUMN "almuerzoAt" TIMESTAMP(3);
ALTER TABLE "AttendeeRegistration" ADD COLUMN "almuerzoBy" TEXT;

-- AlterTable
-- Qué tipos de escaneo puede hacer cada usuario del panel (vacío = sin restricción).
ALTER TABLE "AdminUser" ADD COLUMN "scanTipos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
