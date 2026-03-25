// src/routes/index.ts
import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { ProjectRoutes } from '../modules/project/project.route';
import { ResourceRoutes } from '../modules/resource/resource.route';
import { DonationRoutes } from '../modules/donation/donation.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { TimelineRoutes } from '../modules/timeline/timeline.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { MessageRoutes } from '../modules/message/message.route';
import { NotificationRoutes } from '../modules/notification/notification.route';
import { EngagementRoutes } from '../modules/engagement/engagement.route';

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
        path: '/resources',
        route: ResourceRoutes
    },
    {
        path: '/donations',
        route: DonationRoutes
    },
    {
        path: '/admin',
        route: AdminRoutes
    },
    {
        path: '/categories',
        route: CategoryRoutes
    },
    {
        path: '/timeline',
        route: TimelineRoutes
    },
    {
        path: '/reviews',
        route: ReviewRoutes
    },
    {
        path: '/messages',
        route: MessageRoutes
    },
    {
        path: '/notifications',
        route: NotificationRoutes,
    },
    {
        path: '/',
        route: EngagementRoutes,
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