// PDF template as a string constant
// This file is used instead of reading template.html from filesystem
// because Vercel serverless functions don't have access to the filesystem at runtime

export const PDF_TEMPLATE = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>歯科問診票</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: 'MS Gothic', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .header h1 {
      font-size: 24pt;
      margin: 0;
      font-weight: bold;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 1px solid #333;
      padding-bottom: 5px;
    }
    .field {
      margin-bottom: 8px;
    }
    .field-label {
      font-weight: bold;
      display: inline-block;
      min-width: 120px;
    }
    .field-value {
      display: inline-block;
    }
    .checkbox-list {
      margin-left: 20px;
    }
    .checkbox-item {
      margin-bottom: 5px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10pt;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>歯科問診票</h1>
  </div>

  <div class="section">
    <div class="section-title">基本情報</div>
    <div class="field">
      <span class="field-label">氏名:</span>
      <span class="field-value">{{name}}</span>
    </div>
    <div class="field">
      <span class="field-label">性別:</span>
      <span class="field-value">{{sex}}</span>
    </div>
    <div class="field">
      <span class="field-label">生年月日:</span>
      <span class="field-value">{{birth_year}}年{{birth_month}}月{{birth_day}}日</span>
    </div>
    <div class="field">
      <span class="field-label">電話番号:</span>
      <span class="field-value">{{phone}}</span>
    </div>
    <div class="field">
      <span class="field-label">住所:</span>
      <span class="field-value">{{address}}</span>
    </div>
    <div class="field">
      <span class="field-label">健康保険証:</span>
      <span class="field-value">{{has_insurance}}</span>
    </div>
    <div class="field">
      <span class="field-label">国籍:</span>
      <span class="field-value">{{nationality}}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">症状</div>
    <div class="checkbox-list">
      {{#each symptoms}}
      <div class="checkbox-item">✓ {{this}}</div>
      {{/each}}
    </div>
    {{#if symptom_other}}
    <div class="field">
      <span class="field-label">その他:</span>
      <span class="field-value">{{symptom_other}}</span>
    </div>
    {{/if}}
  </div>

  <div class="section">
    <div class="section-title">アレルギー</div>
    <div class="field">
      <span class="field-label">アレルギー:</span>
      <span class="field-value">{{has_allergy}}</span>
    </div>
    {{#if allergy_types}}
    <div class="checkbox-list">
      {{#each allergy_types}}
      <div class="checkbox-item">✓ {{this}}</div>
      {{/each}}
    </div>
    {{/if}}
    {{#if allergy_other}}
    <div class="field">
      <span class="field-label">その他:</span>
      <span class="field-value">{{allergy_other}}</span>
    </div>
    {{/if}}
  </div>

  <div class="section">
    <div class="section-title">服薬</div>
    <div class="field">
      <span class="field-label">服薬中:</span>
      <span class="field-value">{{is_medicating}}</span>
    </div>
    {{#if medication_detail}}
    <div class="field">
      <span class="field-label">薬の内容:</span>
      <span class="field-value">{{medication_detail}}</span>
    </div>
    {{/if}}
  </div>

  <div class="section">
    <div class="section-title">麻酔・抜歯・妊娠・授乳</div>
    <div class="field">
      <span class="field-label">麻酔でトラブル:</span>
      <span class="field-value">{{anesthesia_trouble}}</span>
    </div>
    <div class="field">
      <span class="field-label">抜歯経験:</span>
      <span class="field-value">{{has_extraction}}</span>
    </div>
    <div class="field">
      <span class="field-label">妊娠中:</span>
      <span class="field-value">{{is_pregnant}}</span>
    </div>
    {{#if pregnancy_months}}
    <div class="field">
      <span class="field-label">妊娠月数:</span>
      <span class="field-value">{{pregnancy_months}}ヶ月</span>
    </div>
    {{/if}}
    <div class="field">
      <span class="field-label">授乳中:</span>
      <span class="field-value">{{is_lactating}}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">既往歴</div>
    {{#if past_diseases}}
    <div class="checkbox-list">
      {{#each past_diseases}}
      <div class="checkbox-item">✓ {{this}}</div>
      {{/each}}
    </div>
    {{/if}}
    {{#if disease_other}}
    <div class="field">
      <span class="field-label">その他:</span>
      <span class="field-value">{{disease_other}}</span>
    </div>
    {{/if}}
    <div class="field">
      <span class="field-label">現在治療中:</span>
      <span class="field-value">{{has_under_treatment}}</span>
    </div>
    {{#if disease_under_treatment_detail}}
    <div class="field">
      <span class="field-label">治療内容:</span>
      <span class="field-value">{{disease_under_treatment_detail}}</span>
    </div>
    {{/if}}
  </div>

  <div class="section">
    <div class="section-title">治療希望</div>
    {{#if treatment_preferences}}
    <div class="checkbox-list">
      {{#each treatment_preferences}}
      <div class="checkbox-item">✓ {{this}}</div>
      {{/each}}
    </div>
    {{/if}}
    {{#if treatment_other}}
    <div class="field">
      <span class="field-label">その他:</span>
      <span class="field-value">{{treatment_other}}</span>
    </div>
    {{/if}}
  </div>

  <div class="section">
    <div class="section-title">通訳</div>
    <div class="field">
      <span class="field-label">通訳を連れてくる:</span>
      <span class="field-value">{{can_bring_interpreter}}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">来院日</div>
    <div class="field">
      <span class="field-label">来院日:</span>
      <span class="field-value">{{visit_year}}年{{visit_month}}月{{visit_day}}日</span>
    </div>
  </div>
</body>
</html>`;
