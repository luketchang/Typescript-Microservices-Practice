import { Subject, Listener, TicketCreatedEvent } from '@lt-ticketing/common';
import { Message } from 'node-nats-streaming';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject: Subject.TicketCreated = Subject.TicketCreated;
    queueGroupName = 'payments-service';
    
    onMessage(data: TicketCreatedEvent['data'], msg: Message) {
      console.log('Event data:', data);
      msg.ack();
    }
  }