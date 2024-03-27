import express, { Request, Response } from 'express';
import { NotFoundError } from '@lt-ticketing/common';
import { Ticket } from '../models/ticket';
import { logger } from '../logger';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    logger.info('Received ticket retrieval request', { ticketId: req.params.id });
    const ticket = await Ticket.findById(req.params.id);
    if(!ticket) {
        logger.warn('Ticket not found', { ticketId: req.params.id });
        throw new NotFoundError();
    }

    logger.info('Ticket retrieved', { ticketId: ticket.id, title: ticket.title, price: ticket.price, userId: ticket.userId, version: ticket.version });

    res.status(200).send(ticket);
});

export { router as showTicketRouter };