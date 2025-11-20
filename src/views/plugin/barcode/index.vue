<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import JsBarcode from 'jsbarcode';
import type { Options } from 'jsbarcode';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

// 条码类型选项
const barcodeTypes = [
  { label: 'CODE 39', value: 'code39' },
  { label: 'CODE 128', value: 'code128' },
  { label: 'EAN-13', value: 'ean13' },
  { label: 'UPC-A', value: 'upc' }
];

// 字体选项
const fontOptions = [
  { label: '常规', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '斜体', value: 'italic' },
  { label: '粗斜体', value: 'bold italic' }
];

// 导出格式选项
const exportFormats = [
  { label: 'PNG', value: 'png' },
  { label: 'JPG', value: 'jpg' }
];

// 单个条码配置
const barcodeConfig = reactive<{
  text: string;
  type: string;
  style: {
    lineColor: string;
    backgroundColor: string;
    height: number;
    width: number;
  };
  textStyle: {
    fontSize: number;
    fontOptions: string;
    textPosition: 'top' | 'bottom';
    textMargin: number;
  };
}>({
  text: '1234567890128',
  type: 'ean13',
  style: {
    lineColor: '#000000',
    backgroundColor: '#ffffff',
    height: 100,
    width: 2
  },
  textStyle: {
    fontSize: 12,
    fontOptions: 'normal',
    textPosition: 'bottom',
    textMargin: 5
  }
});

// 批量生成配置
const batchConfig = reactive<{
  importedData: Array<{ [key: string]: string | number }>;
  barcodeField: string;
  includeInfo: boolean;
  exportFormat: string;
  useCustomStyle: boolean; // 是否使用自定义样式
  // 为不同条码类型配置不同的样式
  styleByFormat: {
    [key: string]: {
      type: string;
      style: {
        lineColor: string;
        backgroundColor: string;
        height: number;
        width: number;
      };
      textStyle: {
        fontSize: number;
        fontOptions: string;
        textPosition: 'top' | 'bottom';
        textMargin: number;
      };
    };
  };
  // 当前选中的样式配置
  selectedStyleFormat: string;
}>({
  importedData: [],
  barcodeField: '',
  includeInfo: true,
  exportFormat: 'png',
  useCustomStyle: false,
  styleByFormat: {
    code39: {
      type: 'code39',
      style: {
        lineColor: '#000000',
        backgroundColor: '#ffffff',
        height: 100,
        width: 2
      },
      textStyle: {
        fontSize: 12,
        fontOptions: 'normal',
        textPosition: 'bottom',
        textMargin: 5
      }
    },
    code128: {
      type: 'code128',
      style: {
        lineColor: '#000000',
        backgroundColor: '#ffffff',
        height: 100,
        width: 2
      },
      textStyle: {
        fontSize: 12,
        fontOptions: 'normal',
        textPosition: 'bottom',
        textMargin: 5
      }
    },
    ean13: {
      type: 'ean13',
      style: {
        lineColor: '#000000',
        backgroundColor: '#ffffff',
        height: 100,
        width: 2
      },
      textStyle: {
        fontSize: 12,
        fontOptions: 'normal',
        textPosition: 'bottom',
        textMargin: 5
      }
    },
    upc: {
      type: 'upc',
      style: {
        lineColor: '#000000',
        backgroundColor: '#ffffff',
        height: 100,
        width: 2
      },
      textStyle: {
        fontSize: 12,
        fontOptions: 'normal',
        textPosition: 'bottom',
        textMargin: 5
      }
    },
    ean8: {
      type: 'ean8',
      style: {
        lineColor: '#000000',
        backgroundColor: '#ffffff',
        height: 100,
        width: 2
      },
      textStyle: {
        fontSize: 12,
        fontOptions: 'normal',
        textPosition: 'bottom',
        textMargin: 5
      }
    },
    code39: {
      type: 'code39',
      style: {
        lineColor: '#000000',
        backgroundColor: '#ffffff',
        height: 100,
        width: 2
      },
      textStyle: {
        fontSize: 12,
        fontOptions: 'normal',
        textPosition: 'bottom',
        textMargin: 5
      }
    }
  },
  selectedStyleFormat: 'code128'
});

