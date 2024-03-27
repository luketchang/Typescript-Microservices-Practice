import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, NotAuthorizedError, BadRequestError } from '@lt-ticketing/common';
import { requireAuth, validateRequest } from '@lt-ticketing/common';

import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';
import { Ticket } from '../models/ticket';
import { logger } from '../logger';

const router = express.Router();

router.put(
    '/api/tickets/:id', 
    requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Title required.'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be > 0')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        logger.info('Received ticket update request', { ticketId: req.params.id, userId: req.currentUser!.id });
        const ticket = await Ticket.findById(req.params.id);

        if(!ticket) {
            logger.warn('Ticket not found', { ticketId: req.params.id });
            throw new NotFoundError();
        }
        if(ticket.orderId) {
            logger.warn('Cannot edit a reserved ticket', { ticketId: ticket.id });
            throw new BadRequestError('Cannot edit a reserved ticket.');
        }
        if(ticket.userId !== req.currentUser!.id) {
            logger.warn('Not authorized to update ticket', { ticketId: ticket.id, userId: req.currentUser!.id });
            throw new NotAuthorizedError();
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price
        });
        await ticket.save();

        logger.info('Ticket updated', { ticketId: ticket.id, title: ticket.title, price: ticket.price, userId: ticket.userId, version: ticket.version });

        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version
        });

        logger.info('Ticket updated event published', { ticketId: ticket.id });

        res.send(ticket);
    }
);

export { router as updateTicketRouter };