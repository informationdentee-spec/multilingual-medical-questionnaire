// PDF template as a string constant
// This file is used instead of reading template.html from filesystem
// because Vercel serverless functions don't have access to the filesystem at runtime

export const PDF_TEMPLATE = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>歯科問診票</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
  <style>
    /* PDF用に最適化したCSS - 画面用CSSは使用しない */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4 portrait;
      margin: 0;
    }
    
    body {
      font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      margin: 0;
      padding: 0;
      background: #fff;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .container {
      width: 100%;
      max-width: 100%;
      padding: 15mm;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    
    .header h1 {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 20pt;
      font-weight: 700;
      margin: 0;
      padding: 0;
    }
    
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 13pt;
      font-weight: 700;
      background-color: #f5f5f5;
      padding: 8px 12px;
      margin-bottom: 12px;
      border-left: 4px solid #333;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 10pt;
    }
    
    .data-table td {
      padding: 8px 12px;
      border: 1px solid #ddd;
      vertical-align: top;
    }
    
    .data-table td:first-child {
      width: 140px;
      background-color: #f9f9f9;
      font-weight: 700;
      white-space: nowrap;
    }
    
    .data-table td:last-child {
      background-color: #fff;
    }
    
    .checkbox-list {
      margin: 8px 0;
    }
    
    .checkbox-item {
      margin: 4px 0;
      padding: 4px 0;
      font-family: 'Courier New', 'MS Gothic', monospace;
      font-size: 10pt;
      line-height: 1.5;
    }
    
    .checkbox-item .checkbox-mark {
      font-family: 'Courier New', 'MS Gothic', monospace;
      display: inline-block;
      width: 1.2em;
      text-align: center;
    }
    
    .empty-value {
      color: #999;
      font-style: italic;
    }
    
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 9pt;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }
    
    /* 印刷時の最適化 */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      .section-title {
        background-color: #f5f5f5 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>歯科問診票</h1>
    </div>

    <div class="section">
      <div class="section-title">基本情報</div>
      <table class="data-table">
        <tr>
          <td>氏名</td>
          <td>{{name}}</td>
        </tr>
        <tr>
          <td>性別</td>
          <td>{{sex}}</td>
        </tr>
        <tr>
          <td>生年月日</td>
          <td>{{birth_date}}</td>
        </tr>
        <tr>
          <td>電話番号</td>
          <td>{{phone}}</td>
        </tr>
        <tr>
          <td>住所</td>
          <td>{{address}}</td>
        </tr>
        <tr>
          <td>健康保険証</td>
          <td>{{has_insurance}}</td>
        </tr>
        <tr>
          <td>国籍</td>
          <td>{{nationality}}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">症状</div>
      {{#if symptoms}}
      <div class="checkbox-list">
        {{#each symptoms}}
        <div class="checkbox-item">
          <span class="checkbox-mark">■</span> {{this}}
        </div>
        {{/each}}
      </div>
      {{/if}}
      {{#if symptom_other}}
      <table class="data-table">
        <tr>
          <td>その他</td>
          <td>{{symptom_other}}</td>
        </tr>
      </table>
      {{/if}}
    </div>

    <div class="section">
      <div class="section-title">アレルギー</div>
      <table class="data-table">
        <tr>
          <td>アレルギー</td>
          <td>{{has_allergy}}</td>
        </tr>
        {{#if allergy_types}}
        <tr>
          <td>アレルギー種類</td>
          <td>
            <div class="checkbox-list">
              {{#each allergy_types}}
              <div class="checkbox-item">
                <span class="checkbox-mark">■</span> {{this}}
              </div>
              {{/each}}
            </div>
          </td>
        </tr>
        {{/if}}
        {{#if allergy_other}}
        <tr>
          <td>その他</td>
          <td>{{allergy_other}}</td>
        </tr>
        {{/if}}
      </table>
    </div>

    <div class="section">
      <div class="section-title">服薬</div>
      <table class="data-table">
        <tr>
          <td>服薬中</td>
          <td>{{is_medicating}}</td>
        </tr>
        {{#if medication_detail}}
        <tr>
          <td>薬の内容</td>
          <td>{{medication_detail}}</td>
        </tr>
        {{/if}}
      </table>
    </div>

    <div class="section">
      <div class="section-title">麻酔・抜歯・妊娠・授乳</div>
      <table class="data-table">
        <tr>
          <td>麻酔でトラブル</td>
          <td>{{anesthesia_trouble}}</td>
        </tr>
        <tr>
          <td>抜歯経験</td>
          <td>{{has_extraction}}</td>
        </tr>
        <tr>
          <td>妊娠中</td>
          <td>{{is_pregnant}}</td>
        </tr>
        {{#if pregnancy_months}}
        <tr>
          <td>妊娠月数</td>
          <td>{{pregnancy_months}}ヶ月</td>
        </tr>
        {{/if}}
        <tr>
          <td>授乳中</td>
          <td>{{is_lactating}}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">既往歴</div>
      {{#if past_diseases}}
      <div class="checkbox-list">
        {{#each past_diseases}}
        <div class="checkbox-item">
          <span class="checkbox-mark">■</span> {{this}}
        </div>
        {{/each}}
      </div>
      {{/if}}
      {{#if disease_other}}
      <table class="data-table">
        <tr>
          <td>その他</td>
          <td>{{disease_other}}</td>
        </tr>
      </table>
      {{/if}}
      <table class="data-table">
        <tr>
          <td>現在治療中</td>
          <td>{{has_under_treatment}}</td>
        </tr>
        {{#if disease_under_treatment_detail}}
        <tr>
          <td>治療内容</td>
          <td>{{disease_under_treatment_detail}}</td>
        </tr>
        {{/if}}
      </table>
    </div>

    <div class="section">
      <div class="section-title">治療希望</div>
      {{#if treatment_preferences}}
      <div class="checkbox-list">
        {{#each treatment_preferences}}
        <div class="checkbox-item">
          <span class="checkbox-mark">■</span> {{this}}
        </div>
        {{/each}}
      </div>
      {{/if}}
      {{#if treatment_other}}
      <table class="data-table">
        <tr>
          <td>その他</td>
          <td>{{treatment_other}}</td>
        </tr>
      </table>
      {{/if}}
    </div>

    <div class="section">
      <div class="section-title">通訳</div>
      <table class="data-table">
        <tr>
          <td>通訳を連れてくる</td>
          <td>{{can_bring_interpreter}}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">来院日</div>
      <table class="data-table">
        <tr>
          <td>来院日</td>
          <td>{{visit_date}}</td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>`;
