import puppeteer from 'puppeteer';
import { renderTemplate } from './template-engine';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface PDFGenerationOptions {
  template: string;
  data: any;
}

export async function generatePDF({ template, data }: PDFGenerationOptions): Promise<Buffer> {
  // Render template with data
  const html = renderTemplate(template, data);

  // Launch browser
  // Vercel環境では追加の引数が必要
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Set content with Japanese font support
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Wait for fonts to load
    await page.evaluateHandle(() => document.fonts.ready);

    // Generate PDF with Japanese font support
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
