import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { sendMessageToQueue } from '../services/rabbitmq.services';
import Usuario from '../models/user.models';

export const getUsua = async (req: Request, res: Response):Promise<any>=> {
    try {
      const usua = await Usuario.findAll(); 
      res.json(usua);
    } catch (error) {
      res.status(500).json(error);
    }
  };
  
export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
  
    try {
      console.log('Email recibido:', email);
  
      const user = await Usuario.findOne({ where: { email } });
      if (!user) {
        console.log('Usuario no encontrado');
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      console.log('Contraseña cifrada almacenada:', user.getDataValue('password'));
  
      const isMatch = await bcrypt.compare(password, user.getDataValue('password'));
      if (!isMatch) {
        console.log('Contraseña incorrecta');
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }
  
      const secretKey = process.env.JWT_SECRET || 'tu_clave_secreta';
      const token = jwt.sign(
        {
          id: user.getDataValue('id_Usuario'),
          name: user.getDataValue('name'),
          role: user.getDataValue('role'), 
        },
        secretKey,
        { expiresIn: '1h' }
      );
  
      console.log('Token generado:', token);
  
      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        role: user.getDataValue('role'), 
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  };