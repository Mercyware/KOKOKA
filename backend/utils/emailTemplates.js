const fs = require('fs').promises;
const path = require('path');

/**
 * Simple template renderer using {{variable}} syntax
 * @param {string} template - HTML template string
 * @param {Object} data - Data object with variables to replace
 * @returns {string} Rendered template
 */
const renderTemplate = (template, data) => {
  let result = template;

  // Replace simple variables {{variable}}
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key] || '');
  });

  // Handle conditional blocks {{#if variable}}content{{/if}}
  result = result.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, variable, content) => {
    return data[variable] ? content : '';
  });

  return result;
};

/**
 * Load and render an email template
 * @param {string} templateName - Name of the template file (without .html)
 * @param {Object} data - Data object with variables to replace
 * @returns {Promise<{html: string, text: string}>} Rendered HTML and plain text
 */
const loadEmailTemplate = async (templateName, data) => {
  const templatesDir = path.join(__dirname, '../templates/emails');

  try {
    // Load base template
    const basePath = path.join(templatesDir, 'base.html');
    const baseTemplate = await fs.readFile(basePath, 'utf-8');

    // Load content template
    const contentPath = path.join(templatesDir, `${templateName}.html`);
    const contentTemplate = await fs.readFile(contentPath, 'utf-8');

    // Add default data
    const templateData = {
      year: new Date().getFullYear(),
      supportEmail: 'support@kokoka.com',
      ...data
    };

    // Render content
    const renderedContent = renderTemplate(contentTemplate, templateData);

    // Inject content into base template
    const html = renderTemplate(baseTemplate, {
      ...templateData,
      content: renderedContent
    });

    // Generate plain text version (strip HTML tags)
    const text = html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();

    return { html, text };

  } catch (error) {
    console.error(`Error loading email template '${templateName}':`, error);
    throw new Error(`Failed to load email template: ${templateName}`);
  }
};

module.exports = {
  renderTemplate,
  loadEmailTemplate
};
