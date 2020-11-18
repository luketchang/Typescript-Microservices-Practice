import { Subject } from './subject';
import { Event } from './base-event';
import { OrderStatus } from './types/order-status';

export interface OrderCreatedEvent extends Event {
    subject: Subject.OrderCreated;
    data: {
        id: string,
        status: OrderStatus.Created,
        userId: string,
        expiresAt: string,
        ticket: {
            id: string,
            price: number
        }
    }
}