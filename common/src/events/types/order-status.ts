export enum OrderStatus {
    Created = 'created',
    Cancelled = 'cancelled', //catch all
    AwaitingPayment = 'awaiting:payment',
    Complete = 'complete'
}