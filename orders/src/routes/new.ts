import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@lt-ticketing/common';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { logger } from '../logger';

const EXP_TIME_SEC = 1 * 30;
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
        logger.info('Received order creation request', { ticketId, userId: req.currentUser!.id });

        const ticket = await Ticket.findById(ticketId);
        if(!ticket) {
            logger.warn('Ticket not found', { ticketId });
            throw new NotFoundError();
        }

        const isReserved = await ticket.isReserved();
        if(isReserved) {
            logger.warn('Ticket already reserved', { ticketId });
            throw new BadRequestError("Ticket already reserved.");
        }

        const expirationTime = new Date();
        expirationTime.setSeconds(expirationTime.getSeconds() + EXP_TIME_SEC);

        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expirationTime,
            ticket
        });
        await order.save();

        logger.info('Order created', { order });

        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            version: order.version,
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        });

        logger.info('Order creation published', { order });

        res.status(201).send(order);
    }
);

export { router as newOrderRouter };