// 预览条码配置（合并配置）
const previewOptions = computed<Options>(() => ({
  format: barcodeConfig.type,
  lineColor: barcodeConfig.style.lineColor,
  background: barcodeConfig.style.backgroundColor,
  height: barcodeConfig.style.height,
  width: barcodeConfig.style.width,
  fontSize: barcodeConfig.textStyle.fontSize,
  fontOptions: barcodeConfig.textStyle.fontOptions,
  textPosition: barcodeConfig.textStyle.textPosition,
  textMargin: barcodeConfig.textStyle.textMargin,
  displayValue: true
}));

// 验证条码数据
function validateBarcodeData(type: string, data: string): boolean {
  switch (type) {
    case 'ean13':
      // EAN-13必须是13位数字
      return /^\d{13}$/.test(data);
    case 'upc':
      // UPC-A必须是12位数字
      return /^\d{12}$/.test(data);
    case 'code39':
      // CODE 39支持数字、大写字母和一些特殊字符
      return /^[0-9A-Z\-\.$\/\+% \*]*$/.test(data);
    case 'code128':
      // CODE 128支持ASCII 0-127
      return /^[\x00-\x7F]*$/.test(data);
    default:
      return true;
  }
}

// 生成单个条码
function generateSingleBarcode() {
  const svgElement = document.getElementById('single-barcode');
  if (svgElement) {
    try {
      // 验证条码数据
      if (!validateBarcodeData(barcodeConfig.type, barcodeConfig.text)) {
        window.$message?.error('条码数据格式错误，请检查输入');
        return;
      }

      JsBarcode(svgElement, barcodeConfig.text, previewOptions.value);
      window.$message?.success('条码生成成功');
    } catch (error) {
      console.error('生成条码失败:', error);
      window.$message?.error('生成条码失败，请检查输入');
    }
  }
}

// 批量导入文件
function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = e => {
    try {
      let workbook;
      if (file.name.endsWith('.csv')) {
        // 处理CSV文件：使用Text方式读取并直接解析，避免编码转换问题
        const text = e.target?.result as string;
        // 使用XLSX解析CSV文本，设置正确的编码
        workbook = XLSX.read(text, { type: 'string', codepage: 65001 });
      } else {
        // Excel文件正常处理
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        workbook = XLSX.read(data, { type: 'array' });
      }
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      batchConfig.importedData = jsonData;
      // 自动选择第一个字符串字段作为条码字段
      const firstStringField = Object.keys(jsonData[0] || {}).find(key => typeof jsonData[0][key] === 'string');
      if (firstStringField) {
        batchConfig.barcodeField = firstStringField;
      }
      window.$message?.success('文件导入成功');
    } catch (error) {
      console.error('导入文件失败:', error);
      window.$message?.error('文件导入失败，请检查文件格式');
    }
  };

  // 根据文件类型选择读取方式
  if (file.name.endsWith('.csv')) {
    reader.readAsText(file, 'utf-8');
  } else {
    reader.readAsArrayBuffer(file);
  }
}

// 文件输入引用
const fileInputRef = ref<HTMLInputElement | null>(null);

// 批量生成的条码数据
const batchBarcodes = ref<Array<{ svg: string; data: any }>>([]);

// 批量生成条码
function generateBatchBarcodes() {
  if (batchConfig.importedData.length === 0) return;
  if (!batchConfig.barcodeField) return;

  // 清空之前的批量条码数据
  batchBarcodes.value = [];

  // 生成所有条码，限制在1000条以内
  batchConfig.importedData.slice(0, 1000).forEach(item => {
    const barcodeValue = String(item[batchConfig.barcodeField]);
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    try {
      // 根据不同条码类型使用相应的配置
      let barcodeType: string;
      // 根据条码值自动检测类型
      if (/^\d{13}$/.test(barcodeValue)) {
        barcodeType = 'ean13';
      } else if (/^\d{12}$/.test(barcodeValue)) {
        barcodeType = 'upc';
      } else if (/^\d{8}$/.test(barcodeValue)) {
        barcodeType = 'ean8';
      } else if (/^[0-9A-Z\-\.\$\/+% \*]*$/.test(barcodeValue)) {
        barcodeType = 'code39';
      } else {
        barcodeType = 'code128';
      }
      // 合并配置
      const options: Options = {
        ...(batchConfig.useCustomStyle
          ? {
              format: barcodeType,
              lineColor: batchConfig.styleByFormat[barcodeType].style.lineColor,
              background: batchConfig.styleByFormat[barcodeType].style.backgroundColor,
              height: batchConfig.styleByFormat[barcodeType].style.height,
              width: batchConfig.styleByFormat[barcodeType].style.width,
              fontSize: batchConfig.styleByFormat[barcodeType].textStyle.fontSize,
              fontOptions: batchConfig.styleByFormat[barcodeType].textStyle.fontOptions,
              textPosition: batchConfig.styleByFormat[barcodeType].textStyle.textPosition,
              textMargin: batchConfig.styleByFormat[barcodeType].textStyle.textMargin,
              displayValue: true
            }
          : {
              format: barcodeType,
              lineColor: '#000000',
              background: '#ffffff',
              height: 100,
              width: 2,
              fontSize: 12,
              fontOptions: 'normal',
              textPosition: 'bottom',
              textMargin: 5,
              displayValue: true
            })
      };

      JsBarcode(svgElement, barcodeValue, options);

      // 将SVG转换为字符串
      const svgString = new XMLSerializer().serializeToString(svgElement);
      batchBarcodes.value.push({ svg: svgString, data: item, format: barcodeType });
    } catch (error) {
      console.error('生成条码失败:', error);
      // 可以添加错误提示
    }
  });
  window.$message?.success('批量条码生成完成');
}

