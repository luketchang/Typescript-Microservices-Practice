import { Ticket } from '../ticket';

it('rejects updates with inconsistent version numbers', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    });
    await ticket.save();

    const ticketInstanceOne = await Ticket.findById(ticket.id);
    const ticketInstanceTwo = await Ticket.findById(ticket.id);

    await ticketInstanceOne!.save();
    try {
        await ticketInstanceTwo!.save();
    } catch(err) {
        return;
    }

    throw new Error('Saving inconsistent ticket version should have thrown.')
});

it('increments the version number when saving/updating same ticket', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});