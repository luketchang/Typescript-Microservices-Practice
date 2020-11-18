import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@lt-ticketing/common';

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

    }
);

export { router as newOrderRouter };