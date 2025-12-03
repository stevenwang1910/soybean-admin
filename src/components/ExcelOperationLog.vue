<template>
  <div class="excel-operation-log">
    <NCard title="操作记录" :bordered="false" size="small">
      <template #header-extra>
        <NSpace>
          <NSelect v-model:value="logType" placeholder="日志类型">
<template #option="{ value }">
  <div>{{ value === 'all' ? '全部' : value === 'import' ? '导入' : value === 'export' ? '导出' : value === 'template' ? '模板生成' : '' }}</div>
</template>
<option value="all" label="全部" />
<option value="import" label="导入" />
<option value="export" label="导出" />
<option value="template" label="模板生成" />
</NSelect>
          <NButton size="small" type="primary" @click="refreshLogs">
            <template #icon>
              <icon-ic-outline-refresh class="text-icon" />
            </template>
            刷新
          </NButton>
        </NSpace>
      </template>

      <NDataTable
        :columns="columns"
        :data="logs"
        size="small"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
        :row-key="row => row.id"
      />
    </NCard>
  </div>
</template>

<script setup lang="tsx">
import { ref, reactive, onMounted } from 'vue';
import { NCard, NSelect, NButton, NDataTable, NTag } from 'naive-ui';
import { fetchExcelOperationLogs } from '@/service/api';
import { $t } from '@/locales';

interface OperationLog {
  id: string;
  operator: string;
  operationType: 'import' | 'export' | 'template';
  operationTime: string;
  fileType: string;
  recordCount: number;
  successCount: number;
  failedCount: number;
  status: 'success' | 'failed' | 'processing';
  ip: string;
  remarks: string;
}

const logType = ref('all');
const logs = ref<OperationLog[]>([]);
const loading = ref(false);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageCount: 1,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
  total: 0
});

const columns = [
  {
    key: 'id',
    title: $t('common.id'),
    align: 'center',
    width: 100
  },
  {
    key: 'operator',
    title: $t('common.operator'),
    align: 'center',
    width: 120
  },
  {
    key: 'operationType',
    title: $t('common.operationType'),
    align: 'center',
    width: 120,
    render: (row: OperationLog) => {
      const typeMap: Record<string, { label: string; color: NaiveUI.ThemeColor }> = {
        import: { label: '导入', color: 'primary' },
        export: { label: '导出', color: 'success' },
        template: { label: '模板生成', color: 'warning' }
      };
      return <NTag type={typeMap[row.operationType].color}>{typeMap[row.operationType].label}</NTag>;
    }
  },
  {
    key: 'operationTime',
    title: $t('common.operationTime'),
    align: 'center',
    width: 180
  },
  {
    key: 'fileType',
    title: $t('common.fileType'),
    align: 'center',
    width: 100
  },
  {
    key: 'recordCount',
    title: $t('common.recordCount'),
    align: 'center',
    width: 100
  },
  {
    key: 'successCount',
    title: $t('common.successCount'),
    align: 'center',
    width: 100
  },
  {
    key: 'failedCount',
    title: $t('common.failedCount'),
    align: 'center',
    width: 100
  },
  {
    key: 'status',
    title: $t('common.status'),
    align: 'center',
    width: 100,
    render: (row: OperationLog) => {
      const statusMap: Record<string, { label: string; color: NaiveUI.ThemeColor }> = {
        success: { label: '成功', color: 'success' },
        failed: { label: '失败', color: 'error' },
        processing: { label: '处理中', color: 'warning' }
      };
      return <NTag type={statusMap[row.status].color}>{statusMap[row.status].label}</NTag>;
    }
  },
  {
    key: 'ip',
    title: $t('common.ip'),
    align: 'center',
    width: 150
  },
  {
    key: 'remarks',
    title: $t('common.remarks'),
    align: 'left',
    ellipsis: { showTooltip: true }
  }
];

async function loadLogs() {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      size: pagination.pageSize,
      type: logType.value === 'all' ? undefined : logType.value
    };
    const result = await fetchExcelOperationLogs(params);
    logs.value = result.data.records;
    pagination.total = result.data.total;
    pagination.pageCount = result.data.pages;
  } finally {
    loading.value = false;
  }
}

function refreshLogs() {
  loadLogs();
}

function handlePageChange(page: number) {
  pagination.page = page;
  loadLogs();
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  loadLogs();
}

onMounted(() => {
  loadLogs();
});
</script>

<style scoped>
.excel-operation-log {
  margin-top: 16px;
}
</style>