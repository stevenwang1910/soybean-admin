/**
 * Excel导入/导出配置
 */
export interface ExcelImportConfig {
  // 最大文件大小 (MB)
  maxFileSize: number;
  // 支持的文件类型
  supportedFileTypes: string[];
  // 是否启用批量处理
  enableBatchProcessing: boolean;
  // 批大小
  batchSize: number;
  // 是否启用数据验证
  enableDataValidation: boolean;
  // 是否启用错误报告
  enableErrorReport: boolean;
  // 是否启用回滚
  enableRollback: boolean;
}

export interface ExcelExportConfig {
  // 是否启用自定义列选择
  enableCustomColumns: boolean;
  // 是否启用条件格式
  enableConditionalFormatting: boolean;
  // 是否启用数据过滤
  enableDataFilter: boolean;
  // 是否启用多工作表
  enableMultiSheet: boolean;
  // 默认导出列
  defaultColumns: string[];
  // 默认文件名称
  defaultFileName: string;
}

export interface ExcelTemplateConfig {
  // 是否启用模板生成
  enableTemplateGeneration: boolean;
  // 模板列配置
  columns: { key: string; title: string; required?: boolean; width?: number; description?: string }[];
  // 示例数据
  sampleData: any[];
  // 模板说明
  description: string;
}

export const EXCEL_IMPORT_CONFIG: ExcelImportConfig = {
  maxFileSize: 100, // 100MB
  supportedFileTypes: ['.xlsx', '.xls', '.csv'],
  enableBatchProcessing: true,
  batchSize: 1000,
  enableDataValidation: true,
  enableErrorReport: true,
  enableRollback: true
};

export const EXCEL_EXPORT_CONFIG: ExcelExportConfig = {
  enableCustomColumns: true,
  enableConditionalFormatting: true,
  enableDataFilter: true,
  enableMultiSheet: true,
  defaultColumns: ['userName', 'userEmail', 'userGender', 'status', 'nickName', 'userPhone'],
  defaultFileName: '用户数据.xlsx'
};

export const EXCEL_TEMPLATE_CONFIG: ExcelTemplateConfig = {
  enableTemplateGeneration: true,
  columns: [
    { key: 'userName', title: '用户名', required: true, width: 15, description: '3-20个字符' },
    { key: 'userEmail', title: '邮箱', required: true, width: 30, description: '邮箱格式验证' },
    { key: 'userGender', title: '性别', width: 10, description: '男/女' },
    { key: 'status', title: '状态', width: 10, description: '启用/禁用' },
    { key: 'nickName', title: '昵称', width: 20, description: '用户昵称' },
    { key: 'userPhone', title: '手机号', width: 15, description: '手机号格式验证' }
  ],
  sampleData: [
    { userName: '示例用户名', userEmail: 'example@example.com', userGender: '男', status: '启用', nickName: '示例昵称', userPhone: '13800138000' }
  ],
  description: '用户数据导入模板，标*字段为必填项'
};

export const EXCEL_OPERATION_LOG_CONFIG = {
  // 日志保留天数
  retentionDays: 365,
  // 页面大小
  pageSize: 10,
  // 是否启用日志导出
  enableLogExport: true
};

export const EXCEL_DATA_VALIDATION_RULES = {
  userName: {
    required: true,
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: '用户名必须为3-20个字符，包含字母、数字和下划线'
  },
  userEmail: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '邮箱格式不正确'
  },
  userGender: {
    required: false,
    pattern: /^[男女]$/,
    message: '性别只能是男或女'
  },
  status: {
    required: false,
    pattern: /^[启用禁用]$/,
    message: '状态只能是启用或禁用'
  },
  userPhone: {
    required: false,
    pattern: /^1[3-9]\d{9}$/,
    message: '手机号格式不正确'
  }
};
