/**
 * 训练记录业务逻辑层
 * 处理所有与训练记录相关的业务逻辑，与数据库操作解耦
 * @module services/workoutService
 */

const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');

/**
 * 训练记录服务类
 * 封装所有训练记录的业务逻辑，提供统一的接口供控制器调用
 */
class WorkoutService {
  /**
   * 创建新的训练记录
   * @async
   * @param {Object} workoutData - 训练数据
   * @returns {Promise<Object>} 返回创建的训练记录
   */
  async createWorkout(workoutData = {}) {
    try {
      console.log('[DEBUG] WorkoutService.createWorkout 接收数据:', workoutData);
      
      const workoutDataWithDefaults = {
        ...workoutData,
        date: workoutData.date || new Date(),
        startTime: workoutData.startTime || new Date(),
        exercises: workoutData.exercises || []
      };
      
      console.log('[DEBUG] 准备创建Workout实例:', workoutDataWithDefaults);
      
      const workout = new Workout(workoutDataWithDefaults);

      const savedWorkout = await workout.save();
      console.log('[DEBUG] Workout保存成功:', savedWorkout._id);
      
      return await this.populateWorkoutExercises(savedWorkout);
    } catch (error) {
      console.error('[ERROR] WorkoutService.createWorkout 失败:', error);
      throw new Error(`创建训练记录失败: ${error.message}`);
    }
  }

