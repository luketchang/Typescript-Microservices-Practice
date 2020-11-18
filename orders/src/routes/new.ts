import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@lt-ticketing/common';


const EXP_TIME_SEC = 15 * 60;
const router = express.Router();

router.post(
    '/api/orders', 
    requireAuth,
    [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('Ticket id must be defined.')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;
        const ticket = await Ticket.findById(ticketId);
        if(!ticket) throw new NotFoundError();

        const isReserved = await ticket.isReserved();
        if(isReserved) throw new BadRequestError("Ticket already reserved.");

        const expirationTime = new Date();
        expirationTime.setSeconds(expirationTime.getSeconds() + EXP_TIME_SEC);

        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expirationTime,
            ticket
        });
        await order.save();

        res.status(201).send(order);
    }
);

export { router as newOrderRouter };