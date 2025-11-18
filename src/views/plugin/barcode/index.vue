<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMessage } from 'naive-ui';
import JsBarcode from 'jsbarcode';
import type { Options } from 'jsbarcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLoading } from '@sa/hooks';
import SvgIcon from '@/components/custom/svg-icon.vue';

const message = useMessage();

const text = 'Soybean';

interface CodeConfig {
  id: string;
  title: string;
  text: string;
  options: Options;
}

const codes: CodeConfig[] = [
  {
    id: 'code39',
    title: 'CODE 39 正常尺寸',
    text: 'Hello',
    options: { format: 'code39' }
  },
  {
    id: 'code128',
    title: 'CODE 128 正常尺寸',
    text,
    options: {}
  },
  {
    id: 'ean-13',
    title: 'ENA-13 商品条形码',
    text: '1234567890128',
    options: { format: 'ean13' }
  },
  {
    id: 'upc-a',
    title: 'UPC-A 商品条形码',
    text: '123456789012',
    options: { format: 'upc' }
  },
  {
    id: 'barcode',
    title: '不一样的高度，不一样的颜色',
    text: 'Hello',
    options: {
      height: 30,
      lineColor: '#9ca3af'
    }
  },
  {
    id: 'barcode1',
    title: '加个背景色',
    text,
    options: {
      background: '#9ca3af',
      lineColor: '#ffffff'
    }
  },
  {
    id: 'barcode2',
    title: '字体好大',
    text,
    options: {
      fontSize: 40
    }
  },
  {
    id: 'barcode3',
    title: '粗狂的条码，文字离远点',
    text: 'Hi',
    options: {
      textMargin: 30,
      width: 4
    }
  },
  {
    id: 'barcode4',
    title: '字体跑上面来，还是粗体',
    text,
    options: {
      textPosition: 'top',
      fontOptions: 'bold'
    }
  }
];

function generateBarcode() {
  codes.forEach(code => {
    JsBarcode(`#${code.id}`, code.text, code.options);
  });
}

onMounted(() => {
  generateBarcode();
});

// PDF 导出功能
const { loading, startLoading, endLoading } = useLoading(false);

async function exportToPDF() {
  startLoading();
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const colWidth = (pageWidth - margin * 2) / 2;
    let currentY = margin + 20; // 顶部留出标题空间
    const itemHeight = 80; // 为每个条码项预留固定高度，确保排版一致

    // 添加标题
    doc.setFontSize(18);
    doc.text('条形码类型示例', margin, margin + 10);

    // 遍历所有条码
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      const svgElement = document.getElementById(code.id) as SVGElement;

      if (svgElement) {
        // 检查是否需要新页面
        if (currentY + itemHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }

        // 计算位置
        const colIndex = i % 2;
        const x = margin + colIndex * colWidth;
        const y = currentY;
        const width = colWidth - 10;

        // 使用 html2canvas 将条码区域转换为图片
        const canvas = await html2canvas(svgElement, {
          scale: 3, // 放大倍数以提高清晰度
          logging: false
        });

        // 将 canvas 转换为 Data URL
        const dataUrl = canvas.toDataURL('image/png');

        // 添加条码图像
        const imageHeight = (canvas.height / canvas.width) * width;
        doc.addImage(dataUrl, 'PNG', x, y + 10, width, imageHeight);

        // 换行
        if ((i + 1) % 2 === 0) {
          currentY += itemHeight;
        } else if (i + 1 === codes.length) {
          // 最后一行只有一个项
          currentY += itemHeight;
        }
      }
    }

    // 保存 PDF
    doc.save('barcode-examples.pdf');

    message.success('PDF 导出成功');
  } catch (error) {
    console.error('PDF 导出失败:', error);
    message.error('PDF 导出失败');
  } finally {
    endLoading();
  }
}
</script>

<template>
  <div class="overflow-hidden">
    <NCard title="条形码" :bordered="false" class="h-full card-wrapper" content-class="overflow-hidden">
      <div class="mb-4">
        <NButton type="primary" :loading="loading" @click="exportToPDF">导出 PDF</NButton>
      </div>
      <NScrollbar class="h-full">
        <NGrid cols="1 s:2 l:3" :x-gap="12" :y-gap="24" responsive="screen" item-responsive>
          <NGi v-for="item in codes" :key="item.id">
            <div class="flex-col-center">
              <h3>{{ item.title }}</h3>
              <svg :id="item.id" class="h-130px" />
            </div>
          </NGi>
        </NGrid>
      </NScrollbar>
    </NCard>
  </div>
</template>

<style scoped></style>
