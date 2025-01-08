const express = require("express");
const {createCategoryCtrl,
        fetchAllCategoriesCtrl,
        fetchSingleCategoryCtrl,
    updateCategoryCtrl,
    deleteCategoryCtrl} = require("../../controllers/category/categoryController");
const authMiddleware = require("../../midlleware/auth/authMiddleware");

const categoryRoute = express.Router();

categoryRoute.post('/', authMiddleware, createCategoryCtrl);
categoryRoute.get('/', fetchAllCategoriesCtrl);
categoryRoute.get('/:id', fetchSingleCategoryCtrl);
categoryRoute.put('/:id', authMiddleware, updateCategoryCtrl);
categoryRoute.delete('/:id', authMiddleware, deleteCategoryCtrl);
module.exports = categoryRoute;