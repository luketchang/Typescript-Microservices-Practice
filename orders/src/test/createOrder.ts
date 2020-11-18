import request from 'supertest';
import { app } from '../app';
import { TicketDoc } from '../models/ticket'

export const createOrder = async (ticket: TicketDoc, cookie: string[]) => {
    const res = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    return res;
}