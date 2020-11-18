import { Ticket } from '../models/ticket';

export const createTicket = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });
    await ticket.save();
    return ticket;
}