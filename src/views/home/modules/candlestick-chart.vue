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
      const data = params[0].data;
      return `
        <div style="padding: 8px;">
          <div>${params[0].axisValue}</div>
          <div style="color: ${data[1] > data[4] ? '#ef5350' : '#26a69a'}">
            Open: ${data[1].toFixed(2)}<br/>
            High: ${data[2].toFixed(2)}<br/>
            Low: ${data[3].toFixed(2)}<br/>
            Close: ${data[4].toFixed(2)}
          </div>
          <div style="margin-top: 5px; color: #666;">
            Volume: ${data[5].toLocaleString()}
          </div>
        </div>`;
    }
  },
  legend: {
    data: ['K线', 'MA5', 'MA10'],
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
    },
    splitLine: {
      show: true
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 70,
      end: 100,
      zoomLock: false
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
      name: 'K线',
      type: 'candlestick',
      data: [],
      itemStyle: {
        color: '#ef5350',
        color0: '#26a69a',
        borderColor: '#ef5350',
        borderColor0: '#26a69a'
      }
    },
    {
      name: 'MA5',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: '#ffa726',
        width: 1
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 167, 38, 0.3)' },
            { offset: 1, color: 'rgba(255, 167, 38, 0.05)' }
          ]
        }
      }
    },
    {
      name: 'MA10',
      type: 'line',
      data: [],
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: '#ab47bc',
        width: 1
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(171, 71, 188, 0.3)' },
            { offset: 1, color: 'rgba(171, 71, 188, 0.05)' }
          ]
        }
      }
    }
  ]
}));

// 格式化K线数据
const formatCandlestickData = (data: FinancialDataItem[]) => {
  return data.map(item => [
    item.open,
    item.close,
    item.low,
    item.high
  ]);
};

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
    const klineData = financialData.data.map(item => [item.open, item.close, item.low, item.high, item.volume]);
    const ma5Data = financialData.data.map(item => item.ma5);
    const ma10Data = financialData.data.map(item => item.ma10);
    
    updateOptions(opts => {
      opts.xAxis.data = dates;
      opts.series[0].data = klineData;
      opts.series[1].data = ma5Data;
      opts.series[2].data = ma10Data;
      return opts;
    });
  } catch (err) {
    error.value = 'Failed to load candlestick chart data';
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
