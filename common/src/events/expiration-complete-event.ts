import { Subject } from './subject';
import { Event } from './base-event';
import { OrderStatus } from './types/order-status';

export interface ExpirationCompleteEvent extends Event {
    subject: Subject.ExpirationComplete;
    data: {
        orderId: string;
    };
}