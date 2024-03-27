import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { logger } from './logger';

const start = async () => {
    if(!process.env.JWT_KEY) throw new Error('JWT_KEY not defined.');
    if(!process.env.TICKETS_MONGO_URI) throw new Error('TICKETS_MONGO_URI not defined.')
    if(!process.env.NATS_CLIENT_ID) throw new Error('NATS_CLIENT_ID not defined.');
    if(!process.env.NATS_CLUSTER_ID) throw new Error('NATS_CLUSTER_ID not defined.');
    if(!process.env.NATS_URL) throw new Error('NATS_URL not defined.');

    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID, 
            process.env.NATS_CLIENT_ID, 
            process.env.NATS_URL
        );
        
        natsWrapper.client.on('close', () => {
            logger.info('NATS connection closed!');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

        await mongoose.connect(process.env.TICKETS_MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        logger.info('Connected to MongoDB');

    } catch(err) {
        logger.error('Error during startup', { error: err });
    }

    app.listen(3000, () => {
        logger.info('Listening on port 3000!');
    });
}

start();