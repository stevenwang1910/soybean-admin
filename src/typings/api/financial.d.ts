export interface FinancialMeta {
  /** 股票代码 */
  symbol: string;
  /** 公司名称 */
  name: string;
  /** 交易所 */
  exchange: string;
  /** 货币单位 */
  currency: string;
  /** 时区 */
  timezone: string;
  /** 数据源 */
  data_source: string;
  /** 开始日期 */
  start_date: string;
  /** 结束日期 */
  end_date: string;
}

export interface FinancialDataItem {
  /** 时间戳 */
  timestamp: string;
  /** 开盘价 */
  open: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 收盘价 */
  close: number;
  /** 成交量 */
  volume: number;
  /** 5日均线 */
  ma5: number;
  /** 10日均线 */
  ma10: number;
  /** MACD指标 */
  macd: number;
  /** RSI指标 */
  rsi: number;
}

export interface FinancialData {
  /** 元数据 */
  meta: FinancialMeta;
  /** 历史数据 */
  data: FinancialDataItem[];
}