// 批量导出条码
async function exportBatchBarcodes() {
  if (batchConfig.importedData.length === 0) return;
  if (!batchConfig.barcodeField) return;

  // 创建JSZip实例
  const zip = new JSZip();
  const promises: Promise<void>[] = [];

  // 导出所有条码，支持1000条以内
  const exportData = batchConfig.importedData.slice(0, 1000);

  exportData.forEach((item, index) => {
    const barcodeValue = String(item[batchConfig.barcodeField]);
    const promise = new Promise<void>((resolve, reject) => {
      try {
        // 根据不同条码类型使用相应的配置
        let barcodeType: string;
        // 根据条码值自动检测类型
        if (/^\d{13}$/.test(barcodeValue)) {
          barcodeType = 'ean13';
        } else if (/^\d{12}$/.test(barcodeValue)) {
          barcodeType = 'upc';
        } else if (/^\d{8}$/.test(barcodeValue)) {
          barcodeType = 'ean8';
        } else if (/^[0-9A-Z\-\.\$\/+% \*]*$/.test(barcodeValue)) {
          barcodeType = 'code39';
        } else {
          barcodeType = 'code128';
        }
        // 合并配置
        const options: Options = {
          ...(batchConfig.useCustomStyle
            ? {
                format: barcodeType,
                lineColor: batchConfig.styleByFormat[barcodeType].style.lineColor,
                background: batchConfig.styleByFormat[barcodeType].style.backgroundColor,
                height: batchConfig.styleByFormat[barcodeType].style.height,
                width: batchConfig.styleByFormat[barcodeType].style.width,
                fontSize: batchConfig.styleByFormat[barcodeType].textStyle.fontSize,
                fontOptions: batchConfig.styleByFormat[barcodeType].textStyle.fontOptions,
                textPosition: batchConfig.styleByFormat[barcodeType].textStyle.textPosition,
                textMargin: batchConfig.styleByFormat[barcodeType].textStyle.textMargin,
                displayValue: true
              }
            : {
                format: barcodeType,
                lineColor: '#000000',
                background: '#ffffff',
                height: 100,
                width: 2,
                fontSize: 12,
                fontOptions: 'normal',
                textPosition: 'bottom',
                textMargin: 5,
                displayValue: true
              })
        };

        // 创建SVG元素并生成条码
        const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        JsBarcode(tempSvg, barcodeValue, options);

        // 设置SVG尺寸
        const svgRect = tempSvg.getBoundingClientRect();
        const svgWidth = svgRect.width || 300;
        const svgHeight = svgRect.height || 150;
        tempSvg.setAttribute('width', svgWidth.toString());
        tempSvg.setAttribute('height', svgHeight.toString());

        // 将SVG转换为Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve();

        // 计算Canvas高度（如果包含信息需要额外空间）
        let canvasHeight = svgHeight;
        const infoY = svgHeight + 20;
        if (batchConfig.includeInfo) {
          const infoLines = Object.entries(item).length;
          canvasHeight += 20 + infoLines * 20;
        }

        canvas.width = svgWidth;
        canvas.height = canvasHeight;

        // 创建Image对象并绘制到Canvas
        const img = new Image();
        // 处理跨域问题
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // 绘制SVG
          ctx.drawImage(img, 0, 0);

          // 如果需要包含商品信息，添加到Canvas
          if (batchConfig.includeInfo) {
            ctx.fillStyle = '#000000';
            ctx.font = '12px Arial Unicode MS'; // 使用支持中文的字体
            ctx.textAlign = 'center';

            // 绘制商品信息
            Object.entries(item).forEach(([key, value], i) => {
              const y = infoY + i * 20;
              ctx.fillText(`${key}: ${value}`, svgWidth / 2, y);
            });
          }

          // 导出为图片
          const dataURL = canvas.toDataURL(`image/${batchConfig.exportFormat}`);
          const blob = dataURLToBlob(dataURL);
          const fileName = `${barcodeValue}.${batchConfig.exportFormat}`;
          // 添加到zip文件
          zip.file(fileName, blob);
          resolve();
        };
        img.onerror = error => {
          console.error('图片加载失败:', error);
          resolve();
        };

        // 将SVG转换为data URL，确保中文正确编码
        const svgString = new XMLSerializer().serializeToString(tempSvg);
        const encodedSvg = encodeURIComponent(svgString);
        img.src = `data:image/svg+xml;utf-8,${encodedSvg}`;
      } catch (error) {
        console.error('生成条码失败:', error);
        resolve();
      }
    });

    promises.push(promise);
  });

  // 所有图片处理完成后下载zip文件
  Promise.all(promises).then(() => {
    zip.generateAsync({ type: 'blob' }).then(content => {
      saveAs(content, `barcodes_${new Date().getTime()}.zip`);
    });
  });
}

