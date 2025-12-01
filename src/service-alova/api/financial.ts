import type { FinancialData } from '@/typings/api/financial';
import financialDataJson from '@/data/financial-data.json';

// 缓存对象
let financialDataCache: FinancialData | null = null;
let lastUpdateTime: number = 0;

// 数据更新间隔（5分钟）
const UPDATE_INTERVAL = 5 * 60 * 1000;

/**
 * 获取金融数据
 * @returns 金融数据对象
 */
export const getFinancialData = async (): Promise<FinancialData> => {
  // 检查缓存是否存在且未过期
  if (financialDataCache && Date.now() - lastUpdateTime < UPDATE_INTERVAL) {
    return financialDataCache;
  }

  try {
    // 模拟异步请求
    await new Promise(resolve => setTimeout(resolve, 500));

    // 将JSON数据转换为指定类型
    const data: FinancialData = financialDataJson as FinancialData;
    
    // 更新缓存和时间
    financialDataCache = data;
    lastUpdateTime = Date.now();
    
    return data;
  } catch (error) {
    console.error('Failed to load financial data:', error);
    throw error;
  }
};

/**
 * 手动刷新金融数据
 * @returns 刷新后的金融数据
 */
export const refreshFinancialData = async (): Promise<FinancialData> => {
  financialDataCache = null;
  return getFinancialData();
};

/**
 * 获取指定时间范围的金融数据
 * @param startDate 开始时间
 * @param endDate 结束时间
 * @returns 筛选后的金融数据
 */
export const getFinancialDataByDateRange = async (startDate: string, endDate: string): Promise<FinancialData> => {
  const data = await getFinancialData();
  
  const filteredData = data.data.filter(item => {
    const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
    return itemDate >= startDate && itemDate <= endDate;
  });
  
  return {
    ...data,
    data: filteredData
  };
};
