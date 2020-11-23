import { Subject } from './subject';
import { Event } from './base-event';
import { OrderStatus } from './types/order-status';

export interface OrderCreatedEvent extends Event {
    subject: Subject.OrderCreated;
    data: {
        id: string;
        status: OrderStatus;
        userId: string;
        expiresAt: string;
        version: number;
        ticket: {
            id: string;
            price: number;
        };
    };
}