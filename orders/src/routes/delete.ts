import express, { Request, Response } from "express";
import {
  requireAuth,
  OrderStatus,
  NotFoundError,
  NotAuthorizedError,
} from "@lt-ticketing/common";
import { Order } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";
import { logger } from "@lt-ticketing/common";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    logger.info("Received order deletion request", {
      orderId,
      userId: req.currentUser!.id,
    });

    const order = await Order.findById(orderId).populate("ticket");

    if (!order) {
      logger.warn("Order not found", { orderId });
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      logger.warn("Not authorized to delete order", {
        orderId,
        userId: req.currentUser!.id,
      });
      throw new NotAuthorizedError();
    }

    logger.info("Order cancelled", { orderId });
    order.status = OrderStatus.Cancelled;
    await order.save();

    logger.info("Order cancellation published", { orderId });
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
