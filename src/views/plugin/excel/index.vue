<script setup lang="tsx">
import { onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NCheckbox,
  NCheckboxGroup,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NProgress,
  NSelect,
  NSpace,
  NTag,
  NUpload,
  useMessage
} from 'naive-ui';
import { read, utils, writeFile } from 'xlsx';
import Papa from 'papaparse';
import { enableStatusRecord, userGenderRecord } from '@/constants/business';
import { fetchGetUserList, fetchImportUsers } from '@/service/api';
import { useAppStore } from '@/store/modules/app';
import { isTableColumnHasKey, useNaiveTable } from '@/hooks/common/table';
import { checkExcelPermission } from '@/utils/permission';
import { $t } from '@/locales';
import ExcelOperationLog from '@/components/ExcelOperationLog.vue';

// 权限检查
const canImport = ref(false);
const canExport = ref(false);
const canGenerateTemplate = ref(false);

onMounted(() => {
  canImport.value = checkExcelPermission('excel:import');
  canExport.value = checkExcelPermission('excel:export');
  canGenerateTemplate.value = checkExcelPermission('excel:template:generate');
});

const appStore = useAppStore();
const message = useMessage();

const searchParams: Api.SystemManage.UserSearchParams = reactive({
  current: 1,
  size: 999,
  status: null,
  userName: null,
  userGender: null,
  nickName: null,
  userPhone: null,
  userEmail: null
});

const { columns, data, loading, reload } = useNaiveTable({
  api: () => fetchGetUserList(searchParams),
  transform: response => {
    const { data: list, error } = response;

    if (!error) {
      return list.records;
    }

    return [];
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'index',
      title: $t('common.index'),
      align: 'center',
      width: 64,
      render: (_, index) => index + 1
    },
    {
      key: 'userName',
      title: $t('page.manage.user.userName'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'userGender',
      title: $t('page.manage.user.userGender'),
      align: 'center',
      width: 100,
      render: row => {
        if (row.userGender === null) {
          return null;
        }

        const tagMap: Record<Api.SystemManage.UserGender, NaiveUI.ThemeColor> = {
          1: 'primary',
          2: 'error'
        };

        const label = $t(userGenderRecord[row.userGender]);

        return <NTag type={tagMap[row.userGender]}>{label}</NTag>;
      }
    },
    {
      key: 'nickName',
      title: $t('page.manage.user.nickName'),
      align: 'center',
      minWidth: 100
    },
    {
      key: 'userPhone',
      title: $t('page.manage.user.userPhone'),
      align: 'center',
      width: 120
    },
    {
      key: 'userEmail',
      title: $t('page.manage.user.userEmail'),
      align: 'center',
      minWidth: 200
    },
    {
      key: 'status',
      title: $t('page.manage.user.userStatus'),
      align: 'center',
      width: 100,
      render: row => {
        if (row.status === null) {
          return null;
        }

        const tagMap: Record<Api.Common.EnableStatus, NaiveUI.ThemeColor> = {
          1: 'success',
          2: 'warning'
        };

        const label = $t(enableStatusRecord[row.status]);

        return <NTag type={tagMap[row.status]}>{label}</NTag>;
      }
    }
  ]
});

// 导入功能相关
const importModalVisible = ref(false);
const importProgress = ref(0);
const importFileList = ref<File[]>([]);
const importErrors = ref<string[]>([]);
const importResult = ref<{ success: number; failed: number }>({ success: 0, failed: 0 });

// 导出功能相关
const exportModalVisible = ref(false);
const selectedExportColumns = ref<string[]>(columns.value.slice(2).map(col => col.key as string));
const exportFilterConditions = ref<string[]>([]);

// 导入模板生成
function generateImportTemplate() {
  const templateData = [
    {
      userName: '示例用户名',
      userEmail: 'example@example.com',
      userGender: '男',
      status: '启用',
      nickName: '示例昵称',
      userPhone: '13800138000'
    }
  ];

  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(templateData);

  // 设置表头格式
  const headers = ['用户名*', '邮箱*', '性别', '状态', '昵称', '手机号'];
  const headerRow = utils.sheet_to_json(worksheet, { header: 1 })[0];
  headerRow.forEach((_, index) => {
    worksheet[utils.encode_cell({ r: 0, c: index })] = { v: headers[index], t: 's' };
  });

  // 设置列宽
  worksheet['!cols'] = [{ width: 15 }, { width: 30 }, { width: 10 }, { width: 10 }, { width: 20 }, { width: 15 }];

  utils.book_append_sheet(workbook, worksheet, '用户导入模板');
  writeFile(workbook, '用户导入模板.xlsx');

  message.success('导入模板已生成');
}

