/**
 * 动作库控制器
 * 处理所有与健身动作相关的HTTP请求
 * @module controllers/exerciseController
 */

const exerciseService = require('../services/exerciseService');
const logger = require('../utils/logger');

/**
 * 动作库控制器类
 */
class ExerciseController {
  /**
   * 创建新动作
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async createExercise(req, res) {
    try {
      logger.info('创建新动作', { body: req.body });
      
      const exercise = await exerciseService.createExercise(req.body);
      
      res.status(201).json({
        success: true,
        message: '动作创建成功',
        data: exercise
      });
    } catch (error) {
      logger.error('创建动作失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取所有动作
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getAllExercises(req, res) {
    try {
      const { bodyPart, difficulty, limit } = req.query;
      
      const exercises = await exerciseService.getAllExercises({
        bodyPart,
        difficulty,
        limit: limit ? parseInt(limit) : undefined
      });
      
      res.status(200).json({
        success: true,
        count: exercises.length,
        data: exercises
      });
    } catch (error) {
      logger.error('获取动作列表失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取单个动作
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getExerciseById(req, res) {
    try {
      const { id } = req.params;
      
      const exercise = await exerciseService.getExerciseById(id);
      
      res.status(200).json({
        success: true,
        data: exercise
      });
    } catch (error) {
      logger.error('获取动作失败', { id: req.params.id, error: error.message });
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 更新动作
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async updateExercise(req, res) {
    try {
      const { id } = req.params;
      
      const exercise = await exerciseService.updateExercise(id, req.body);
      
      res.status(200).json({
        success: true,
        message: '动作更新成功',
        data: exercise
      });
    } catch (error) {
      logger.error('更新动作失败', { id: req.params.id, error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 删除动作
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async deleteExercise(req, res) {
    try {
      const { id } = req.params;
      
      await exerciseService.deleteExercise(id);
      
      res.status(200).json({
        success: true,
        message: '动作删除成功'
      });
    } catch (error) {
      logger.error('删除动作失败', { id: req.params.id, error: error.message });
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 按部位获取动作
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getExercisesByBodyPart(req, res) {
    try {
      const { bodyPart } = req.params;
      
      const exercises = await exerciseService.getExercisesByBodyPart(bodyPart);
      
      res.status(200).json({
        success: true,
        count: exercises.length,
        data: exercises
      });
    } catch (error) {
      logger.error('获取部位动作失败', { bodyPart: req.params.bodyPart, error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 按难度获取动作
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getExercisesByDifficulty(req, res) {
    try {
      const { difficulty } = req.params;
      
      const exercises = await exerciseService.getExercisesByDifficulty(difficulty);
      
      res.status(200).json({
        success: true,
        count: exercises.length,
        data: exercises
      });
    } catch (error) {
      logger.error('获取难度动作失败', { difficulty: req.params.difficulty, error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 搜索动作
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async searchExercises(req, res) {
    try {
      const { keyword } = req.query;
      
      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: '搜索关键词不能为空'
        });
      }
      
      const exercises = await exerciseService.searchExercises(keyword);
      
      res.status(200).json({
        success: true,
        count: exercises.length,
        data: exercises
      });
    } catch (error) {
      logger.error('搜索动作失败', { keyword: req.query.keyword, error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取动作统计信息
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getExerciseStats(req, res) {
    try {
      const stats = await exerciseService.getExerciseStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('获取动作统计失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 创建默认动作（初始化使用）
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async createDefaultExercises(req, res) {
    try {
      const exercises = await exerciseService.createDefaultExercises();
      
      res.status(201).json({
        success: true,
        message: '默认动作创建成功',
        count: exercises.length,
        data: exercises
      });
    } catch (error) {
      logger.error('创建默认动作失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ExerciseController();
