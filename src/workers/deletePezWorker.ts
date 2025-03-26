import { parentPort, workerData } from 'worker_threads';
import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();

const deletePez = (data: any) => {
  eventEmitter.emit('delete', data);
  console.log('Eliminando pez:', data);
  return { status: 'success', message: 'Pez eliminado exitosamente' };
};

eventEmitter.on('delete', (data) => {
  console.log('Evento de eliminación recibido para el pez:', data);
});

const result = deletePez(workerData);
parentPort?.postMessage(result);