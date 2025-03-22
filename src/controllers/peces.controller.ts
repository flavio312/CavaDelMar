import { Request, Response } from "express";
import { sendMessageToQueue } from "../services/rabbitmq.services";
import Peces from "../models/peces.models";

export const getPeces = async (req: Request, res: Response) => {
  try {
    const peces = await Peces.findAll();
    res.json(peces);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los datos de los peces' });
  }
};

export const createPeces = async (req: Request, res: Response) => {
  const { peso, tipo } = req.body;

  try {
    const newPez = await Peces.create({
      peso,
      tipo
    });

    const message = {
      action: 'create',
      id: newPez.getDataValue('id_pez'),  // Obtenemos el ID generado automáticamente
      peso,
      tipo
    };

    await sendMessageToQueue('pecesQueue', JSON.stringify(message));

    res.status(201).json({
      message: 'Datos guardados correctamente',
      data: newPez
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar los datos de los peces', details: error });
  }
};

export const updatePeces = async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;
  const { peso, tipo } = req.body;
  
  try {
    const [affectedRows] = await Peces.update(
      { peso, tipo },
      { where: { id_pez: id } }
    );

    if (affectedRows === 0) {
      res.json({ message: 'Datos actualizados correctamente' });
    } else {
      res.status(404).json({ error: 'No se encontró el pez' });
    }

    const message = {
      action: 'update',
      id,
      peso,
      tipo
    };
    await sendMessageToQueue('pecesQueue', JSON.stringify(message));

    res.json({
      message: 'Datos actualizados correctamente',
      data: { id, peso, tipo }
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar los datos del pez', details: error });
  }
};

export const deletePeces = async (req: Request, res: Response):Promise<any> => {
  const { id } = req.params;

  try {
    const deletedRows = await Peces.destroy({ where: { id_pez: id } });

    if (deletedRows === 0) {
      res.status(404).json({ message: 'Pez no encontrado' });
    } else {
      res.json({ message: 'Pez eliminado correctamente' });
    }

    const message = {
      action: 'delete',
      id
    };
    await sendMessageToQueue('pecesQueue', JSON.stringify(message));

  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar los datos del pez', details: error });
  }
};