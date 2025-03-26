import { parentPort, workerData } from 'worker_threads';
import { Semaphore } from 'async-mutex';

const semaphore = new Semaphore(2);  // Permitir máximo 2 procesos al mismo tiempo

const updatePez = async (data: any) => {
  const release = await semaphore.acquire();
  try {
    console.log('Actualizando pez:', data);
    // Lógica para actualizar el pez
  } finally {
    release();
  }
  return { status: 'success', message: 'Pez actualizado exitosamente' };
};

updatePez(workerData).then(result => parentPort?.postMessage(result));