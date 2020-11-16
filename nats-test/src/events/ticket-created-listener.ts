import { Listener } from './base-listener';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subject } from './subject';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject: Subject.TicketCreated = Subject.TicketCreated;
    queueGroupName = 'payments-service';
    
    onMessage(data: any, msg: Message) {
      console.log('Event data!', data);
      msg.ack();
    }
  }