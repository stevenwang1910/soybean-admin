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
    data: ['MACD', 'RSI'],
    top: '0',
    selected: {
      'MACD': true,
      'RSI': true
    }
  },
  grid: [
    {
      left: '3%',
      right: '4%',
      height: '45%',
      top: '15%',
      containLabel: true
    },
    {
      left: '3%',
      right: '4%',
      top: '65%',
      height: '20%',
      containLabel: true
    }
  ],
  xAxis: [
    {
      type: 'category',
      gridIndex: 0,
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
      },
      axisTick: {
        show: false
      }
    },
    {
      type: 'category',
      gridIndex: 1,
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
      },
      axisTick: {
        show: false
      }
    }
  ],
  yAxis: [
    {
      scale: true,
      gridIndex: 0,
      name: 'MACD',
      splitArea: {
        show: true
      },
      axisLine: {
        onZero: false
      }
    },
    {
      scale: true,
      gridIndex: 1,
      name: 'RSI',
      min: 0,
      max: 100,
      splitArea: {
        show: true
      },
      axisLine: {
        onZero: false
      },
      axisLabel: {
        formatter: '{value}%'
      }
    }
  ],
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
      name: 'MACD',
      type: 'bar',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: [],
      itemStyle: {
        color: function(params: any) {
          return params.data >= 0 ? '#ef5350' : '#26a69a';
        }
      }
    },
    {
      name: 'RSI',
      type: 'line',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: [],
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: {
        color: '#ab47bc',
        width: 2
      },
      itemStyle: {
        color: '#ab47bc'
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
    const macdData = financialData.data.map(item => item.macd);
    const rsiData = financialData.data.map(item => item.rsi);
    
    updateOptions(opts => {
      opts.xAxis[0].data = dates;
      opts.xAxis[1].data = dates;
      opts.series[0].data = macdData;
      opts.series[1].data = rsiData;
      return opts;
    });
  } catch (err) {
    error.value = 'Failed to load financial indicators chart data';
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
