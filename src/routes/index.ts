// src/routes/index.ts
import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { ProjectRoutes } from '../modules/project/project.route';
import { HardwareRoutes } from '../modules/hardware/hardware.route';

const router = Router();

const moduleRoutes = [
    {
        path: '/users',
        route: UserRoutes
    },
    {
        path: '/projects',
        route: ProjectRoutes,
    },
    {
        path: '/hardware',
        route: HardwareRoutes
    }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

// A simple health check route for Postman
// http://localhost:5000/api/v1/health
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'fundingPanda API is running smoothly!',
    });
});

export default router;