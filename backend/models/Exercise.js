/**
 * 动作库数据模型
 * 定义健身动作的基本信息和属性
 * @module models/Exercise
 */

const mongoose = require('mongoose');

/**
 * 动作库Schema
 * 存储所有可用的健身动作，包括名称、部位、难度等信息
 */
const exerciseSchema = new mongoose.Schema({
  /**
   * 动作名称
   * @type {String}
   * @required
   * @unique
   */
  name: {
    type: String,
    required: [true, '动作名称不能为空'],
    unique: true,
    trim: true
  },

  /**
   * 训练部位
   * @type {String}
   * @required
   * @enum {string[]} - 可选值: 胸、背、肩、腿、手臂、核心、全身
   */
  bodyPart: {
    type: String,
    required: [true, '训练部位不能为空'],
    enum: {
      values: ['胸', '背', '肩', '腿', '手臂', '核心', '全身'],
      message: '{VALUE} 不是有效的训练部位'
    }
  },

  /**
   * 动作难度
   * @type {String}
   * @required
   * @enum {string[]} - 可选值: 初级、中级、高级
   */
  difficulty: {
    type: String,
    required: [true, '动作难度不能为空'],
    enum: {
      values: ['初级', '中级', '高级'],
      message: '{VALUE} 不是有效的难度等级'
    }
  },

  /**
   * 动作描述
   * @type {String}
   * @optional
   */
  description: {
    type: String,
    default: ''
  },

  /**
   * 标准组数建议
   * @type {Number}
   * @optional
   */
  recommendedSets: {
    type: Number,
    default: 3,
    min: [1, '组数不能小于1']
  },

  /**
   * 标准每组次数建议
   * @type {Number}
   * @optional
   */
  recommendedReps: {
    type: Number,
    default: 12,
    min: [1, '次数不能小于1']
  },

  /**
   * 是否系统默认动作
   * @type {Boolean}
   * @default false
   */
  isDefault: {
    type: Boolean,
    default: false
  },

  /**
   * 创建时间
   * @type {Date}
   * @default Date.now
   */
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Schema配置
  timestamps: true, // 自动添加createdAt和updatedAt
  toJSON: { virtuals: true }, // 允许虚拟字段在JSON中显示
  toObject: { virtuals: true }
});

// 索引优化
exerciseSchema.index({ name: 1 });
exerciseSchema.index({ bodyPart: 1 });
exerciseSchema.index({ difficulty: 1 });

// 实例方法：获取动作的基本信息
exerciseSchema.methods.getBasicInfo = function() {
  return {
    id: this._id,
    name: this.name,
    bodyPart: this.bodyPart,
    difficulty: this.difficulty
  };
};

// 静态方法：按部位查询动作
exerciseSchema.statics.findByBodyPart = function(bodyPart) {
  return this.find({ bodyPart }).sort({ name: 1 });
};

// 静态方法：按难度查询动作
exerciseSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({ difficulty }).sort({ name: 1 });
};

// 创建模型
const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
