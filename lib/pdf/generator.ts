import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { renderTemplate } from './template-engine';

export interface PDFGenerationOptions {
  template: string;
  data: any;
}

/**
 * Get Chrome executable path for Vercel serverless environment
 * Vercel環境では、@sparticuz/chromiumを使用してChromeバイナリのパスを取得します
 */
async function getChromeExecutablePath(): Promise<string | undefined> {
  console.log('[PDF Generator] getChromeExecutablePath: Checking environment...', {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
  });

  // Vercel環境では、@sparticuz/chromium-minを使用
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  if (isVercel || isLambda) {
    console.log('[PDF Generator] Detected serverless environment, using @sparticuz/chromium');
    try {
      // @sparticuz/chromiumのexecutablePathを取得
      // Vercel環境では、chromium.executablePath()が/var/task/.next/server/binを探そうとするが、
      // そのディレクトリが存在しないため、直接パスを構築する必要がある
      let executablePath: string;
      
      // 環境変数でリモートURLが指定されている場合はそれを使用
      if (process.env.CHROMIUM_REMOTE_EXEC_PATH) {
        console.log('[PDF Generator] Using remote chromium URL:', process.env.CHROMIUM_REMOTE_EXEC_PATH);
        executablePath = await chromium.executablePath(process.env.CHROMIUM_REMOTE_EXEC_PATH);
      } else {
        // Vercel環境では、chromium.executablePath()を呼び出すと
        // /var/task/.next/server/binを探そうとするが、そのディレクトリが存在しない
        // そのため、node_modules内のバイナリを直接参照する
        const fs = require('fs');
        const path = require('path');
        
        // まず、chromium.executablePath()を試す（エラーが発生する可能性がある）
        try {
          console.log('[PDF Generator] Trying chromium.executablePath()...');
          executablePath = await chromium.executablePath();
          console.log('[PDF Generator] chromium.executablePath() returned:', executablePath);
          
          // パスが存在するか確認
          if (executablePath && fs.existsSync(executablePath)) {
            console.log('[PDF Generator] chromium.executablePath() path exists');
            return executablePath;
          } else {
            console.log('[PDF Generator] chromium.executablePath() path does not exist, trying fallback...');
          }
        } catch (execPathError) {
          console.log('[PDF Generator] chromium.executablePath() failed, trying fallback:', execPathError instanceof Error ? execPathError.message : 'Unknown error');
        }
        
        // フォールバック: 直接パスを構築
        const possiblePaths = [
          path.join('/var/task', 'node_modules', '@sparticuz', 'chromium', 'bin', 'chromium'),
          path.join(process.cwd(), 'node_modules', '@sparticuz', 'chromium', 'bin', 'chromium'),
        ];
        
        for (const possiblePath of possiblePaths) {
          console.log('[PDF Generator] Checking path:', possiblePath);
          try {
            if (fs.existsSync(possiblePath)) {
              console.log('[PDF Generator] Found chromium at:', possiblePath);
              executablePath = possiblePath;
              break;
            }
          } catch (checkError) {
            console.log('[PDF Generator] Path check failed:', checkError);
          }
        }
        
        if (!executablePath) {
          throw new Error('Chromium executable not found in any expected location');
        }
      }
      
      if (!executablePath) {
        throw new Error('chromium.executablePath() returned empty value');
      }
      
      console.log('[PDF Generator] Successfully got chromium executable path:', executablePath);
      return executablePath;
    } catch (error) {
      console.error('[PDF Generator] Failed to get chromium executable path:', error);
      console.error('[PDF Generator] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
  
  // ローカル環境や環境変数で指定されている場合はそれを使用
  if (process.env.CHROME_EXECUTABLE_PATH) {
    console.log('[PDF Generator] Using CHROME_EXECUTABLE_PATH from environment:', process.env.CHROME_EXECUTABLE_PATH);
    return process.env.CHROME_EXECUTABLE_PATH;
  }
  
  // デフォルトではundefined（puppeteer-coreが自動的に見つける）
  console.log('[PDF Generator] No custom Chrome path, using default Puppeteer Chrome');
  return undefined;
}

export async function generatePDF({ template, data }: PDFGenerationOptions): Promise<Buffer> {
  console.log('[PDF Generator] Starting PDF generation...');
  console.log('[PDF Generator] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
  });
  
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

  // Step 2: Get Chrome executable path
  console.log('[PDF Generator] Step 2: Getting Chrome executable path...');
  const chromeExecutablePath = await getChromeExecutablePath();

  // Step 3: Launch browser
  // Vercel環境では追加の引数が必要
  console.log('[PDF Generator] Step 3: Launching Puppeteer browser...');
  console.log('[PDF Generator] Chrome executable path:', chromeExecutablePath || 'not set (using default)');
  
  let browser;
  try {
    // Vercel環境では@sparticuz/chromium-minのargsを使用、それ以外ではデフォルトのargsを使用
    const defaultArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
    ];

    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    // Vercel/Lambda環境では@sparticuz/chromium-minの設定を使用
    const launchOptions: any = {
      headless: (isVercel || isLambda) ? chromium.headless : true,
      args: (isVercel || isLambda) 
        ? [...(chromium.args || []), '--no-sandbox', '--disable-setuid-sandbox']
        : defaultArgs,
    };

    // Chromeのパスが指定されている場合は使用（Vercel/Lambda環境では必須）
    if (chromeExecutablePath) {
      launchOptions.executablePath = chromeExecutablePath;
      console.log('[PDF Generator] Using Chrome executable path:', chromeExecutablePath);
    } else if (isVercel || isLambda) {
      // Vercel/Lambda環境ではChromeパスが必須
      console.error('[PDF Generator] ERROR: Chrome executable path is required in serverless environment but not found!');
      throw new Error('Chrome executable path is required in serverless environment. Please ensure @sparticuz/chromium-min is properly installed.');
    } else {
      console.log('[PDF Generator] Using default Puppeteer Chrome (local development)');
    }

    // defaultViewportも設定（利用可能な場合）
    if ((isVercel || isLambda) && chromium.defaultViewport) {
      launchOptions.defaultViewport = chromium.defaultViewport;
      console.log('[PDF Generator] Using chromium.defaultViewport');
    }

    console.log('[PDF Generator] Launch options:', {
      headless: launchOptions.headless,
      executablePath: launchOptions.executablePath ? 'set' : 'not set',
      argsCount: launchOptions.args?.length || 0,
      defaultViewport: launchOptions.defaultViewport ? 'set' : 'not set',
    });

    browser = await puppeteer.launch(launchOptions);
    console.log('[PDF Generator] Browser launched successfully');
  } catch (launchError) {
    console.error('[PDF Generator] Error launching browser:', launchError);
    console.error('[PDF Generator] Launch error details:', {
      message: launchError instanceof Error ? launchError.message : 'Unknown error',
      stack: launchError instanceof Error ? launchError.stack : undefined,
      chromeExecutablePath: chromeExecutablePath || 'NOT SET',
      isVercel: process.env.VERCEL === '1' || !!process.env.VERCEL_ENV,
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
    });
    throw new Error(`Browser launch failed: ${launchError instanceof Error ? launchError.message : 'Unknown error'}`);
  }

  try {
    // Step 4: Create new page
    console.log('[PDF Generator] Step 4: Creating new page...');
    const page = await browser.newPage();
    console.log('[PDF Generator] Page created');
    
    // Step 5: Set content with Japanese font support
    console.log('[PDF Generator] Step 5: Setting page content...');
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

    // Step 6: Wait for fonts to load
    console.log('[PDF Generator] Step 6: Waiting for fonts to load...');
    try {
      await page.evaluateHandle(() => document.fonts.ready);
      console.log('[PDF Generator] Fonts loaded');
    } catch (fontError) {
      console.warn('[PDF Generator] Warning: Font loading may have failed (continuing anyway):', fontError);
    }

    // Step 7: Generate PDF with Japanese font support
    console.log('[PDF Generator] Step 7: Generating PDF...');
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
    // Step 8: Close browser
    console.log('[PDF Generator] Step 8: Closing browser...');
    try {
      await browser.close();
      console.log('[PDF Generator] Browser closed');
    } catch (closeError) {
      console.error('[PDF Generator] Error closing browser:', closeError);
      // Don't throw - browser might already be closed
    }
  }
}
