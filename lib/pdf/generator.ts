import puppeteer from 'puppeteer';
import { renderTemplate } from './template-engine';

export interface PDFGenerationOptions {
  template: string;
  data: any;
}

export async function generatePDF({ template, data }: PDFGenerationOptions): Promise<Buffer> {
  console.log('[PDF Generator] Starting PDF generation...');
  
  // Step 1: Render template with data
  console.log('[PDF Generator] Step 1: Rendering template...');
  let html: string;
  try {
    html = renderTemplate(template, data);
    console.log('[PDF Generator] Template rendered, HTML length:', html.length);
  } catch (renderError) {
    console.error('[PDF Generator] Error rendering template:', renderError);
    throw new Error(`Template rendering failed: ${renderError instanceof Error ? renderError.message : 'Unknown error'}`);
  }

  // Step 2: Launch browser
  // Vercel環境では追加の引数が必要
  console.log('[PDF Generator] Step 2: Launching Puppeteer browser...');
  let browser;
  try {
    browser = await puppeteer.launch({
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
    console.log('[PDF Generator] Browser launched successfully');
  } catch (launchError) {
    console.error('[PDF Generator] Error launching browser:', launchError);
    throw new Error(`Browser launch failed: ${launchError instanceof Error ? launchError.message : 'Unknown error'}`);
  }

  try {
    // Step 3: Create new page
    console.log('[PDF Generator] Step 3: Creating new page...');
    const page = await browser.newPage();
    console.log('[PDF Generator] Page created');
    
    // Step 4: Set content with Japanese font support
    console.log('[PDF Generator] Step 4: Setting page content...');
    try {
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000, // 30 seconds timeout
      });
      console.log('[PDF Generator] Page content set');
    } catch (contentError) {
      console.error('[PDF Generator] Error setting page content:', contentError);
      throw new Error(`Failed to set page content: ${contentError instanceof Error ? contentError.message : 'Unknown error'}`);
    }

    // Step 5: Wait for fonts to load
    console.log('[PDF Generator] Step 5: Waiting for fonts to load...');
    try {
      await page.evaluateHandle(() => document.fonts.ready);
      console.log('[PDF Generator] Fonts loaded');
    } catch (fontError) {
      console.warn('[PDF Generator] Warning: Font loading may have failed (continuing anyway):', fontError);
    }

    // Step 6: Generate PDF with Japanese font support
    console.log('[PDF Generator] Step 6: Generating PDF...');
    let pdf: Buffer;
    try {
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        printBackground: true,
        preferCSSPageSize: true,
        timeout: 30000, // 30 seconds timeout
      });
      pdf = Buffer.from(pdfBuffer);
      console.log('[PDF Generator] PDF generated successfully, size:', pdf.length, 'bytes');
    } catch (pdfError) {
      console.error('[PDF Generator] Error generating PDF:', pdfError);
      throw new Error(`PDF generation failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
    }

    return pdf;
  } catch (error) {
    console.error('[PDF Generator] Error during PDF generation:', error);
    throw error;
  } finally {
    // Step 7: Close browser
    console.log('[PDF Generator] Step 7: Closing browser...');
    try {
      await browser.close();
      console.log('[PDF Generator] Browser closed');
    } catch (closeError) {
      console.error('[PDF Generator] Error closing browser:', closeError);
      // Don't throw - browser might already be closed
    }
  }
}
