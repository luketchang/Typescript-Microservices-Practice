import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, OrderStatus, QueueGroupName, Subject } from '@lt-ticketing/common';
import { Order } from '../../models/order';

export class OrderCancelledistener extends Listener<OrderCancelledEvent> {
    subject: Subject.OrderCreated = Subject.OrderCreated;
    queueGroupName = QueueGroupName.PaymentsService;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version
         });

         if(!order) {
             throw new Error('Order not found.')
         }

        order.set({ status: OrderStatus.Cancelled });
        await order.save()

        msg.ack();
    }
}