// 导入文件处理
function handleImportFileUpload(file: File) {
  importFileList.value = [file];
  return false; // 阻止默认上传行为
}

// 解析Excel文件
async function parseExcelFile(file: File) {
  return new Promise<any[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
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

// 解析CSV文件
async function parseCSVFile(file: File) {
  return new Promise<any[]>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: results => {
        resolve(results.data);
      },
      error: reject
    });
  });
}

// 验证导入数据
function validateImportData(data: any[]) {
  const errors: string[] = [];
  data.forEach((row, index) => {
    // 验证用户名
    if (!row['用户名']) {
      errors.push(`行 ${index + 2}: 用户名不能为空`);
    } else if (row['用户名'].length < 3 || row['用户名'].length > 20) {
      errors.push(`行 ${index + 2}: 用户名长度在 3-20 字符之间`);
    }

    // 验证邮箱
    if (!row['邮箱']) {
      errors.push(`行 ${index + 2}: 邮箱不能为空`);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row['邮箱'])) {
      errors.push(`行 ${index + 2}: 邮箱格式不正确`);
    }

    // 验证性别
    if (row['性别'] && !['男', '女'].includes(row['性别'])) {
      errors.push(`行 ${index + 2}: 性别只能是男或女`);
    }

    // 验证状态
    if (row['状态'] && !['启用', '禁用'].includes(row['状态'])) {
      errors.push(`行 ${index + 2}: 状态只能是启用或禁用`);
    }
  });
  return errors;
}

// 转换导入数据格式
function transformImportData(data: any[]) {
  return data.map(row => ({
    userName: row['用户名'],
    userEmail: row['邮箱'],
    userGender: row['性别'] === '男' ? 1 : 2,
    status: row['状态'] === '启用' ? 1 : 2,
    nickName: row['昵称'] || '',
    userPhone: row['手机号'] || ''
  }));
}

// 执行导入
async function doImport() {
  if (importFileList.value.length === 0) {
    message.error('请选择文件');
    return;
  }

  const file = importFileList.value[0];
  if (!file) {
    message.error('文件未选择或无效');
    return;
  }
  const ext = file.name?.split('.').pop()?.toLowerCase();
  if (!ext) {
    message.error('文件格式无效');
    return;
  }

  try {
    importProgress.value = 0;
    importErrors.value = [];

    // 解析文件
    let rawData: any[];
    if (['xlsx', 'xls'].includes(ext)) {
      rawData = await parseExcelFile(file);
    } else if (ext === 'csv') {
      rawData = await parseCSVFile(file);
    } else {
      throw new Error('不支持的文件格式');
    }

    importProgress.value = 30;

    // 验证数据
    const errors = validateImportData(rawData);
    if (errors.length > 0) {
      importErrors.value = errors;
      message.error('导入数据验证失败');
      return;
    }

    importProgress.value = 60;

    // 转换数据格式
    const transformedData = transformImportData(rawData);

    // 调用后端导入接口
    const result = await fetchImportUsers(transformedData);

    importProgress.value = 100;

    // 处理导入结果
    importResult.value = result.data;
    message.success('导入完成');

    // 刷新数据列表
    reload();
  } catch (error) {
    importErrors.value = [error.message];
    message.error('导入失败');
  }
}

// 导出Excel
function exportExcel() {
  if (!columns.value) {
    message.error('获取列配置失败');
    return;
  }
  const exportColumns = columns.value.slice(2).filter(col => selectedExportColumns.value.includes(col.key as string));

  if (exportColumns.length === 0) {
    message.error('请选择导出列');
    return;
  }

  const excelList = data.value.map(item => exportColumns.map(col => getTableValue(col, item)));

  const titleList = exportColumns.map(col => (isTableColumnHasTitle(col) && col.title) || null);

  excelList.unshift(titleList);

  const workBook = utils.book_new();

  const workSheet = utils.aoa_to_sheet(excelList);

  workSheet['!cols'] = exportColumns.map(item => ({
    width: Math.round(Number(item.width) / 10 || 20)
  }));

  utils.book_append_sheet(workBook, workSheet, '用户列表');

  writeFile(workBook, '用户数据.xlsx');
  exportModalVisible.value = false;
}

function getTableValue(col: NaiveUI.TableColumn<Api.SystemManage.User>, item: Api.SystemManage.User) {
  if (!isTableColumnHasKey(col)) {
    return null;
  }

  const { key } = col;

  if (key === 'userRoles') {
    return item.userRoles.map(role => role).join(',');
  }

  if (key === 'status') {
    return (item.status && $t(enableStatusRecord[item.status])) || null;
  }

  if (key === 'userGender') {
    return (item.userGender && $t(userGenderRecord[item.userGender])) || null;
  }

  // @ts-expect-error the key is not in the type of Api.SystemManage.User
  return item[key] || null;
}

