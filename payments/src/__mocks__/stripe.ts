export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({ id: 'MOCK_ID' })
    }
};