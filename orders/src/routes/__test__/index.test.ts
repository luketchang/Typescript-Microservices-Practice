import request from 'supertest';

import { app } from '../../app';
import { Ticket, TicketDoc } from '../../models/ticket';
import { Order } from '../../models/order';
import { getAuthCookie } from '../../test/getAuthCookie';

const createTicket = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20
    });
    await ticket.save();
    return ticket;
}

const createOrder = async (ticket: TicketDoc, cookie: string[]) => {
    const res = await request(app)
        .post('/api/orders')
        .set('Cookie', cookie)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    return res;
}

it('fetches an order for a particular user', async () => {
    const userOneCookie = getAuthCookie();
    const userTwoCookie = getAuthCookie();

    const ticketOne = await createTicket();
    const ticketTwo = await createTicket();
    const ticketThree = await createTicket();

    const { body: orderOne } = await createOrder(ticketOne, userOneCookie);
    const { body: orderTwo } = await createOrder(ticketTwo, userTwoCookie);
    const { body: orderThree } = await createOrder(ticketThree, userTwoCookie);

    const res = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwoCookie)
        .expect(200);

    expect(res.body.length).toEqual(2);
    expect(res.body[0].id).toEqual(orderTwo.id);
    expect(res.body[1].id).toEqual(orderThree.id);
    expect(res.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(res.body[1].ticket.id).toEqual(ticketThree.id);
});