// src/routes/index.ts
import { Router } from 'express';
// import { UserRoutes } from '../modules/user/user.route'; 

const router = Router();

const moduleRoutes = [
    // { path: '/users', route: UserRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

// A simple health check route for Postman
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'fundingPanda API is running smoothly!',
    });
});

export default router;