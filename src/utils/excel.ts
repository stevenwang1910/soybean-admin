import { utils, writeFile, read } from 'xlsx';
import Papa from 'papaparse';

/**
 * Excel工具类
 * 封装企业级Excel导入/导出功能
 */
export class ExcelUtils {
  /**
   * 导出Excel文件
   * @param data 导出数据
   * @param columns 列配置
   * @param sheetName 工作表名称
   * @param fileName 文件名
   * @param writer 可选的文件写入函数，用于测试目的
   */
  static exportExcel(
    data: any[],
    columns: { key: string; title: string; width?: number }[],
    sheetName: string = 'Sheet1',
    fileName: string = 'export.xlsx',
    writer: (wb: any, fn: string) => void = writeFile
  ) {
    const exportColumns = columns;
    const excelList = data.map(item => exportColumns.map(col => item[col.key]));
    const titleList = exportColumns.map(col => col.title);

    excelList.unshift(titleList);

    const workBook = utils.book_new();
    const workSheet = utils.aoa_to_sheet(excelList);

    workSheet['!cols'] = exportColumns.map(item => ({
      width: item.width || 20
    }));

    utils.book_append_sheet(workBook, workSheet, sheetName);
    writer(workBook, fileName);
  }

  /**
   * 解析Excel文件
   * @param file Excel文件
   * @returns 解析后的数据
   */
  static async parseExcelFile(file: File): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
        
        // 跳过表头，处理数据
        const headers = jsonData[0];
        const rows = jsonData.slice(1);
        
        const parsedData = rows.map(row => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return obj;
        });
        
        resolve(parsedData);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 解析CSV文件
   * @param file CSV文件
   * @returns 解析后的数据
   */
  static async parseCSVFile(file: File): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      Papa.parse(file, { 
        header: true, 
        complete: (results) => {
          resolve(results.data);
        },
        error: reject
      });
    });
  }

  /**
   * 生成导入模板
   * @param columns 列配置
   * @param sheetName 工作表名称
   * @param fileName 文件名
   * @param sampleData 示例数据
   * @param writer 可选的文件写入函数，用于测试目的
   */
  static generateImportTemplate(
    columns: { key: string; title: string; required?: boolean; width?: number }[],
    sheetName: string = 'Template',
    fileName: string = 'import-template.xlsx',
    sampleData?: any[],
    writer: (wb: any, fn: string) => void = writeFile
  ) {
    // 准备模板数据
    const templateData = sampleData || [{}];
    
    // 准备表头
    const headers = columns.map(col => `${col.title}${col.required ? '*' : ''}`);
    
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(templateData);
    
    // 设置表头格式
    const headerRow = utils.sheet_to_json(worksheet, { header: 1 })[0];
    headerRow.forEach((_, index) => {
      worksheet[utils.encode_cell({ r: 0, c: index })] = { v: headers[index], t: 's' };
    });
    
    // 设置列宽
    worksheet['!cols'] = columns.map(item => ({
      width: item.width || 20
    }));
    
    utils.book_append_sheet(workbook, worksheet, sheetName);
    writer(workbook, fileName);
  }

  /**
   * 批量处理数据
   * @param data 数据列表
   * @param batchSize 批大小
   * @param callback 处理回调
   * @returns 处理结果
   */
  static async batchProcessData<T>(
    data: T[],
    batchSize: number = 1000,
    callback: (batch: T[]) => Promise<any>
  ): Promise<any[]> {
    const results: any[] = [];
    const batches = Math.ceil(data.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);
      
      const result = await callback(batch);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 验证导入数据
   * @param data 数据列表
   * @param rules 验证规则
   * @returns 错误信息列表
   */
  static validateImportData(
    data: any[],
    rules: { field: string; rule: (value: any) => boolean; message: string; required?: boolean }[]
  ): string[] {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      rules.forEach(rule => {
        const value = row[rule.field];
        
        // 检查必填字段
        if (rule.required && !value && value !== 0) {
          errors.push(`行 ${index + 2}: ${rule.message}`);
          return;
        }
        
        // 检查验证规则
        if (value && !rule.rule(value)) {
          errors.push(`行 ${index + 2}: ${rule.message}`);
        }
      });
    });
    
    return errors;
  }
}

export default ExcelUtils;