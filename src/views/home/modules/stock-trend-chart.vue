<script setup lang="ts">
import { watch, onMounted, ref, onUnmounted } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { useEcharts } from '@/hooks/common/echarts';
import { $t } from '@/locales';
import { getFinancialData } from '@/service-alova/api/financial';
import type { FinancialDataItem } from '@/typings/api/financial';

const appStore = useAppStore();
const loading = ref(true);
const error = ref<string | null>(null);

const { domRef, updateOptions, chartInstance } = useEcharts(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    },
    formatter: function(params: any) {
      let result = `<div style="padding: 8px;">`;
      result += `<div>${params[0].axisValue}</div>`;
      params.forEach((param: any) => {
        result += `<div style="color: ${param.color};">`;
        result += `${param.seriesName}: ${param.value.toFixed(2)}`;
        result += `</div>`;
      });
      result += `</div>`;
      return result;
    }
  },
  legend: {
    data: ['收盘价', '最高价', '最低价'],
    top: '0'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '8%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLine: {
      onZero: false
    },
    splitLine: {
      show: false
    },
    axisLabel: {
      formatter: function(value: string) {
        return value.split(' ')[0];
      }
    }
  },
  yAxis: {
    scale: true,
    splitArea: {
      show: true
    },
    axisLine: {
      onZero: false
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 70,
      end: 100
    },
    {
      show: true,
      type: 'slider',
      bottom: '0%',
      start: 70,
      end: 100
    }
  ],
  series: [
    {
      name: '最高价',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: '#ef5350',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(239, 83, 80, 0.2)' },
            { offset: 1, color: 'rgba(239, 83, 80, 0.05)' }
          ]
        }
      }
    },
    {
      name: '最低价',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: '#26a69a',
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(38, 166, 154, 0.2)' },
            { offset: 1, color: 'rgba(38, 166, 154, 0.05)' }
          ]
        }
      }
    },
    {
      name: '收盘价',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: {
        color: '#5c6bc0',
        width: 3
      },
      itemStyle: {
        color: '#5c6bc0'
      }
    }
  ]
}));

// 格式化日期
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0];
};

async function loadData() {
  try {
    loading.value = true;
    error.value = null;
    const financialData = await getFinancialData();
    
    const dates = financialData.data.map(item => formatDate(item.timestamp));
    const closeData = financialData.data.map(item => item.close);
    const highData = financialData.data.map(item => item.high);
    const lowData = financialData.data.map(item => item.low);
    
    updateOptions(opts => {
      opts.xAxis.data = dates;
      opts.series[0].data = highData;
      opts.series[1].data = lowData;
      opts.series[2].data = closeData;
      return opts;
    });
  } catch (err) {
    error.value = 'Failed to load stock trend chart data';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

function updateLocale() {
  updateOptions((opts, factory) => {
    const originOpts = factory();
    return opts;
  });
}

onMounted(() => {
  loadData();
});

watch(
  () => appStore.locale,
  () => {
    updateLocale();
  }
);

onUnmounted(() => {
  chartInstance?.dispose();
});
</script>

<template>
  <div class="chart-container">
    <div v-if="loading" class="loading-overlay">
      <n-spin size="large" />
      <span class="loading-text">{{ $t('common.loading') }}</span>
    </div>
    <div v-else-if="error" class="error-overlay">
      <n-alert type="error" :message="error" show-icon />
    </div>
    <div v-else ref="domRef" class="chart" :style="{ height: '350px' }"></div>
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 350px;
}

.chart {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.loading-text {
  margin-top: 16px;
  color: #666;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>
