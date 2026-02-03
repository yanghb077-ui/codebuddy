/**
 * 动作库路由配置
 * 定义所有与健身动作相关的API端点
 * @module routes/exerciseRoutes
 */

const express = require('express');
const exerciseController = require('../controllers/exerciseController');

const router = express.Router();

/**
 * @route   POST /api/exercises
 * @desc    创建新动作
 * @access  Public
 */
router.post('/', exerciseController.createExercise);

/**
 * @route   GET /api/exercises
 * @desc    获取所有动作
 * @access  Public
 * @query   {String} bodyPart - 按部位筛选
 * @query   {String} difficulty - 按难度筛选
 * @query   {Number} limit - 返回数量限制
 */
router.get('/', exerciseController.getAllExercises);

/**
 * @route   GET /api/exercises/search
 * @desc    搜索动作（按名称）
 * @access  Public
 * @query   {String} keyword - 搜索关键词
 */
router.get('/search', exerciseController.searchExercises);

/**
 * @route   GET /api/exercises/stats
 * @desc    获取动作统计信息
 * @access  Public
 */
router.get('/stats', exerciseController.getExerciseStats);

/**
 * @route   POST /api/exercises/initialize
 * @desc    创建默认动作（初始化使用）
 * @access  Public
 */
router.post('/initialize', exerciseController.createDefaultExercises);

/**
 * @route   GET /api/exercises/bodypart/:bodyPart
 * @desc    按部位获取动作
 * @access  Public
 * @param   {string} bodyPart - 训练部位
 */
router.get('/bodypart/:bodyPart', exerciseController.getExercisesByBodyPart);

/**
 * @route   GET /api/exercises/difficulty/:difficulty
 * @desc    按难度获取动作
 * @access  Public
 * @param   {string} difficulty - 难度等级
 */
router.get('/difficulty/:difficulty', exerciseController.getExercisesByDifficulty);

/**
 * @route   GET /api/exercises/:id
 * @desc    获取单个动作
 * @access  Public
 * @param   {string} id - 动作ID
 */
router.get('/:id', exerciseController.getExerciseById);

/**
 * @route   PUT /api/exercises/:id
 * @desc    更新动作
 * @access  Public
 * @param   {string} id - 动作ID
 */
router.put('/:id', exerciseController.updateExercise);

/**
 * @route   DELETE /api/exercises/:id
 * @desc    删除动作
 * @access  Public
 * @param   {string} id - 动作ID
 */
router.delete('/:id', exerciseController.deleteExercise);

module.exports = router;
