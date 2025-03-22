import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendMessageToQueue } from '../services/rabbitmq.services';
import { Request, Response } from "express";
import Usuario from '../models/user.models';

export const getUsua = async (req: Request, res: Response):Promise<any>=> {
  try {
    const usua = await Usuario.findAll(); 
    res.json(usua);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const createUser = async (req: Request, res: Response):Promise<any>=> {
  const { name, email, password, role } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUsuario = await Usuario.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const message = {
      action: 'create',
      id: newUsuario.getDataValue('id_Usuario'),
      name,
      email,
      hashedPassword,
      role
    };

    await sendMessageToQueue('userQueue', JSON.stringify(message));

    const secretKey = process.env.JWT_SECRET || 'tu_clave_secreta';
    const token = jwt.sign({ id: newUsuario.getDataValue('id_Usuario'), name }, secretKey, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      data: newUsuario,
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};


export const updateUser = async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const saltRounds = 10;
    let hashedPassword = password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const [affectedRows] = await Usuario.update(
      { name, email, password: hashedPassword, role },
      { where: { id_Usuario: id } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const message = {
      action: 'update',
      id,
      name,
      email,
      hashedPassword,
      role
    };

    await sendMessageToQueue('userQueue', JSON.stringify(message));

    res.json({
      message: 'Usuario actualizado exitosamente',
      data: { id, name }
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const deleteUser = async (req: Request, res: Response):Promise<any>=> {
  const { id } = req.params;

  try {
    const deletedRows = await Usuario.destroy({ where: { id_Usuario: id } });

    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const message = {
      action: 'delete',
      id
    };

    await sendMessageToQueue('userQueue', JSON.stringify(message));

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error });
  }
};