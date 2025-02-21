import { Message } from "node-nats-streaming";
import {
  Listener,
  OrderCreatedEvent,
  QueueGroupName,
  Subject,
} from "@lt-ticketing/common";
import { Order } from "../../models/order";
import { logger } from "@lt-ticketing/common";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subject.OrderCreated = Subject.OrderCreated;
  queueGroupName = QueueGroupName.PaymentsService;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    logger.info("Order created event received", { orderId: data.id });

    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      userId: data.userId,
      status: data.status,
      version: data.version,
    });
    await order.save();

    logger.info("Order created", {
      orderId: order.id,
      userId: order.userId,
      price: order.price,
      status: order.status,
      version: order.version,
    });

    msg.ack();

    logger.info("Order created event acknowledged", { orderId: order.id });
  }
}
