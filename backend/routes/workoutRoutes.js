/**
 * 训练记录路由配置
 * 定义所有与训练记录相关的API端点
 * @module routes/workoutRoutes
 */

const express = require('express');
const workoutController = require('../controllers/workoutController');

const router = express.Router();

/**
 * @route   POST /api/workouts
 * @desc    创建新的训练记录
 * @access  Public
 */
router.post('/', workoutController.createWorkout);

/**
 * @route   GET /api/workouts
 * @desc    获取所有训练记录
 * @access  Public
 * @query   {Number} limit - 返回记录数量限制
 * @query   {Number} offset - 偏移量（用于分页）
 */
router.get('/', workoutController.getAllWorkouts);

/**
 * @route   GET /api/workouts/recent
 * @desc    获取最近N天的训练记录
 * @access  Public
 * @query   {Number} days - 天数，默认30天
 */
router.get('/recent', workoutController.getRecentWorkouts);

/**
 * @route   GET /api/workouts/recent-7-days-brief
 * @desc    获取最近7天的训练简要信息（用于首页日历）
 * @access  Public
 */
router.get('/recent-7-days-brief', workoutController.getRecent7DaysBrief);

/**
 * @route   GET /api/workouts/stats
 * @desc    获取训练统计数据
 * @access  Public
 * @query   {Number} days - 统计天数，默认30天
 */
router.get('/stats', workoutController.getWorkoutStats);

/**
 * @route   GET /api/workouts/overview
 * @desc    获取综合训练分析数据
 * @access  Public
 * @query   {Number} days - 天数范围
 */
router.get('/overview', workoutController.getWorkoutOverview);

/**
 * @route   GET /api/workouts/exercise-history/:exerciseId
 * @desc    获取动作历史详情与数据分析
 * @access  Public
 * @param   {string} exerciseId - 动作ID
 * @query   {Number} days - 查询天数范围
 */
router.get('/exercise-history/:exerciseId', workoutController.getExerciseHistory);

/**
 * @route   GET /api/workouts/:id
 * @desc    获取单个训练记录
 * @access  Public
 * @param   {string} id - 训练记录ID
 */
router.get('/:id', workoutController.getWorkoutById);

/**
 * @route   GET /api/workouts/date/:date
 * @desc    获取某一天的训练记录
 * @access  Public
 * @param   {string} date - 日期（YYYY-MM-DD格式）
 */
router.get('/date/:date', workoutController.getWorkoutByDate);

/**
 * @route   PUT /api/workouts/:id
 * @desc    更新训练记录
 * @access  Public
 * @param   {string} id - 训练记录ID
 */
router.put('/:id', workoutController.updateWorkout);

/**
 * @route   DELETE /api/workouts/:id
 * @desc    删除训练记录
 * @access  Public
 * @param   {string} id - 训练记录ID
 */
router.delete('/:id', workoutController.deleteWorkout);

/**
 * @route   POST /api/workouts/:id/exercises
 * @desc    向训练记录中添加动作
 * @access  Public
 * @param   {string} id - 训练记录ID
 * @body    {string} exerciseId - 动作ID
 */
router.post('/:id/exercises', workoutController.addExerciseToWorkout);

/**
 * @route   POST /api/workouts/:id/sets
 * @desc    向训练记录中的动作添加组数
 * @access  Public
 * @param   {string} id - 训练记录ID
 * @body    {Number} exerciseIndex - 动作索引
 * @body    {Number} weight - 重量（kg）
 * @body    {Number} reps - 次数
 */
router.post('/:id/sets', workoutController.addSetToWorkout);

/**
 * @route   POST /api/workouts/:id/complete-set
 * @desc    完成训练记录中的某组
 * @access  Public
 * @param   {string} id - 训练记录ID
 * @body    {Number} exerciseIndex - 动作索引
 * @body    {Number} setIndex - 组数索引
 */
router.post('/:id/complete-set', workoutController.completeSetInWorkout);

/**
 * @route   DELETE /api/workouts/:id/sets
 * @desc    删除训练记录中的某组
 * @access  Public
 * @param   {string} id - 训练记录ID
 * @query   {Number} exerciseIndex - 动作索引
 * @query   {Number} setIndex - 组数索引
 */
router.delete('/:id/sets', workoutController.deleteSetFromWorkout);

/**
 * @route   POST /api/workouts/:id/complete
 * @desc    完成训练
 * @access  Public
 * @param   {string} id - 训练记录ID
 */
router.post('/:id/complete', workoutController.completeWorkout);

module.exports = router;
