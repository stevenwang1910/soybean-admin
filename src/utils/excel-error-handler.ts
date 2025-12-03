/**
 * Excel导入/导出错误处理工具
 */
export interface ExcelError {
  code: string;
  message: string;
  details?: any;
  row?: number;
  field?: string;
}

export class ExcelErrorHandler {
  /**
   * 错误代码常量
   */
  static ERROR_CODES = {
    // 文件相关错误
    FILE_TYPE_NOT_SUPPORTED: 'FILE_TYPE_NOT_SUPPORTED',
    FILE_SIZE_EXCEEDED: 'FILE_SIZE_EXCEEDED',
    FILE_READ_ERROR: 'FILE_READ_ERROR',
    FILE_PARSE_ERROR: 'FILE_PARSE_ERROR',
    
    // 数据相关错误
    DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
    DATA_FORMAT_ERROR: 'DATA_FORMAT_ERROR',
    DATA_EMPTY: 'DATA_EMPTY',
    
    // 系统相关错误
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    
    // 业务相关错误
    IMPORT_FAILED: 'IMPORT_FAILED',
    EXPORT_FAILED: 'EXPORT_FAILED',
    TEMPLATE_GENERATION_FAILED: 'TEMPLATE_GENERATION_FAILED'
  };

  /**
   * 创建错误对象
   * @param code 错误代码
   * @param message 错误消息
   * @param details 错误详情
   * @returns ExcelError对象
   */
  static createError(code: string, message: string, details?: any): ExcelError {
    return {
      code,
      message,
      details
    };
  }

  /**
   * 处理文件类型错误
   * @param file 上传的文件
   * @param supportedTypes 支持的文件类型
   * @returns ExcelError对象
   */
  static handleFileTypeError(file: File, supportedTypes: string[]): ExcelError {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    return this.createError(
      this.ERROR_CODES.FILE_TYPE_NOT_SUPPORTED,
      `文件类型不支持，请上传${supportedTypes.join(', ')}格式的文件`,
      { fileType, supportedTypes }
    );
  }

  /**
   * 处理文件大小错误
   * @param file 上传的文件
   * @param maxSize 最大文件大小 (MB)
   * @returns ExcelError对象
   */
  static handleFileSizeError(file: File, maxSize: number): ExcelError {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return this.createError(
      this.ERROR_CODES.FILE_SIZE_EXCEEDED,
      `文件大小超过限制，最大支持${maxSize}MB，当前文件大小为${fileSizeMB}MB`,
      { fileSize: file.size, maxSize: maxSize * 1024 * 1024 }
    );
  }

  /**
   * 处理数据验证错误
   * @param errors 错误列表
   * @returns ExcelError对象
   */
  static handleValidationError(errors: string[]): ExcelError {
    return this.createError(
      this.ERROR_CODES.DATA_VALIDATION_FAILED,
      '数据验证失败',
      { errors }
    );
  }

  /**
   * 处理网络错误
   * @param error 网络错误对象
   * @returns ExcelError对象
   */
  static handleNetworkError(error: any): ExcelError {
    return this.createError(
      this.ERROR_CODES.NETWORK_ERROR,
      '网络请求失败，请检查网络连接',
      { originalError: error }
    );
  }

  /**
   * 处理系统错误
   * @param error 系统错误对象
   * @returns ExcelError对象
   */
  static handleSystemError(error: any): ExcelError {
    return this.createError(
      this.ERROR_CODES.SYSTEM_ERROR,
      '系统错误，请联系管理员',
      { originalError: error }
    );
  }

  /**
   * 处理权限错误
   * @returns ExcelError对象
   */
  static handlePermissionError(): ExcelError {
    return this.createError(
      this.ERROR_CODES.PERMISSION_DENIED,
      '您没有操作权限，请联系管理员'
    );
  }

  /**
   * 格式化错误信息为用户友好的格式
   * @param error ExcelError对象
   * @returns 用户友好的错误信息
   */
  static formatError(error: ExcelError): string {
    switch (error.code) {
      case this.ERROR_CODES.FILE_TYPE_NOT_SUPPORTED:
      case this.ERROR_CODES.FILE_SIZE_EXCEEDED:
      case this.ERROR_CODES.PERMISSION_DENIED:
        return error.message;
      
      case this.ERROR_CODES.DATA_VALIDATION_FAILED:
        if (error.details?.errors && error.details.errors.length > 0) {
          return `${error.message}：\n${error.details.errors.slice(0, 10).join('\n')}${error.details.errors.length > 10 ? `\n... 共${error.details.errors.length}条错误` : ''}`;
        }
        return error.message;
      
      default:
        return error.message;
    }
  }

  /**
   * 生成错误报告
   * @param errors ExcelError对象列表
   * @returns 错误报告字符串
   */
  static generateErrorReport(errors: ExcelError[]): string {
    let report = 'Excel操作错误报告\n';
    report += '='.repeat(50) + '\n';
    
    errors.forEach((error, index) => {
      report += `${index + 1}. 错误代码：${error.code}\n`;
      report += `   错误信息：${error.message}\n`;
      
      if (error.details) {
        report += `   错误详情：${JSON.stringify(error.details, null, 2)}\n`;
      }
      
      if (error.row) {
        report += `   行号：${error.row}\n`;
      }
      
      if (error.field) {
        report += `   字段：${error.field}\n`;
      }
      
      report += '-'.repeat(50) + '\n';
    });
    
    return report;
  }
}

export default ExcelErrorHandler;