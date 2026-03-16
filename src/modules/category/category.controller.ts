import { Request, Response } from 'express';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { CategoryService } from './category.service';

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.createCategoryIntoDB(req.body);
    sendResponse(res, { statusCode: 201, success: true, message: 'Category created', data: result });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.getAllCategoriesFromDB(req.query);
    sendResponse(res, { statusCode: 200, success: true, message: 'Categories retrieved', meta: result.meta, data: result.data });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.updateCategoryInDB(req.params.id as string, req.body);
    sendResponse(res, { statusCode: 200, success: true, message: 'Category updated', data: result });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.deleteCategoryFromDB(req.params.id as string);
    sendResponse(res, { statusCode: 200, success: true, message: 'Category deleted', data: result });
});

export const CategoryController = { createCategory, getAllCategories, updateCategory, deleteCategory };