import { Subject } from './subject';
import { Event } from './base-event';
import { OrderStatus } from './types/order-status';

export interface OrderCancelledEvent extends Event {
    subject: Subject;
    data: {
        id: string;
        version: number;
        ticket: {
            id: string;
        };
    };
}