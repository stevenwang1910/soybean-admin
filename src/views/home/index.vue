<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import HeaderBanner from './modules/header-banner.vue';
import CardData from './modules/card-data.vue';
import LineChart from './modules/line-chart.vue';
import PieChart from './modules/pie-chart.vue';
import ProjectNews from './modules/project-news.vue';
import CreativityBanner from './modules/creativity-banner.vue';
import CandlestickChart from './modules/candlestick-chart.vue';
import StockTrendChart from './modules/stock-trend-chart.vue';
import FinancialIndicatorsChart from './modules/financial-indicators-chart.vue';

const appStore = useAppStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));
</script>

<template>
  <NSpace vertical :size="16">
    <HeaderBanner />
    <CardData />
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:14">
        <NCard :bordered="false" class="card-wrapper">
          <LineChart />
        </NCard>
      </NGi>
      <NGi span="24 s:24 m:10">
        <NCard :bordered="false" class="card-wrapper">
          <PieChart />
        </NCard>
      </NGi>
    </NGrid>
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:14">
        <ProjectNews />
      </NGi>
      <NGi span="24 s:24 m:10">
        <CreativityBanner />
      </NGi>
    </NGrid>
    
    <!-- Financial Charts Section -->
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24">
        <NCard :bordered="false" class="card-wrapper">
          <template #header>
            <div class="card-header">
              <span class="card-title">股票K线图</span>
            </div>
          </template>
          <CandlestickChart />
        </NCard>
      </NGi>
    </NGrid>
    
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:12">
        <NCard :bordered="false" class="card-wrapper">
          <template #header>
            <div class="card-header">
              <span class="card-title">证券走势图</span>
            </div>
          </template>
          <StockTrendChart />
        </NCard>
      </NGi>
      <NGi span="24 s:24 m:12">
        <NCard :bordered="false" class="card-wrapper">
          <template #header>
            <div class="card-header">
              <span class="card-title">金融指标对比</span>
            </div>
          </template>
          <FinancialIndicatorsChart />
        </NCard>
      </NGi>
    </NGrid>
  </NSpace>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
</style>
