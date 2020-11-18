import { Subject } from './subject';
import { Event } from './base-event';
import { OrderStatus } from './types/order-status';

export interface OrderCancelledEvent extends Event {
    subject: Subject.OrderCancelled;
    data: {
        id: string,
        ticket: {
            id: string
        }
    }
}