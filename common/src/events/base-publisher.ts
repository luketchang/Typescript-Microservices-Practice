import { Stan } from 'node-nats-streaming';
import { Event } from './base-event';
import { logger } from '../logger';

export abstract class Publisher<T extends Event> {
    abstract subject: T['subject'];
    protected client: Stan;

    constructor(client: Stan) {
        this.client = client;
    }

    publish(data: T['data']): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.publish(this.subject, JSON.stringify(data), (err) => {
                if(err) {
                    logger.error('Error publishing event', { subject: this.subject, error: err });
                    return reject(err);
                }

                logger.info('Event published', { subject: this.subject, data });
                resolve();
            });
        });
    }
}