  /**
   * 获取所有训练记录
   * @async
   * @param {string} username - 用户名
   * @param {Object} options - 查询选项
   * @param {Number} options.limit - 返回记录数量限制
   * @param {Number} options.offset - 偏移量（用于分页）
   * @returns {Promise<Array>} 返回训练记录列表
   */
  async getAllWorkouts(username, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;
      
      const workouts = await Workout.find({ username })
        .populate('exercises.exercise', 'name bodyPart difficulty')
        .sort({ date: -1 })
        .limit(limit)
        .skip(offset);

      return workouts;
    } catch (error) {
      throw new Error(`获取训练记录失败: ${error.message}`);
    }
  }

  /**
   * 获取单个训练记录
   * @async
   * @param {string} workoutId - 训练记录ID
   * @returns {Promise<Object>} 返回训练记录
   */
  async getWorkoutById(workoutId) {
    try {
      const workout = await Workout.findById(workoutId)
        .populate('exercises.exercise', 'name bodyPart difficulty');

      if (!workout) {
        throw new Error('训练记录不存在');
      }

      return workout;
    } catch (error) {
      throw new Error(`获取训练记录失败: ${error.message}`);
    }
  }

  /**
   * 获取最近N天的训练记录
   * @async
   * @param {string} username - 用户名
   * @param {Number} days - 天数，默认30天
   * @returns {Promise<Array>} 返回训练记录列表
   */
  async getRecentWorkouts(username, days = 30) {
    try {
      const workouts = await Workout.getRecentWorkouts(username, days);
      return workouts;
    } catch (error) {
      throw new Error(`获取最近训练记录失败: ${error.message}`);
    }
  }

  /**
   * 获取最近7天的训练简要信息（用于首页日历）
   * @async
   * @param {string} username - 用户名
   * @returns {Promise<Array>} 返回包含日期、训练部位和强度的简要信息
   */
  async getRecent7DaysWorkoutBrief(username) {
    try {
      const workouts = await Workout.getRecentWorkouts(username, 7);
      
      // 提取简要信息
      return workouts.map(workout => {
        // 获取训练部位（去重）
        const bodyParts = new Set();
        workout.exercises.forEach(exerciseLog => {
          if (exerciseLog.exercise && exerciseLog.exercise.bodyPart) {
            bodyParts.add(exerciseLog.exercise.bodyPart);
          }
        });

        return {
          date: workout.date,
          bodyParts: Array.from(bodyParts),
          intensity: workout.intensity,
          status: workout.status
        };
      });
    } catch (error) {
      throw new Error(`获取训练简要信息失败: ${error.message}`);
    }
  }

  /**
   * 获取某一天的训练记录
   * @async
   * @param {string} username - 用户名
   * @param {Date} date - 日期
   * @returns {Promise<Object|null>} 返回训练记录或null
   */
  async getWorkoutByDate(username, date) {
    try {
      return await Workout.getWorkoutByDate(username, date);
    } catch (error) {
      throw new Error(`获取指定日期训练记录失败: ${error.message}`);
    }
  }

  /**
   * 更新训练记录
   * @async
   * @param {string} workoutId - 训练记录ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 返回更新后的训练记录
   */
  async updateWorkout(workoutId, updateData) {
    try {
      const workout = await Workout.findByIdAndUpdate(
        workoutId,
        updateData,
        { new: true, runValidators: true }
      ).populate('exercises.exercise', 'name bodyPart difficulty');

      if (!workout) {
        throw new Error('训练记录不存在');
      }

      return workout;
    } catch (error) {
      throw new Error(`更新训练记录失败: ${error.message}`);
    }
  }

  /**
   * 删除训练记录
   * @async
   * @param {string} workoutId - 训练记录ID
   * @returns {Promise<Object>} 返回删除的训练记录
   */
  async deleteWorkout(workoutId) {
    try {
      const workout = await Workout.findByIdAndDelete(workoutId);
      
      if (!workout) {
        throw new Error('训练记录不存在');
      }

      return workout;
    } catch (error) {
      throw new Error(`删除训练记录失败: ${error.message}`);
    }
  }

  /**
   * 向训练记录中添加动作
   * @async
   * @param {string} workoutId - 训练记录ID
   * @param {string} exerciseId - 动作ID
   * @returns {Promise<Object>} 返回更新后的训练记录
   */
  async addExerciseToWorkout(workoutId, exerciseId) {
    try {
      const workout = await this.getWorkoutById(workoutId);
      await workout.addExercise(exerciseId);
      return await this.getWorkoutById(workoutId);
    } catch (error) {
      throw new Error(`添加动作失败: ${error.message}`);
    }
  }

  /**
   * 向训练记录中的某个动作添加组数
   * @async
   * @param {string} workoutId - 训练记录ID
   * @param {Number} exerciseIndex - 动作索引
   * @param {Number} weight - 重量（kg）
   * @param {Number} reps - 次数
   * @returns {Promise<Object>} 返回更新后的训练记录
   */
  async addSetToWorkout(workoutId, exerciseIndex, weight, reps) {
    try {
      const workout = await this.getWorkoutById(workoutId);
      await workout.addSet(exerciseIndex, weight, reps);
      return await this.getWorkoutById(workoutId);
    } catch (error) {
      throw new Error(`添加组数失败: ${error.message}`);
    }
  }

  /**
   * 完成训练记录中的某组
   * @async
   * @param {string} workoutId - 训练记录ID
   * @param {Number} exerciseIndex - 动作索引
   * @param {Number} setIndex - 组数索引
   * @returns {Promise<Object>} 返回更新后的训练记录
   */
  async completeSetInWorkout(workoutId, exerciseIndex, setIndex) {
    try {
      const workout = await this.getWorkoutById(workoutId);
      await workout.completeSet(exerciseIndex, setIndex);
      return await this.getWorkoutById(workoutId);
    } catch (error) {
      throw new Error(`完成组数失败: ${error.message}`);
    }
  }

  /**
   * 完成训练
   * @async
   * @param {string} workoutId - 训练记录ID
   * @returns {Promise<Object>} 返回完成后的训练记录
   */
  async completeWorkout(workoutId) {
    try {
      const workout = await this.getWorkoutById(workoutId);
      await workout.completeWorkout();
      return await this.getWorkoutById(workoutId);
    } catch (error) {
      throw new Error(`完成训练失败: ${error.message}`);
    }
  }

  /**
   * 获取训练统计数据
   * @async
   * @param {string} username - 用户名
   * @param {Number} days - 统计天数，默认30天
   * @returns {Promise<Object>} 返回统计数据对象
   */
  async getWorkoutStats(username, days = 30) {
    try {
      const workouts = await this.getRecentWorkouts(username, days);
      
      const stats = {
        totalWorkouts: workouts.length,
        totalSets: 0,
        totalExercises: 0,
        averageIntensity: 0,
        bodyParts: {},
        byDate: {}
      };

      workouts.forEach(workout => {
        // 统计总组数
        workout.exercises.forEach(exerciseLog => {
          stats.totalSets += exerciseLog.sets.length;
          stats.totalExercises++;

          // 统计训练部位
          if (exerciseLog.exercise && exerciseLog.exercise.bodyPart) {
            const bodyPart = exerciseLog.exercise.bodyPart;
            stats.bodyParts[bodyPart] = (stats.bodyParts[bodyPart] || 0) + exerciseLog.sets.length;
          }
        });

        // 按日期统计
        const dateKey = workout.date.toISOString().split('T')[0];
        stats.byDate[dateKey] = {
          intensity: workout.intensity,
          exercises: workout.exercises.length
        };

        // 累计强度
        if (workout.intensity) {
          stats.averageIntensity += workout.intensity;
        }
      });

      // 计算平均强度
      if (stats.totalWorkouts > 0) {
        stats.averageIntensity = Math.round((stats.averageIntensity / stats.totalWorkouts) * 10) / 10;
      }

      return stats;
    } catch (error) {
      throw new Error(`获取统计数据失败: ${error.message}`);
    }
  }

  /**
   * 填充训练记录中的动作信息
   * @private
   * @param {Object} workout - 训练记录对象
   * @returns {Promise<Object>} 返回填充后的训练记录
   */
  async populateWorkoutExercises(workout) {
    return await workout.populate('exercises.exercise', 'name bodyPart difficulty');
  }
}

module.exports = new WorkoutService();