// 将DataURL转换为Blob
function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// 保存配置到本地存储
function saveConfig() {
  localStorage.setItem('barcodeConfig', JSON.stringify(barcodeConfig));
}

// 从本地存储加载配置
function loadConfig() {
  const savedConfig = localStorage.getItem('barcodeConfig');
  if (savedConfig) {
    Object.assign(barcodeConfig, JSON.parse(savedConfig));
  }
}

// 监听配置变化，实时生成条码
watch(
  barcodeConfig,
  () => {
    generateSingleBarcode();
    saveConfig();
  },
  { deep: true }
);

onMounted(() => {
  loadConfig();
  generateSingleBarcode();
});
</script>

<template>
  <div class="overflow-hidden">
    <NCard title="条形码生成器" :bordered="false" class="h-full card-wrapper" content-class="overflow-hidden">
      <NScrollbar class="h-full">
        <div class="space-y-6">
          <!-- 单个条码生成区域 -->
          <div class="rounded bg-gray-50 p-4">
            <h3 class="mb-4 text-lg font-semibold">单个条码生成</h3>
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- 配置区域 -->
              <div class="space-y-4">
                <!-- 条码内容 -->
                <div>
                  <label class="mb-1 block text-sm text-gray-700 font-medium">条码内容</label>
                  <NInput v-model:value="barcodeConfig.text" placeholder="请输入条码内容" class="w-full" />
                </div>

                <!-- 条码类型 -->
                <div>
                  <label class="mb-1 block text-sm text-gray-700 font-medium">条码类型</label>
                  <NSelect v-model:value="barcodeConfig.type" :options="barcodeTypes" class="w-full" />
                </div>

                <!-- 基础样式配置 -->
                <div>
                  <h4 class="mb-2 text-sm text-gray-700 font-semibold">基础样式</h4>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <label class="text-sm text-gray-700">条码颜色</label>
                      <input
                        v-model="barcodeConfig.style.lineColor"
                        type="color"
                        class="h-8 w-12 cursor-pointer rounded"
                      />
                    </div>
                    <div class="flex items-center justify-between">
                      <label class="text-sm text-gray-700">背景颜色</label>
                      <input
                        v-model="barcodeConfig.style.backgroundColor"
                        type="color"
                        class="h-8 w-12 cursor-pointer rounded"
                      />
                    </div>
                    <div>
                      <label class="mb-1 block text-sm text-gray-700">条码高度</label>
                      <NSlider
                        v-model:value="barcodeConfig.style.height"
                        :min="20"
                        :max="200"
                        :step="5"
                        class="w-full"
                      />
                      <span class="text-xs text-gray-500">{{ barcodeConfig.style.height }}px</span>
                    </div>
                  </div>
                </div>

                <!-- 文字样式配置 -->
                <div>
                  <h4 class="mb-2 text-sm text-gray-700 font-semibold">文字样式</h4>
                  <div class="space-y-3">
                    <div>
                      <label class="mb-1 block text-sm text-gray-700">字体大小</label>
                      <NSlider
                        v-model:value="barcodeConfig.textStyle.fontSize"
                        :min="6"
                        :max="40"
                        :step="1"
                        class="w-full"
                      />
                      <span class="text-xs text-gray-500">{{ barcodeConfig.textStyle.fontSize }}px</span>
                    </div>
                    <div>
                      <label class="mb-1 block text-sm text-gray-700">字体样式</label>
                      <NSelect
                        v-model:value="barcodeConfig.textStyle.fontOptions"
                        :options="fontOptions"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="mb-1 block text-sm text-gray-700">文字位置</label>
                      <NRadioGroup v-model:value="barcodeConfig.textStyle.textPosition">
                        <NRadio value="top">上方</NRadio>
                        <NRadio value="bottom">下方</NRadio>
                      </NRadioGroup>
                    </div>
                    <div>
                      <label class="mb-1 block text-sm text-gray-700">文字间距</label>
                      <NSlider
                        v-model:value="barcodeConfig.textStyle.textMargin"
                        :min="0"
                        :max="50"
                        :step="1"
                        class="w-full"
                      />
                      <span class="text-xs text-gray-500">{{ barcodeConfig.textStyle.textMargin }}px</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 预览区域 -->
              <div class="flex flex-col items-center justify-center rounded bg-white p-6 shadow">
                <h4 class="mb-4 text-sm text-gray-700 font-semibold">实时预览</h4>
                <div class="rounded bg-gray-50 p-4">
                  <svg id="single-barcode" class="w-64" />
                </div>
                <div class="mt-4">
                  <NButton type="primary" @click="generateSingleBarcode">重新生成</NButton>
                </div>
              </div>
            </div>
          </div>

          <!-- 批量生成区域 -->
          <div class="rounded bg-gray-50 p-4">
            <h3 class="mb-4 text-lg font-semibold">批量生成</h3>
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm text-gray-700 font-medium">导入文件</label>
                <div class="flex items-center gap-2">
                  <NButton type="primary" @click="fileInputRef?.click()">选择文件</NButton>
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept=".xlsx,.csv"
                    style="display: none"
                    @change="handleFileImport"
                  />
                  <span class="text-sm text-gray-500">支持 Excel (.xlsx) 和 CSV 格式</span>
                </div>
              </div>

              <div v-if="batchConfig.importedData.length > 0">
                <div class="mb-2 flex items-center justify-between">
                  <h4 class="text-sm text-gray-700 font-semibold">导入数据</h4>
                  <span class="text-sm text-gray-500">{{ batchConfig.importedData.length }} 条记录</span>
                </div>

                <div class="mb-3">
                  <label class="mb-1 block text-sm text-gray-700 font-medium">条码字段</label>
                  <NSelect
                    v-model:value="batchConfig.barcodeField"
                    :options="Object.keys(batchConfig.importedData[0] || {}).map(key => ({ label: key, value: key }))"
                    class="w-full"
                  />
                </div>

                <NTable
                  :columns="Object.keys(batchConfig.importedData[0] || {}).map(key => ({ title: key, key }))"
                  :data="batchConfig.importedData.slice(0, 5)"
                  :pagination="false"
                  bordered
                  size="small"
                  class="mb-4"
                />
                <div v-if="batchConfig.importedData.length > 5" class="text-right text-sm text-gray-500">
                  仅显示前 5 条记录
                </div>

                <div class="space-y-3">
                  <!-- 使用自定义样式选项 -->
                  <div class="flex items-center">
                    <NCheckbox v-model:checked="batchConfig.useCustomStyle">使用自定义样式</NCheckbox>
                  </div>

                  <!-- 自定义样式配置 -->
                  <div v-if="batchConfig.useCustomStyle" class="ml-6 space-y-3">
                    <div>
                      <label class="mb-1 block text-sm text-gray-700 font-medium">选择条码类型配置</label>
                      <NSelect v-model:value="batchConfig.selectedStyleFormat" :options="barcodeTypes" class="w-full" />
                    </div>

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium">条码宽度</label>
                        <NSlider
                          v-model:value="batchConfig.styleByFormat[batchConfig.selectedStyleFormat].style.width"
                          :min="1"
                          :max="10"
                          :step="0.5"
                          class="w-full"
                        />
                        <span class="text-xs text-gray-500">
                          {{ batchConfig.styleByFormat[batchConfig.selectedStyleFormat].style.width }}px
                        </span>
                      </div>

                      <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium">条码高度</label>
                        <NSlider
                          v-model:value="batchConfig.styleByFormat[batchConfig.selectedStyleFormat].style.height"
                          :min="20"
                          :max="200"
                          :step="5"
                          class="w-full"
                        />
                        <span class="text-xs text-gray-500">
                          {{ batchConfig.styleByFormat[batchConfig.selectedStyleFormat].style.height }}px
                        </span>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium">字体大小</label>
                        <NSlider
                          v-model:value="batchConfig.styleByFormat[batchConfig.selectedStyleFormat].textStyle.fontSize"
                          :min="6"
                          :max="40"
                          :step="1"
                          class="w-full"
                        />
                        <span class="text-xs text-gray-500">
                          {{ batchConfig.styleByFormat[batchConfig.selectedStyleFormat].textStyle.fontSize }}px
                        </span>
                      </div>

                      <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium">字体样式</label>
                        <NSelect
                          v-model:value="
                            batchConfig.styleByFormat[batchConfig.selectedStyleFormat].textStyle.fontOptions
                          "
                          :options="fontOptions"
                          class="w-full"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium">条码颜色</label>
                        <input
                          v-model="batchConfig.styleByFormat[batchConfig.selectedStyleFormat].style.lineColor"
                          type="color"
                          class="h-8 w-12 cursor-pointer rounded"
                        />
                      </div>

                      <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium">背景颜色</label>
                        <input
                          v-model="batchConfig.styleByFormat[batchConfig.selectedStyleFormat].style.backgroundColor"
                          type="color"
                          class="h-8 w-12 cursor-pointer rounded"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium">字体样式</label>
                        <NSelect
                          v-model:value="
                            batchConfig.styleByFormat[batchConfig.selectedStyleFormat].textStyle.fontOptions
                          "
                          :options="fontOptions"
                          class="w-full"
                        />
                      </div>

                      <div>
                        <label class="mb-1 block text-sm text-gray-700 font-medium">文字位置</label>
                        <NRadioGroup
                          v-model:value="
                            batchConfig.styleByFormat[batchConfig.selectedStyleFormat].textStyle.textPosition
                          "
                        >
                          <NRadio value="top">上方</NRadio>
                          <NRadio value="bottom">下方</NRadio>
                        </NRadioGroup>
                      </div>
                    </div>

                    <div>
                      <label class="mb-1 block text-sm text-gray-700 font-medium">文字间距</label>
                      <NSlider
                        v-model:value="batchConfig.styleByFormat[batchConfig.selectedStyleFormat].textStyle.textMargin"
                        :min="0"
                        :max="50"
                        :step="1"
                        class="w-full"
                      />
                      <span class="text-xs text-gray-500">
                        {{ batchConfig.styleByFormat[batchConfig.selectedStyleFormat].textStyle.textMargin }}px
                      </span>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex items-center gap-4">
                    <NButton type="primary" :disabled="!batchConfig.barcodeField" @click="generateBatchBarcodes">
                      批量生成
                    </NButton>
                    <div class="flex items-center gap-2">
                      <NCheckbox v-model:checked="batchConfig.includeInfo">包含商品信息</NCheckbox>
                      <NSelect
                        v-model:value="batchConfig.exportFormat"
                        :options="exportFormats"
                        :style="{ width: '100px' }"
                      />
                      <NButton type="success" :disabled="!batchConfig.barcodeField" @click="exportBatchBarcodes">
                        导出条码
                      </NButton>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NScrollbar>
    </NCard>
  </div>
</template>

<style scoped>
.h-full {
  height: 100%;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.bg-gray-50 {
  background-color: #f9fafb;
}

.bg-white {
  background-color: #ffffff;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
}

.text-xs {
  font-size: 0.75rem;
}

.font-semibold {
  font-weight: 600;
}

.p-4 {
  padding: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.rounded {
  border-radius: 0.375rem;
}

.shadow {
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-6 {
  gap: 1.5rem;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-4 {
  gap: 1rem;
}

.w-full {
  width: 100%;
}

.w-12 {
  width: 3rem;
}

.w-64 {
  width: 16rem;
}

.h-8 {
  height: 2rem;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
