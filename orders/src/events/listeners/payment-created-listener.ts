import { Subject, Listener, PaymentCreatedEvent, QueueGroupName, OrderStatus } from '@lt-ticketing/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subject.PaymentCreated = Subject.PaymentCreated;
    queueGroupName = QueueGroupName.OrdersService;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if(!order) {
            throw new Error('Order not found.')
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        //TODO: add OrderUpdatedEvent to tell other services to update orders

        msg.ack();
    }
}