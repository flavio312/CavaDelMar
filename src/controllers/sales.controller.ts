import { Request, Response } from "express";
import { sendMessageToQueue } from "../services/rabbitmq.services";
import Venta from "../models/sales.models";

export const getSales = async (req: Request, res: Response) => {
    try {
        const sales = await Venta.findAll();
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const createSales = async (req: Request, res: Response) => {
    const { id_Usuario, fecha_Venta, cantidad, peso, tipo } = req.body;

    try {
        // Crea una nueva venta en la base de datos
        const newSales = await Venta.create({
            id_Usuario,
            fecha_Venta,
            cantidad,
            peso,
            tipo
        });

        // Envía el mensaje a RabbitMQ
        const message = {
            action: 'create',
            id: newSales.getDataValue('id_venta'),
            id_Usuario,
            fecha_Venta,
            cantidad,
            peso,
            tipo
        };
        
        await sendMessageToQueue('salesQueue', JSON.stringify(message));

        res.status(201).json({
            message: 'Venta registrada exitosamente',
            data: newSales
        });
    } catch (error) {
        res.status(500).json({ error: 'Error registrando la venta', details: error });
    }
};

export const updateSales = async (req: Request, res: Response):Promise<any> => {
    const { id } = req.params;
    const { id_Usuario, fecha_Venta, cantidad, peso, tipo } = req.body;
    
    try {
        const [affectedRows] = await Venta.update(
            { id_Usuario, fecha_Venta, cantidad, peso, tipo },
            { where: { id_venta: id } }
        );

        if (affectedRows === 0) {
            res.json({ message: 'Datos actualizados correctamente' });
        } else {
            res.status(404).json({ error: 'No se encontró la venta' });
        }

        const message = {
            action: 'update',
            id,
            id_Usuario,
            fecha_Venta,
            cantidad,
            peso,
            tipo
        };

        await sendMessageToQueue('salesQueue', JSON.stringify(message));
    } catch (error) {
        res.status(500).json({ error: 'Error actualizando la venta', details: error });
    }
};

export const deleteSales = async (req: Request, res: Response):Promise<any> => {
    const { id } = req.params;

    try{
        const deletedRows = await Venta.destroy({ where: { id_venta: id } });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        const message = {
            action: 'delete',
            id
        };

        await sendMessageToQueue('salesQueue', JSON.stringify(message));

        res.json({
            message: 'Venta eliminada exitosamente',
            data: { id }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando la venta', details: error });
    }
};