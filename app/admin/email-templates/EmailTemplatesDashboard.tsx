'use client';

/**
 * Email Templates Dashboard
 *
 * Client component for managing email templates with editing and preview.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  EnvelopeSimple,
  Eye,
  FloppyDisk,
  ArrowCounterClockwise,
  Check,
  X,
  CaretDown,
  Code,
  TextT,
  Image,
} from '@phosphor-icons/react';
import html2canvas from 'html2canvas';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface EmailTemplate {
  id: number;
  slug: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  availableVariables?: string[];
  hasDefault?: boolean;
  isDefault?: boolean;
}

interface TemplateResponse {
  template: EmailTemplate;
  defaultTemplate: {
    name: string;
    subject: string;
    html_body: string;
    text_body: string;
  };
  availableVariables: string[];
}

interface PreviewResponse {
  preview: {
    subject: string;
    html: string;
    text: string;
  };
  sampleData: Record<string, string>;
}

type EditorTab = 'html' | 'text';

export default function EmailTemplatesDashboard() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<TemplateResponse | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<Partial<EmailTemplate>>({});
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Fetch templates list
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/email-templates');
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
        // Auto-select first template if none selected
        if (!selectedSlug && data.templates.length > 0) {
          setSelectedSlug(data.templates[0].slug);
        }
      }
    } catch {
      setMessage({ type: 'error', text: t('templatesLoadFailed') });
    } finally {
      setLoading(false);
    }
  }, [selectedSlug, t]);

  // Fetch single template details
  const fetchTemplate = useCallback(async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/email-templates/${slug}`);
      const data: TemplateResponse = await res.json();
      setTemplateData(data);
      setEditedTemplate({
        name: data.template.name,
        subject: data.template.subject,
        html_body: data.template.html_body,
        text_body: data.template.text_body,
        is_active: data.template.is_active,
      });
      setHasChanges(false);
    } catch {
      setMessage({ type: 'error', text: t('templatesLoadFailed') });
    }
  }, [t]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (selectedSlug) {
      fetchTemplate(selectedSlug);
      setShowPreview(false);
      setPreview(null);
    }
  }, [selectedSlug, fetchTemplate]);

  // Handle input changes
  const handleChange = (field: keyof EmailTemplate, value: string | boolean) => {
    setEditedTemplate((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Save template
  const handleSave = async () => {
    if (!selectedSlug) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${selectedSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedTemplate),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('templateSaved') });
        setHasChanges(false);
        fetchTemplates();
        fetchTemplate(selectedSlug);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || t('templateSaveFailed') });
      }
    } catch {
      setMessage({ type: 'error', text: t('templateSaveFailed') });
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!selectedSlug || !confirm('Reset this template to its default content? This cannot be undone.')) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${selectedSlug}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: t('templateSaved') });
        fetchTemplate(selectedSlug);
        fetchTemplates();
      } else {
        setMessage({ type: 'error', text: t('templateSaveFailed') });
      }
    } catch {
      setMessage({ type: 'error', text: t('templateSaveFailed') });
    } finally {
      setSaving(false);
    }
  };

  // Generate preview
  const handlePreview = async () => {
    if (!selectedSlug) return;

    try {
      const res = await fetch(`/api/admin/email-templates/${selectedSlug}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html_body: editedTemplate.html_body,
          text_body: editedTemplate.text_body,
          subject: editedTemplate.subject,
        }),
      });

      if (res.ok) {
        const data: PreviewResponse = await res.json();
        setPreview(data);
        setShowPreview(true);
      }
    } catch {
      setMessage({ type: 'error', text: t('templateSaveFailed') });
    }
  };

  // Generate and download PNG
  const handleDownloadPng = async () => {
    if (!preview || !selectedSlug) return;

    setGeneratingImage(true);
    try {
      // Create a temporary container to render the HTML
      const container = document.createElement('div');
      container.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 680px; background: white;';
      container.innerHTML = preview.preview.html;
      document.body.appendChild(container);

      // Wait for images to load
      const images = container.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve(null);
              } else {
                img.onload = () => resolve(null);
                img.onerror = () => resolve(null);
              }
            })
        )
      );

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 680,
        windowWidth: 680,
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Convert canvas to PNG and download
      const imgData = canvas.toDataURL('image/png');

      // Generate filename with template slug and date
      const date = new Date().toISOString().split('T')[0];
      const filename = `email-template-${selectedSlug}-${date}.png`;

      // Create download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = imgData;
      link.click();

      setMessage({ type: 'success', text: 'PNG letöltve' });
    } catch (error) {
      console.error('PNG generation error:', error);
      setMessage({ type: 'error', text: 'PNG generálás sikertelen' });
    } finally {
      setGeneratingImage(false);
    }
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800'
              : 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check size={20} weight="bold" />
          ) : (
            <X size={20} weight="bold" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template selector sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">{t('emailTemplates')}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {templates.map((template) => (
                <button
                  key={template.slug}
                  onClick={() => setSelectedSlug(template.slug)}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                    selectedSlug === template.slug
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <EnvelopeSimple
                    size={20}
                    weight={selectedSlug === template.slug ? 'fill' : 'regular'}
                    className={
                      selectedSlug === template.slug ? 'text-blue-600' : 'text-gray-400'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        selectedSlug === template.slug ? 'text-blue-900' : 'text-gray-900'
                      }`}
                    >
                      {template.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{template.slug}</p>
                  </div>
                  {template.is_active ? (
                    <span className="w-2 h-2 rounded-full bg-green-500" title="Active" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-gray-300" title="Inactive" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Variables reference */}
          {templateData && (
            <div className="mt-4 bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">{t('availableVariables')}</h3>
              </div>
              <div className="p-4 space-y-2">
                {templateData.availableVariables.map((variable) => (
                  <div
                    key={variable}
                    className="flex items-center gap-2 text-sm"
                  >
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-blue-700">
                      {`{{${variable}}}`}
                    </code>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-3">
                  Use <code className="bg-gray-100 px-1 rounded">{`{{#if var}}...{{/if}}`}</code> for conditionals
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Editor area */}
        <div className="lg:col-span-3 space-y-4">
          {templateData ? (
            <>
              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreview}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Eye size={18} />
                    {t('preview')}
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ArrowCounterClockwise size={18} />
                    Reset to Default
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FloppyDisk size={18} />
                  {saving ? t('saving') : t('save')}
                </button>
              </div>

              {/* Template name and subject */}
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={editedTemplate.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editedTemplate.is_active ?? true}
                        onChange={(e) => handleChange('is_active', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Template Active</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('subject')}
                  </label>
                  <input
                    type="text"
                    value={editedTemplate.subject || ''}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Subject line (supports {{variables}})"
                  />
                </div>
              </div>

              {/* Content editor tabs */}
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('html')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'html'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Code size={18} />
                      {t('htmlBody')}
                    </button>
                    <button
                      onClick={() => setActiveTab('text')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'text'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <TextT size={18} />
                      {t('textBody')}
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {activeTab === 'html' ? (
                    <textarea
                      value={editedTemplate.html_body || ''}
                      onChange={(e) => handleChange('html_body', e.target.value)}
                      className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                      placeholder="HTML email content..."
                    />
                  ) : (
                    <textarea
                      value={editedTemplate.text_body || ''}
                      onChange={(e) => handleChange('text_body', e.target.value)}
                      className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                      placeholder="Plain text email content..."
                    />
                  )}
                </div>
              </div>

              {/* Preview modal */}
              {showPreview && preview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{t('preview')}</h3>
                        <p className="text-sm text-gray-500">{t('subject')}: {preview.preview.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDownloadPng}
                          disabled={generatingImage}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Letöltés PNG-ként"
                        >
                          <Image size={20} weight="fill" />
                          {generatingImage ? 'Generálás...' : 'PNG'}
                        </button>
                        <button
                          onClick={() => setShowPreview(false)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <iframe
                          srcDoc={preview.preview.html}
                          className="w-full h-[600px] bg-white"
                          title="Email Preview"
                        />
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Data Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(preview.sampleData).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                            >
                              <span className="font-medium text-gray-700">{key}:</span>{' '}
                              <span className="text-gray-500">
                                {value.length > 30 ? value.substring(0, 30) + '...' : value}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <EnvelopeSimple size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Select a template to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
