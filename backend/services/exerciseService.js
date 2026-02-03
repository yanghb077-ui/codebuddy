/**
 * 动作库业务逻辑层
 * 处理所有与健身动作相关的业务逻辑
 * @module services/exerciseService
 */

const Exercise = require('../models/Exercise');

/**
 * 动作库服务类
 * 封装所有动作库的业务逻辑
 */
class ExerciseService {
  /**
   * 创建新动作
   * @async
   * @param {Object} exerciseData - 动作数据
   * @returns {Promise<Object>} 返回创建的动作
   */
  async createExercise(exerciseData) {
    try {
      const exercise = new Exercise(exerciseData);
      return await exercise.save();
    } catch (error) {
      throw new Error(`创建动作失败: ${error.message}`);
    }
  }

  /**
   * 获取所有动作
   * @async
   * @param {Object} options - 查询选项
   * @param {String} options.bodyPart - 按部位筛选
   * @param {String} options.difficulty - 按难度筛选
   * @param {Number} options.limit - 返回数量限制
   * @returns {Promise<Array>} 返回动作列表
   */
  async getAllExercises(options = {}) {
    try {
      const { bodyPart, difficulty, limit = 100 } = options;
      
      // 构建查询条件
      const query = {};
      if (bodyPart) query.bodyPart = bodyPart;
      if (difficulty) query.difficulty = difficulty;

      const exercises = await Exercise.find(query)
        .limit(limit)
        .sort({ name: 1 }); // 按名称排序

      return exercises;
    } catch (error) {
      throw new Error(`获取动作列表失败: ${error.message}`);
    }
  }

  /**
   * 获取单个动作
   * @async
   * @param {string} exerciseId - 动作ID
   * @returns {Promise<Object>} 返回动作信息
   */
  async getExerciseById(exerciseId) {
    try {
      const exercise = await Exercise.findById(exerciseId);
      
      if (!exercise) {
        throw new Error('动作不存在');
      }

      return exercise;
    } catch (error) {
      throw new Error(`获取动作失败: ${error.message}`);
    }
  }

  /**
   * 更新动作信息
   * @async
   * @param {string} exerciseId - 动作ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 返回更新后的动作
   */
  async updateExercise(exerciseId, updateData) {
    try {
      const exercise = await Exercise.findByIdAndUpdate(
        exerciseId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!exercise) {
        throw new Error('动作不存在');
      }

      return exercise;
    } catch (error) {
      throw new Error(`更新动作失败: ${error.message}`);
    }
  }

  /**
   * 删除动作
   * @async
   * @param {string} exerciseId - 动作ID
   * @returns {Promise<Object>} 返回删除的动作
   */
  async deleteExercise(exerciseId) {
    try {
      const exercise = await Exercise.findByIdAndDelete(exerciseId);
      
      if (!exercise) {
        throw new Error('动作不存在');
      }

      return exercise;
    } catch (error) {
      throw new Error(`删除动作失败: ${error.message}`);
    }
  }

  /**
   * 按部位获取动作
   * @async
   * @param {string} bodyPart - 训练部位
   * @returns {Promise<Array>} 返回动作列表
   */
  async getExercisesByBodyPart(bodyPart) {
    try {
      return await Exercise.findByBodyPart(bodyPart);
    } catch (error) {
      throw new Error(`获取部位动作失败: ${error.message}`);
    }
  }

  /**
   * 按难度获取动作
   * @async
   * @param {string} difficulty - 难度等级
   * @returns {Promise<Array>} 返回动作列表
   */
  async getExercisesByDifficulty(difficulty) {
    try {
      return await Exercise.findByDifficulty(difficulty);
    } catch (error) {
      throw new Error(`获取难度动作失败: ${error.message}`);
    }
  }

  /**
   * 搜索动作
   * @async
   * @param {string} keyword - 搜索关键词（动作名称）
   * @returns {Promise<Array>} 返回匹配的动作列表
   */
  async searchExercises(keyword) {
    try {
      const regex = new RegExp(keyword, 'i'); // 不区分大小写
      return await Exercise.find({ name: regex }).sort({ name: 1 });
    } catch (error) {
      throw new Error(`搜索动作失败: ${error.message}`);
    }
  }

