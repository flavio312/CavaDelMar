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

const numCPUs = os.cpus().length;
const port = process.env.PORT || '';

if (cluster.isMaster){
  console.log(`Proceso principal  ${process.pid} esta corriendo`);

  (async () => {
    try{
      await sequelize.sync({ alter: true });
      console.log('Conectado a la base de datos');
    }catch(err){
      console.log("Error en la sincronizacion en la base de datos",err);
    }
  })();

  for (let i = 0; i < numCPUs; i++){
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} murió. Creando otro...`);
    cluster.fork();
  });

}else{
   const app = express();
   app.use(cors());
   app.use(express.json());
   app.use('/api', router, userRouter, loginUser, pecesRouter, salesRouter);
 
   verifyConnection();
   connectToRabbitMQ()
     .then(() => console.log(`Worker ${process.pid}: Conectado a RabbitMQ`))
     .catch(err => console.error(`Worker ${process.pid}: Error conectando a RabbitMQ`, err));
 
   app.listen(port, () => {
     console.log(`Worker ${process.pid} escuchando en el puerto ${port}`);
   });
}