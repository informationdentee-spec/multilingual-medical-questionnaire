/**
 * Convert a value to its corresponding label from template options
 * @param value - The value to convert
 * @param fieldId - The field ID (e.g., 'symptoms', 'allergy_types')
 * @param questionsJson - The template JSON containing field definitions
 * @param locale - The locale for the label (e.g., 'ja', 'en')
 * @returns The label string, or the original value if not found
 */
export function valueToLabel(
  value: string,
  fieldId: string,
  questionsJson: any,
  locale: string
): string {
  if (!questionsJson || !questionsJson.sections) {
    return value;
  }

  // Find the field in the template
  for (const section of questionsJson.sections) {
    if (!section.fields) continue;
    
    for (const field of section.fields) {
      if (field.id === fieldId && field.options) {
        // Find the option with matching value
        const option = field.options.find((opt: any) => opt.value === value);
        if (option && option.label) {
          // Handle both string and object labels
          if (typeof option.label === 'string') {
            return option.label;
          }
          if (typeof option.label === 'object') {
            return option.label[locale] || option.label['ja'] || value;
          }
        }
      }
    }
  }

  // If not found, return the original value
  return value;
}

/**
 * Convert an array of values to their corresponding labels
 * @param values - Array of values to convert
 * @param fieldId - The field ID (e.g., 'symptoms', 'allergy_types')
 * @param questionsJson - The template JSON containing field definitions
 * @param locale - The locale for the labels (e.g., 'ja', 'en')
 * @returns Array of label strings
 */
export function valuesToLabels(
  values: string[],
  fieldId: string,
  questionsJson: any,
  locale: string
): string[] {
  return values.map((value) => valueToLabel(value, fieldId, questionsJson, locale));
}
