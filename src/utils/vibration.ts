/**
 * 手机振动工具函数
 * 提供不同类型的振动效果
 */

import { usePlayerStore } from '../store/store';

// 检查浏览器是否支持振动API
const isVibrationSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * 基础振动函数
 * @param pattern 振动模式，可以是数字（持续时间）或数组（振动和暂停的交替模式）
 */
export const vibrate = (pattern: number | number[]): void => {
  if (!isVibrationSupported()) {
    console.warn('Vibration API not supported');
    return;
  }
  
  // 检查用户是否开启了振动
  const vibrationEnabled = usePlayerStore.getState().vibrationEnabled;
  if (!vibrationEnabled) {
    return;
  }
  
  try {
    navigator.vibrate(pattern);
  } catch (error) {
    console.warn('Vibration failed:', error);
  }
};

/**
 * 阶梯振动效果 - 用于卡牌展开
 * 创建一种渐进式的振动感，每张卡牌展开时都有轻微的振动
 * @param cardCount 卡牌数量
 * @param baseIntensity 基础振动强度（毫秒）
 */
export const createStaircaseVibration = (cardCount: number, baseIntensity: number = 30): void => {
  if (!isVibrationSupported()) return;
  
  // 创建阶梯振动模式：每张卡牌一个振动，强度递增
  const pattern: number[] = [];
  
  for (let i = 0; i < cardCount; i++) {
    // 每张卡牌的振动强度递增，但不超过60ms（降低强度）
    const intensity = Math.min(baseIntensity + (i * 5), 60);
    pattern.push(intensity);
    
    // 卡牌之间的间隔，逐渐缩短，但保持最小间隔
    const interval = Math.max(120 - (i * 10), 80);
    pattern.push(interval);
  }
  
  vibrate(pattern);
};

/**
 * 抽取振动效果 - 用于卡牌抽取
 * 创建一种"抽取"的振动感，模拟从牌堆中抽取卡牌的感觉
 */
export const createDrawVibration = (): void => {
  if (!isVibrationSupported()) return;
  
  // 抽取振动模式：模拟卡牌被抽出的感觉 - 更轻柔的振动序列
  const pattern = [20, 10, 25, 15, 35];
  vibrate(pattern);
};

/**
 * 点击振动效果 - 用于按钮点击
 * @param intensity 振动强度
 */
export const createClickVibration = (intensity: number = 20): void => {
  if (!isVibrationSupported()) return;
  
  vibrate(intensity);
};

/**
 * 成功振动效果 - 用于操作成功
 */
export const createSuccessVibration = (): void => {
  if (!isVibrationSupported()) return;
  
  // 成功振动模式：两次轻柔的短促振动
  const pattern = [30, 80, 30];
  vibrate(pattern);
};

/**
 * 错误振动效果 - 用于操作失败
 */
export const createErrorVibration = (): void => {
  if (!isVibrationSupported()) return;
  
  // 错误振动模式：长振动
  const pattern = [200];
  vibrate(pattern);
};
