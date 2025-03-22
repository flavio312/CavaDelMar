import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors'
import sequelize from './src/config/db'; 
import router from './src/routes/monitoreo.routes';
import pecesRouter from './src/routes/peces.routes';
import userRouter from './src/routes/user.routes';
import loginUser from './src/routes/login.routes';
import salesRouter from './src/routes/sales.routes';
import { connectToRabbitMQ } from './src/services/rabbitmq.services';
import { verifyConnection } from './src/services/email.services';

const port = process.env.PORT || 3000;
dotenv.config();
const app = express();
app.use(cors());
verifyConnection();

app.use(express.json());
app.use('/api', router, userRouter, loginUser, pecesRouter, salesRouter);

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Conectado a la base de datos');

    await connectToRabbitMQ();
    console.log('Conectado a RabbitMQ');

    console.log('Cliente MQTT inicializado y suscrito a topics');

    app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  } catch (error) {
    console.error('Error al conectar y sincronizar la base de datos o RabbitMQ:', error);
  }
})();
