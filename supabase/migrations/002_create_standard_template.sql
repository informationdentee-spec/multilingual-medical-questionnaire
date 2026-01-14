-- Insert standard template (placeholder - will be updated with actual content)
INSERT INTO form_templates (template_name, questions_json, pdf_html)
VALUES (
  '標準テンプレート',
  '{}'::jsonb,
  '<html><body><h1>標準テンプレート</h1></body></html>'
)
ON CONFLICT DO NOTHING;
