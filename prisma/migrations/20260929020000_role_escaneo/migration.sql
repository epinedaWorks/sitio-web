-- AlterEnum
-- Nuevo rol "ESCANEO": una cuenta que solo puede entrar a Tomar asistencia
-- (según los puestos que se le asignen en scanTipos) y no ve nada más del panel.
ALTER TYPE "Role" ADD VALUE 'ESCANEO';
