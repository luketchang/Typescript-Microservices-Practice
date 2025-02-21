import { Message } from "node-nats-streaming";
import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  QueueGroupName,
  Subject,
} from "@lt-ticketing/common";
import { Order } from "../../models/order";
import { logger } from "@lt-ticketing/common";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subject.OrderCancelled = Subject.OrderCancelled;
  queueGroupName = QueueGroupName.PaymentsService;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    logger.info("Order cancelled event received", { data });

    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      logger.warn("Order not found", { data });
      throw new Error("Order not found.");
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    logger.info("Order cancelled", { data });

    msg.ack();

    logger.info("Order cancelled event acknowledged", { data });
  }
}
