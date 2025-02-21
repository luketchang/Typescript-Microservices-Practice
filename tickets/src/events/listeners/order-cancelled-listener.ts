import { Message } from "node-nats-streaming";
import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  QueueGroupName,
  Subject,
} from "@lt-ticketing/common";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { logger } from "@lt-ticketing/common";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subject.OrderCancelled = Subject.OrderCancelled;
  queueGroupName = QueueGroupName.TicketsService;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    logger.info("Order cancelled event received", { orderId: data.id });

    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      logger.warn("Ticket does not exist", { ticketId: data.ticket.id });
      throw new Error("Ticket does not exist.");
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    logger.info("Ticket updated", {
      ticketId: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    logger.info("Ticket updated event published", { ticketId: ticket.id });

    msg.ack();

    logger.info("Order cancelled event acknowledged", { orderId: data.id });
  }
}
