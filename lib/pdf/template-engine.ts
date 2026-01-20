export function renderTemplate(template: string, data: any): string {
  let html = template;

  // Handle {{#each array}}...{{/each}} blocks first (before simple replacements)
  html = html.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayKey, content) => {
    const array = data[arrayKey];
    if (!Array.isArray(array) || array.length === 0) {
      return '';
    }
    return array.map((item) => {
      let itemContent = content;
      itemContent = itemContent.replace(/\{\{this\}\}/g, escapeHtml(String(item)));
      return itemContent;
    }).join('');
  });

  // Handle {{#if variable}}...{{/if}} blocks
  html = html.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
    const value = data[key];
    if (value && value !== '' && value !== false && (Array.isArray(value) ? value.length > 0 : true)) {
      return content;
    }
    return '';
  });

  // Simple template replacement
  // Replace {{variable}} with data.variable
  html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    if (value === null || value === undefined || value === '') {
      return '<span class="empty-value">（未記入）</span>';
    }
    if (typeof value === 'boolean') {
      return value ? 'はい' : 'いいえ';
    }
    return escapeHtml(String(value));
  });

  return html;
}

// HTMLエスケープ関数
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
