import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cluster from 'cluster';
import os from 'os';
import sequelize from './src/config/db';
import router from './src/routes/monitoreo.routes';
import pecesRouter from './src/routes/peces.routes';
import userRouter from './src/routes/user.routes';
import loginUser from './src/routes/login.routes';
import salesRouter from './src/routes/sales.routes';
import { connectToRabbitMQ } from './src/services/rabbitmq.services';
import { verifyConnection } from './src/services/email.services';

dotenv.config();

const numCPUs = os.cpus().length; // Obtiene el número de núcleos de la CPU
const port = process.env.PORT || 3000;

if (cluster.isPrimary) {
  console.log(`Proceso maestro ${process.pid} corriendo`);
  
  // Crea un worker por cada núcleo disponible
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Si un worker muere, se reinicia automáticamente
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} ha muerto. Creando uno nuevo...`);
    cluster.fork();
  });

} else {
  // Código que ejecutarán los workers
  const app = express();
  app.use(cors());
  verifyConnection();

  app.use(express.json());
  app.use('/api', router, userRouter, loginUser, pecesRouter, salesRouter);

  (async () => {
    try {
      await sequelize.sync({ alter: true });
      console.log(`Worker ${process.pid}: Conectado a la base de datos`);

      await connectToRabbitMQ();
      console.log(`Worker ${process.pid}: Conectado a RabbitMQ`);

      app.listen(port, () => {
        console.log(`Worker ${process.pid} escuchando en el puerto ${port}`);
      });
    } catch (error) {
      console.error(`Worker ${process.pid}: Error en la inicialización`, error);
    }
  })();
}
