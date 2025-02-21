import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { natsWrapper } from "./nats-wrapper";
import { logger } from "@lt-ticketing/common";

const start = async () => {
  if (!process.env.NATS_CLIENT_ID)
    throw new Error("NATS_CLIENT_ID not defined.");
  if (!process.env.NATS_CLUSTER_ID)
    throw new Error("NATS_CLUSTER_ID not defined.");
  if (!process.env.NATS_URL) throw new Error("NATS_URL not defined.");

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    logger.info("Connected to NATS", {
      clientId: process.env.NATS_CLIENT_ID,
      clusterId: process.env.NATS_CLUSTER_ID,
      url: process.env.NATS_URL,
    });

    natsWrapper.client.on("close", () => {
      logger.warn("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    logger.error("Error starting the application", { error: err });
  }
};

start();
