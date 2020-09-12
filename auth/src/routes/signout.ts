import express from 'express';

const router = express.Router();

router.post('/api/users/sign-out', (req, res) => {
    req.session = null;
    res.send('Signed out.');
});

export { router as signoutRouter };