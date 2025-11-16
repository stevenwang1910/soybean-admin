import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExcelUtils from '@/utils/excel';
import ExcelErrorHandler from '@/utils/excel-error-handler';
import { EXCEL_IMPORT_CONFIG, EXCEL_EXPORT_CONFIG, EXCEL_TEMPLATE_CONFIG } from '@/config/excel';

describe('ExcelUtils', () => {
  // 模拟File对象
  const mockFile = new File(['test content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const mockCSVFile = new File(['name,email\ntest,test@example.com'], 'test.csv', { type: 'text/csv' });

  describe('exportExcel', () => {
    it('should export Excel file correctly', () => {
      const data = [
        { name: 'test1', email: 'test1@example.com' },
        { name: 'test2', email: 'test2@example.com' }
      ];
      
      const columns = [
        { key: 'name', title: '姓名', width: 15 },
        { key: 'email', title: '邮箱', width: 30 }
      ];
      
      // 模拟文件写入函数
      const writeFileMock = vi.fn();
      
      ExcelUtils.exportExcel(data, columns, 'TestSheet', 'test-export.xlsx', writeFileMock);
      
      expect(writeFileMock).toHaveBeenCalled();
    });
  });

  describe('generateImportTemplate', () => {
    it('should generate import template correctly', () => {
      const columns = [
        { key: 'name', title: '姓名', required: true, width: 15 },
        { key: 'email', title: '邮箱', required: true, width: 30 }
      ];
      
      const sampleData = [{ name: '示例姓名', email: 'example@example.com' }];
      
      // 模拟文件写入函数
      const writeFileMock = vi.fn();
      
      ExcelUtils.generateImportTemplate(columns, 'TemplateSheet', 'test-template.xlsx', sampleData, writeFileMock);
      
      expect(writeFileMock).toHaveBeenCalled();
    });
  });

  describe('batchProcessData', () => {
    it('should process data in batches correctly', async () => {
      const data = Array.from({ length: 5500 }, (_, i) => ({ id: i + 1, name: `test${i + 1}` }));
      const batchSize = 1000;
      
      const processedBatches: any[] = [];
      const mockCallback = vi.fn((batch) => {
        processedBatches.push(batch);
        return Promise.resolve({ success: batch.length });
      });
      
      const results = await ExcelUtils.batchProcessData(data, batchSize, mockCallback);
      
      expect(mockCallback).toHaveBeenCalledTimes(6); // 5500 / 1000 = 5.5 → 6 batches
      expect(results.length).toBe(6);
      expect(processedBatches[0].length).toBe(1000);
      expect(processedBatches[5].length).toBe(500);
      
      mockCallback.mockRestore();
    });
  });

  describe('validateImportData', () => {
    it('should validate data correctly', () => {
      const data = [
        { name: 'test1', email: 'test1@example.com' },
        { name: 't', email: 'invalid-email' }, // 姓名过短，邮箱格式错误
        { name: '', email: 'test3@example.com' } // 姓名为空
      ];
      
      const rules = [
        { field: 'name', rule: (value) => value.length >= 3, message: '姓名长度不能少于3个字符', required: true },
        { field: 'email', rule: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: '邮箱格式不正确', required: true }
      ];
      
      const errors = ExcelUtils.validateImportData(data, rules);
      
      expect(errors.length).toBe(3); // 第二条记录有2个错误，第三条记录有1个错误
      expect(errors[0]).toContain('行 3: 姓名长度不能少于3个字符');
      expect(errors[1]).toContain('行 3: 邮箱格式不正确');
      expect(errors[2]).toContain('行 4: 姓名长度不能少于3个字符');
    });
  });
});

describe('ExcelErrorHandler', () => {
  describe('createError', () => {
    it('should create error object correctly', () => {
      const error = ExcelErrorHandler.createError('TEST_ERROR', '测试错误', { detail: '错误详情' });
      
      expect(error).toHaveProperty('code', 'TEST_ERROR');
      expect(error).toHaveProperty('message', '测试错误');
      expect(error).toHaveProperty('details', { detail: '错误详情' });
    });
  });

  describe('handleFileTypeError', () => {
    it('should handle file type error correctly', () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const supportedTypes = ['.xlsx', '.xls', '.csv'];
      
      const error = ExcelErrorHandler.handleFileTypeError(mockFile, supportedTypes);
      
      expect(error.code).toBe(ExcelErrorHandler.ERROR_CODES.FILE_TYPE_NOT_SUPPORTED);
      expect(error.message).toContain('文件类型不支持，请上传.xlsx, .xls, .csv格式的文件');
      expect(error.details).toEqual(expect.objectContaining({ fileType: 'txt', supportedTypes }));
    });
  });

  describe('handleFileSizeError', () => {
    it('should handle file size error correctly', () => {
      const mockFile = new File(['x'.repeat(1024 * 1024 * 150)], 'large-file.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const maxSize = 100;
      
      const error = ExcelErrorHandler.handleFileSizeError(mockFile, maxSize);
      
      expect(error.code).toBe(ExcelErrorHandler.ERROR_CODES.FILE_SIZE_EXCEEDED);
      expect(error.message).toContain('文件大小超过限制，最大支持100MB');
      expect(error.details).toEqual(expect.objectContaining({ fileSize: 1024 * 1024 * 150, maxSize: 1024 * 1024 * 100 }));
    });
  });

  describe('formatError', () => {
    it('should format error message correctly', () => {
      const validationError = ExcelErrorHandler.handleValidationError([
        '行 2: 姓名不能为空',
        '行 2: 邮箱格式不正确',
        '行 3: 姓名不能为空',
        // 更多错误...
      ]);
      
      const formattedMessage = ExcelErrorHandler.formatError(validationError);
      
      expect(formattedMessage).toContain('数据验证失败');
      expect(formattedMessage).toContain('行 2: 姓名不能为空');
      expect(formattedMessage).toContain('行 2: 邮箱格式不正确');
      expect(formattedMessage).toContain('行 3: 姓名不能为空');
    });
  });
});

describe('ExcelConfig', () => {
  it('should export correct import config', () => {
    expect(EXCEL_IMPORT_CONFIG).toEqual(expect.objectContaining({
      maxFileSize: 100,
      supportedFileTypes: ['.xlsx', '.xls', '.csv'],
      enableBatchProcessing: true,
      batchSize: 1000,
      enableDataValidation: true
    }));
  });

  it('should export correct export config', () => {
    expect(EXCEL_EXPORT_CONFIG).toEqual(expect.objectContaining({
      enableCustomColumns: true,
      enableConditionalFormatting: true,
      enableDataFilter: true,
      enableMultiSheet: true
    }));
  });

  it('should export correct template config', () => {
    expect(EXCEL_TEMPLATE_CONFIG).toEqual(expect.objectContaining({
      enableTemplateGeneration: true,
      columns: expect.arrayContaining([
        expect.objectContaining({ key: 'userName', title: '用户名', required: true }),
        expect.objectContaining({ key: 'userEmail', title: '邮箱', required: true })
      ])
    }));
  });
});