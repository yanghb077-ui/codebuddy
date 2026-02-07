/**
 * 训练记录数据模型
 * 定义用户的训练历史记录，包括训练日期、动作、重量、组数等详细信息
 * @module models/Workout
 */

const mongoose = require('mongoose');

/**
 * 单组训练数据子Schema
 * 记录每一组的具体信息：重量、次数、是否完成
 */
const setSchema = new mongoose.Schema({
  /**
   * 第几组（从1开始）
   * @type {Number}
   * @required
   * @min 1
   */
  setNumber: {
    type: Number,
    required: true,
    min: 1
  },

  /**
   * 重量（单位：kg）
   * @type {Number}
   * @required
   * @min 0
   */
  weight: {
    type: Number,
    required: true,
    min: 0
  },

  /**
   * 次数
   * @type {Number}
   * @required
   * @min 1
   */
  reps: {
    type: Number,
    required: true,
    min: 1
  },

  /**
   * 是否已完成该组
   * @type {Boolean}
   * @default false
   */
  completed: {
    type: Boolean,
    default: false
  },

  /**
   * 完成时间（点击完成按钮时记录）
   * @type {Date}
   * @optional
   */
  completedAt: {
    type: Date
  }
});

/**
 * 单个动作训练记录子Schema
 * 记录某个动作的所有组数信息
 */
const exerciseLogSchema = new mongoose.Schema({
  /**
   * 动作ID（引用Exercise模型）
   * @type {ObjectId}
   * @required
   */
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },

  /**
   * 该动作的所有组数记录
   * @type {Array}
   * @default []
   */
  sets: [setSchema],

  /**
   * 动作备注
   * @type {String}
   * @optional
   */
  notes: {
    type: String,
    default: ''
  }
});

/**
 * 训练记录主Schema
 * 记录一次完整的训练会话
 */
const workoutSchema = new mongoose.Schema({
  /**
   * 用户名
   * @type {String}
   * @required
   */
  username: {
    type: String,
    required: true,
    index: true
  },

  /**
   * 训练日期
   * @type {Date}
   * @required
   * @default Date.now
   */
  date: {
    type: Date,
    required: true,
    default: Date.now
  },

  /**
   * 训练开始时间
   * @type {Date}
   * @required
   * @default Date.now
   */
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },

  /**
   * 训练结束时间
   * @type {Date}
   * @optional
   */
  endTime: {
    type: Date
  },

  /**
   * 训练时长（分钟）
   * @type {Number}
   * @optional
   * @min 0
   */
  duration: {
    type: Number,
    min: 0
  },

  /**
   * 训练包含的动作列表
   * @type {Array}
   * @default []
   */
  exercises: [exerciseLogSchema],

  /**
   * 训练强度
   * 计算方法：基于完成的组数、重量和次数综合计算
   * @type {Number}
   * @optional
   * @min 0
   * @max 10
   */
  intensity: {
    type: Number,
    min: 0,
    max: 10
  },

  /**
   * 训练备注
   * @type {String}
   * @optional
   */
  notes: {
    type: String,
    default: ''
  },

  /**
   * 训练状态
   * @type {String}
   * @enum {string[]} - 进行中、已完成
   * @default '进行中'
   */
  status: {
    type: String,
    enum: {
      values: ['进行中', '已完成'],
      message: '{VALUE} 不是有效的训练状态'
    },
    default: '进行中'
  }
}, {
  // Schema配置
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引优化
workoutSchema.index({ username: 1, date: -1 }); // 按用户名和日期复合索引
workoutSchema.index({ username: 1, status: 1 });

// 虚拟字段：训练部位列表
workoutSchema.virtual('bodyParts').get(function() {
  // 需要通过populate后才能使用
  return [];
});

// 实例方法：计算训练强度
workoutSchema.methods.calculateIntensity = function() {
  let totalSets = 0;
  let totalWeight = 0;
  let completedSets = 0;

  this.exercises.forEach(exercise => {
    exercise.sets.forEach(set => {
      totalSets++;
      totalWeight += set.weight * set.reps;
      if (set.completed) {
        completedSets++;
      }
    });
  });

  // 简单的强度计算算法：基于完成率和总重量
  const completionRate = totalSets > 0 ? completedSets / totalSets : 0;
  const weightFactor = Math.min(totalWeight / 1000, 1); // 归一化到0-1

  // 强度 = 完成率 * 0.6 + 重量因子 * 0.4，然后乘以10得到0-10的评分
  const intensity = (completionRate * 0.6 + weightFactor * 0.4) * 10;
  
  return Math.min(Math.round(intensity * 10) / 10, 10); // 保留1位小数，最大10
};

// 实例方法：完成训练
workoutSchema.methods.completeWorkout = function() {
  this.endTime = new Date();
  this.duration = Math.round((this.endTime - this.startTime) / 60000); // 转换为分钟
  this.intensity = this.calculateIntensity();
  this.status = '已完成';
  return this.save();
};

// 实例方法：添加动作
workoutSchema.methods.addExercise = function(exerciseId) {
  const newExercise = {
    exercise: exerciseId,
    sets: []
  };
  this.exercises.push(newExercise);
  return this.save();
};

// 实例方法：添加组数
workoutSchema.methods.addSet = function(exerciseIndex, weight, reps) {
  if (exerciseIndex < 0 || exerciseIndex >= this.exercises.length) {
    throw new Error('动作索引超出范围');
  }

  const exercise = this.exercises[exerciseIndex];
  const setNumber = exercise.sets.length + 1;

  exercise.sets.push({
    setNumber,
    weight,
    reps,
    completed: false
  });

  return this.save();
};

// 实例方法：完成某组
workoutSchema.methods.completeSet = function(exerciseIndex, setIndex) {
  if (exerciseIndex < 0 || exerciseIndex >= this.exercises.length) {
    throw new Error('动作索引超出范围');
  }

  const exercise = this.exercises[exerciseIndex];
  if (setIndex < 0 || setIndex >= exercise.sets.length) {
    throw new Error('组数索引超出范围');
  }

  const set = exercise.sets[setIndex];
  set.completed = true;
  set.completedAt = new Date();

  return this.save();
};

// 实例方法：删除某组
workoutSchema.methods.removeSet = function(exerciseIndex, setIndex) {
  if (exerciseIndex < 0 || exerciseIndex >= this.exercises.length) {
    throw new Error('动作索引超出范围');
  }

  const exercise = this.exercises[exerciseIndex];
  if (setIndex < 0 || setIndex >= exercise.sets.length) {
    throw new Error('组数索引超出范围');
  }

  exercise.sets.splice(setIndex, 1);
  exercise.sets.forEach((set, index) => {
    set.setNumber = index + 1;
  });

  return this.save();
};

// 静态方法：获取最近N天的训练记录
workoutSchema.statics.getRecentWorkouts = function(username, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    username,
    date: { $gte: startDate }
  })
    .populate('exercises.exercise', 'name bodyPart difficulty')
    .sort({ date: -1 });
};

// 静态方法：获取某一天的训练记录
workoutSchema.statics.getWorkoutByDate = function(username, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.findOne({
    username,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate('exercises.exercise', 'name bodyPart difficulty');
};

// 静态方法：获取今天的训练记录
workoutSchema.statics.getTodayWorkout = function(username) {
  const today = new Date();
  return this.getWorkoutByDate(username, today);
};

// 创建模型
const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
