/**
 * 训练记录控制器
 * 处理所有与训练记录相关的HTTP请求，调用服务层执行业务逻辑
 * @module controllers/workoutController
 */

const workoutService = require('../services/workoutService');
const logger = require('../utils/logger');

/**
 * 训练记录控制器类
 * 处理训练记录的CRUD操作和其他相关请求
 */
class WorkoutController {
  /**
   * 创建新的训练记录
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async createWorkout(req, res) {
    try {
      const { username } = req.body;
      console.log('[DEBUG] 创建训练请求体:', req.body);
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      logger.info('创建新的训练记录', { username });
      
      const workout = await workoutService.createWorkout(req.body);
      
      res.status(201).json({
        success: true,
        message: '训练记录创建成功',
        data: workout
      });
    } catch (error) {
      console.error('[ERROR] 创建训练记录失败:', error);
      logger.error('创建训练记录失败', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: '服务器内部错误: ' + error.message
      });
    }
  }

  /**
   * 获取所有训练记录
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getAllWorkouts(req, res) {
    try {
      const { limit, offset, username } = req.query;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      const workouts = await workoutService.getAllWorkouts(username, {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      });
      
      res.status(200).json({
        success: true,
        count: workouts.length,
        data: workouts
      });
    } catch (error) {
      logger.error('获取训练记录列表失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取单个训练记录
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getWorkoutById(req, res) {
    try {
      const { id } = req.params;
      const { username } = req.query;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      const workout = await workoutService.getWorkoutById(id);
      
      // 验证用户只能访问自己的训练记录
      if (workout.username !== username) {
        return res.status(403).json({
          success: false,
          message: '无权访问该训练记录'
        });
      }
      
      res.status(200).json({
        success: true,
        data: workout
      });
    } catch (error) {
      logger.error('获取训练记录失败', { id: req.params.id, error: error.message });
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取最近30天的训练记录
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getRecentWorkouts(req, res) {
    try {
      const { days = 30, username } = req.query;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      const workouts = await workoutService.getRecentWorkouts(username, parseInt(days));
      
      res.status(200).json({
        success: true,
        count: workouts.length,
        data: workouts
      });
    } catch (error) {
      logger.error('获取最近训练记录失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取最近7天的训练简要信息（用于首页日历）
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getRecent7DaysBrief(req, res) {
    try {
      const { username } = req.query;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      const briefs = await workoutService.getRecent7DaysWorkoutBrief(username);
      
      res.status(200).json({
        success: true,
        count: briefs.length,
        data: briefs
      });
    } catch (error) {
      logger.error('获取训练简要信息失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取某一天的训练记录
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getWorkoutByDate(req, res) {
    try {
      const { date } = req.params;
      const { username } = req.query;
      const workoutDate = new Date(date);
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      const workout = await workoutService.getWorkoutByDate(username, workoutDate);
      
      res.status(200).json({
        success: true,
        data: workout
      });
    } catch (error) {
      logger.error('获取指定日期训练记录失败', { date: req.params.date, error: error.message });
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 更新训练记录
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async updateWorkout(req, res) {
    try {
      const { id } = req.params;
      
      const workout = await workoutService.updateWorkout(id, req.body);
      
      res.status(200).json({
        success: true,
        message: '训练记录更新成功',
        data: workout
      });
    } catch (error) {
      logger.error('更新训练记录失败', { id: req.params.id, error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 删除训练记录
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async deleteWorkout(req, res) {
    try {
      const { id } = req.params;
      
      await workoutService.deleteWorkout(id);
      
      res.status(200).json({
        success: true,
        message: '训练记录删除成功'
      });
    } catch (error) {
      logger.error('删除训练记录失败', { id: req.params.id, error: error.message });
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 向训练记录中添加动作
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async addExerciseToWorkout(req, res) {
    try {
      const { id } = req.params;
      const { exerciseId, username } = req.body;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      if (!exerciseId) {
        return res.status(400).json({
          success: false,
          message: '动作ID不能为空'
        });
      }
      
      // 验证用户只能修改自己的训练记录
      const workout = await workoutService.getWorkoutById(id);
      if (workout.username !== username) {
        return res.status(403).json({
          success: false,
          message: '无权修改该训练记录'
        });
      }
      
      const updatedWorkout = await workoutService.addExerciseToWorkout(id, exerciseId);
      
      res.status(200).json({
        success: true,
        message: '动作添加成功',
        data: updatedWorkout
      });
    } catch (error) {
      logger.error('添加动作失败', { id: req.params.id, error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 向训练记录中的动作添加组数
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async addSetToWorkout(req, res) {
    try {
      const { id } = req.params;
      const { exerciseIndex, weight, reps, username } = req.body;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      if (exerciseIndex === undefined || weight === undefined || reps === undefined) {
        return res.status(400).json({
          success: false,
          message: '参数不完整：需要exerciseIndex、weight和reps'
        });
      }
      
      // 验证用户只能修改自己的训练记录
      const workout = await workoutService.getWorkoutById(id);
      if (workout.username !== username) {
        return res.status(403).json({
          success: false,
          message: '无权修改该训练记录'
        });
      }
      
      const updatedWorkout = await workoutService.addSetToWorkout(
        id,
        parseInt(exerciseIndex),
        parseFloat(weight),
        parseInt(reps)
      );
      
      res.status(200).json({
        success: true,
        message: '组数添加成功',
        data: updatedWorkout
      });
    } catch (error) {
      logger.error('添加组数失败', { id: req.params.id, error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 完成训练记录中的某组
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async completeSetInWorkout(req, res) {
    try {
      const { id } = req.params;
      const { exerciseIndex, setIndex, username } = req.body;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      if (exerciseIndex === undefined || setIndex === undefined) {
        return res.status(400).json({
          success: false,
          message: '参数不完整：需要exerciseIndex和setIndex'
        });
      }
      
      // 验证用户只能修改自己的训练记录
      const workout = await workoutService.getWorkoutById(id);
      if (workout.username !== username) {
        return res.status(403).json({
          success: false,
          message: '无权修改该训练记录'
        });
      }
      
      const updatedWorkout = await workoutService.completeSetInWorkout(
        id,
        parseInt(exerciseIndex),
        parseInt(setIndex)
      );
      
      res.status(200).json({
        success: true,
        message: '组数完成',
        data: updatedWorkout
      });
    } catch (error) {
      logger.error('完成组数失败', { id: req.params.id, error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 删除训练记录中的某组
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async deleteSetFromWorkout(req, res) {
    try {
      const { id } = req.params;
      const exerciseIndex = req.query.exerciseIndex ?? req.body.exerciseIndex;
      const setIndex = req.query.setIndex ?? req.body.setIndex;
      const username = req.query.username ?? req.body.username;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }

      if (exerciseIndex === undefined || setIndex === undefined) {
        return res.status(400).json({
          success: false,
          message: '参数不完整：需要exerciseIndex和setIndex'
        });
      }

      // 验证用户只能修改自己的训练记录
      const workout = await workoutService.getWorkoutById(id);
      if (workout.username !== username) {
        return res.status(403).json({
          success: false,
          message: '无权修改该训练记录'
        });
      }

      const updatedWorkout = await workoutService.removeSetFromWorkout(
        id,
        parseInt(exerciseIndex),
        parseInt(setIndex)
      );

      res.status(200).json({
        success: true,
        message: '组数删除成功',
        data: updatedWorkout
      });
    } catch (error) {
      logger.error('删除组数失败', { id: req.params.id, error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 完成训练
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async completeWorkout(req, res) {
    try {
      const { id } = req.params;
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      // 验证用户只能修改自己的训练记录
      const workout = await workoutService.getWorkoutById(id);
      if (workout.username !== username) {
        return res.status(403).json({
          success: false,
          message: '无权修改该训练记录'
        });
      }
      
      const updatedWorkout = await workoutService.completeWorkout(id);
      
      res.status(200).json({
        success: true,
        message: '训练已完成',
        data: updatedWorkout
      });
    } catch (error) {
      logger.error('完成训练失败', { id: req.params.id, error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取训练统计数据
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getWorkoutStats(req, res) {
    try {
      const { days = 30, username } = req.query;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }
      
      const stats = await workoutService.getWorkoutStats(username, parseInt(days));
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('获取统计数据失败', { error: error.message });
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 获取动作历史详情与数据分析
   * @async
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @returns {Promise<void>}
   */
  async getExerciseHistory(req, res) {
    try {
      const { exerciseId } = req.params;
      const { days = 180, username } = req.query;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: '用户名不能为空'
        });
      }

      if (!exerciseId) {
        return res.status(400).json({
          success: false,
          message: '动作ID不能为空'
        });
      }

      const data = await workoutService.getExerciseHistory(username, exerciseId, parseInt(days));

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('获取动作历史失败', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new WorkoutController();