  /**
   * 获取动作统计信息
   * @async
   * @returns {Promise<Object>} 返回统计数据
   */
  async getExerciseStats() {
    try {
      const stats = await Exercise.aggregate([
        {
          $group: {
            _id: '$bodyPart',
            count: { $sum: 1 },
            difficulties: { $addToSet: '$difficulty' }
          }
        },
        {
          $project: {
            bodyPart: '$_id',
            count: 1,
            difficulties: 1,
            _id: 0
          }
        }
      ]);

      const totalCount = await Exercise.countDocuments();

      return {
        totalCount,
        byBodyPart: stats
      };
    } catch (error) {
      throw new Error(`获取动作统计失败: ${error.message}`);
    }
  }

  /**
   * 批量创建默认动作
   * @async
   * @returns {Promise<Array>} 返回创建的动作列表
   */
  async createDefaultExercises() {
    try {
      const defaultExercises = [
        // 胸部动作
        { name: '卧推', bodyPart: '胸', difficulty: '中级', description: '经典胸部训练动作' },
        { name: '上斜卧推', bodyPart: '胸', difficulty: '中级', description: '侧重上胸部训练' },
        { name: '哑铃飞鸟', bodyPart: '胸', difficulty: '中级', description: '胸部拉伸动作' },
        { name: '俯卧撑', bodyPart: '胸', difficulty: '初级', description: '自重胸部训练' },
        
        // 背部动作
        { name: '引体向上', bodyPart: '背', difficulty: '高级', description: '自重背部训练' },
        { name: '划船', bodyPart: '背', difficulty: '中级', description: '背部厚度训练' },
        { name: '高位下拉', bodyPart: '背', difficulty: '初级', description: '背部宽度训练' },
        { name: '硬拉', bodyPart: '背', difficulty: '高级', description: '全身复合动作' },
        
        // 肩部动作
        { name: '推举', bodyPart: '肩', difficulty: '中级', description: '肩部整体训练' },
        { name: '侧平举', bodyPart: '肩', difficulty: '初级', description: '肩部中束训练' },
        { name: '前平举', bodyPart: '肩', difficulty: '初级', description: '肩部前束训练' },
        { name: '反向飞鸟', bodyPart: '肩', difficulty: '中级', description: '肩部后束训练' },
        
        // 腿部动作
        { name: '深蹲', bodyPart: '腿', difficulty: '中级', description: '腿部王牌动作' },
        { name: '腿举', bodyPart: '腿', difficulty: '初级', description: '腿部安全训练' },
        { name: '腿弯举', bodyPart: '腿', difficulty: '初级', description: '股二头肌训练' },
        { name: '小腿提踵', bodyPart: '腿', difficulty: '初级', description: '小腿肌肉训练' },
        
        // 手臂动作
        { name: '弯举', bodyPart: '手臂', difficulty: '初级', description: '肱二头肌训练' },
        { name: '臂屈伸', bodyPart: '手臂', difficulty: '中级', description: '肱三头肌训练' },
        { name: '锤式弯举', bodyPart: '手臂', difficulty: '初级', description: '肱肌训练' },
        { name: '绳索下压', bodyPart: '手臂', difficulty: '中级', description: '肱三头肌塑形' },
        
        // 核心动作
        { name: '卷腹', bodyPart: '核心', difficulty: '初级', description: '腹肌基础训练' },
        { name: '平板支撑', bodyPart: '核心', difficulty: '初级', description: '核心稳定性训练' },
        { name: '俄罗斯转体', bodyPart: '核心', difficulty: '中级', description: '腹斜肌训练' },
        { name: '悬垂举腿', bodyPart: '核心', difficulty: '高级', description: '下腹训练' }
      ];

      const createdExercises = [];
      for (const exerciseData of defaultExercises) {
        // 检查是否已存在
        const existing = await Exercise.findOne({ name: exerciseData.name });
        if (!existing) {
          const exercise = new Exercise({
            ...exerciseData,
            isDefault: true
          });
          const saved = await exercise.save();
          createdExercises.push(saved);
        }
      }

      return createdExercises;
    } catch (error) {
      throw new Error(`创建默认动作失败: ${error.message}`);
    }
  }
}

module.exports = new ExerciseService();
