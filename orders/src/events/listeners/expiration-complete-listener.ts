import { Message } from 'node-nats-streaming';
import { Subject, QueueGroupName, ExpirationCompleteEvent, Listener, OrderStatus } from '@lt-ticketing/common';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { Order } from '../../models/order';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subject.ExpirationComplete = Subject.ExpirationComplete;
    queueGroupName = QueueGroupName.OrdersService;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order  = await Order.findById(data.orderId);

        if(!order) {
            throw new Error('Order not found.');
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        msg.ack();
    }
}