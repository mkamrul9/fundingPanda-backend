import { Router } from 'express';
import { CategoryController } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';
import checkAuth from '../../middlewares/checkAuth';

const router = Router();

router.post('/', checkAuth('ADMIN'), validateRequest(CategoryValidation.createCategoryZodSchema), CategoryController.createCategory);
router.get('/', CategoryController.getAllCategories); // Public
router.patch('/:id', checkAuth('ADMIN'), validateRequest(CategoryValidation.updateCategoryZodSchema), CategoryController.updateCategory);
router.delete('/:id', checkAuth('ADMIN'), CategoryController.deleteCategory);

export const CategoryRoutes = router;