function isTableColumnHasTitle<T>(column: NaiveUI.TableColumn<T>): column is NaiveUI.TableColumnWithKey<T> & {
  title: string;
} {
  return Boolean((column as NaiveUI.TableColumnWithKey<T>).title);
}
</script>

<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard title="Excel导入/导出" :bordered="false" size="small" class="card-wrapper sm:flex-1-hidden">
      <template #header-extra>
        <NSpace align="end" wrap justify="end" class="lt-sm:w-200px">
          <NButton v-if="canGenerateTemplate" size="small" ghost type="primary" @click="generateImportTemplate">
            <template #icon>
              <icon-ic-outline-get-app class="text-icon" />
            </template>
            下载模板
          </NButton>
          <NButton v-if="canImport" size="small" ghost type="primary" @click="importModalVisible = true">
            <template #icon>
              <icon-ic-outline-upload-file class="text-icon" />
            </template>
            导入excel
          </NButton>
          <NButton v-if="canExport" size="small" ghost type="primary" @click="exportModalVisible = true">
            <template #icon>
              <icon-file-icons:microsoft-excel class="text-icon" />
            </template>
            导出excel
          </NButton>
        </NSpace>
      </template>

      <NDataTable
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="962"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="false"
        :virtual-scroll="true"
        class="sm:h-full"
      />
    </NCard>

    <!-- 操作记录 -->
    <ExcelOperationLog />

    <!-- 导入模态框 -->
    <NModal v-model:show="importModalVisible" title="Excel导入" width="600px">
      <NForm layout="vertical">
        <NFormItem label="选择文件">
          <NUpload
            :file-list="importFileList"
            accept=".xlsx,.xls,.csv"
            multiple="false"
            @before-upload="handleImportFileUpload"
          >
            <NButton type="primary">点击选择文件</NButton>
          </NUpload>
        </NFormItem>

        <div v-if="importProgress > 0" class="mb-4">
          <NProgress :percentage="importProgress" />
        </div>

        <div v-if="importErrors.length > 0" class="mb-4">
          <h4 class="mb-2 text-red-500">导入错误：</h4>
          <ul class="max-h-48 overflow-y-auto text-sm text-red-500">
            <li v-for="(error, index) in importErrors" :key="index">
              {{ error }}
            </li>
          </ul>
        </div>

        <div v-if="importResult.success > 0 || importResult.failed > 0" class="mb-4">
          <h4 class="mb-2 text-green-500">导入结果：</h4>
          <p>成功导入：{{ importResult.success }} 条</p>
          <p>失败导入：{{ importResult.failed }} 条</p>
        </div>

        <NSpace justify="end">
          <NButton @click="importModalVisible = false">取消</NButton>
          <NButton type="primary" @click="doImport">开始导入</NButton>
        </NSpace>
      </NForm>
    </NModal>

    <!-- 导出模态框 -->
    <NModal v-model:show="exportModalVisible" title="Excel导出设置" width="600px">
      <NForm layout="vertical">
        <NFormItem label="选择导出列">
          <NCheckboxGroup v-model:value="selectedExportColumns">
            <NSpace vertical>
              <NCheckbox v-for="col in columns.value.slice(2)" :key="col.key" :value="col.key as string">
                {{ col.title }}
              </NCheckbox>
            </NSpace>
          </NCheckboxGroup>
        </NFormItem>

        <NFormItem label="过滤条件">
          <NSelect v-model:value="exportFilterConditions" multiple placeholder="请选择过滤条件">
            <NSelect.Option value="status:1">状态：启用</NSelect.Option>
            <NSelect.Option value="status:2">状态：禁用</NSelect.Option>
            <NSelect.Option value="userGender:1">性别：男</NSelect.Option>
            <NSelect.Option value="userGender:2">性别：女</NSelect.Option>
          </NSelect>
        </NFormItem>

        <NSpace justify="end">
          <NButton @click="exportModalVisible = false">取消</NButton>
          <NButton type="primary" @click="exportExcel">开始导出</NButton>
        </NSpace>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped>
.card-wrapper {
  margin-bottom: 24px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mb-2 {
  margin-bottom: 8px;
}
.text-red-500 {
  color: #ff4d4f;
}
.text-green-500 {
  color: #52c41a;
}
.max-h-48 {
  max-height: 192px;
}
.text-sm {
  font-size: 14px;
}
</style>
