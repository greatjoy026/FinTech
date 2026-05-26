import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Type,
  Mail,
  Phone,
  Hash,
  Calendar,
  List,
  CheckSquare,
  FileText,
  Upload,
  PenTool,
  Trash2,
  Plus,
  Settings,
  Save,
  Eye,
  Edit2,
  Copy,
  ChevronUp,
  ChevronDown,
  FolderLock,
  Wrench,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// --- Local Type Definitions to keep component self-contained ---
export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'file'
  | 'signature';

export interface FormOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: FormOption[];
}

export interface StoredFormSchema {
  id: string;
  title: string;
  description?: string;
  category: string; // 'Compliance', 'User Survey', 'Merchant KYC', 'General Feedback'
  isActive: boolean;
  allowAnonymous: boolean;
  fields: FormField[];
  updatedAt: string;
}

// --- Field Palette Configuration ---
const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode; category: 'Basic' | 'Advanced' }[] = [
  { type: 'text', label: 'Short Answer', icon: <Type className="h-4 w-4" />, category: 'Basic' },
  { type: 'textarea', label: 'Paragraph Text', icon: <FileText className="h-4 w-4" />, category: 'Basic' },
  { type: 'number', label: 'Numeric Response', icon: <Hash className="h-4 w-4" />, category: 'Basic' },
  { type: 'email', label: 'Email Address', icon: <Mail className="h-4 w-4" />, category: 'Basic' },
  { type: 'phone', label: 'Phone Number', icon: <Phone className="h-4 w-4" />, category: 'Basic' },
  { type: 'date', label: 'Date Selector', icon: <Calendar className="h-4 w-4" />, category: 'Basic' },
  
  { type: 'select', label: 'Single-Choice Select', icon: <List className="h-4 w-4" />, category: 'Advanced' },
  { type: 'multiselect', label: 'Multi-Choice Select', icon: <CheckSquare className="h-4 w-4" />, category: 'Advanced' },
  { type: 'checkbox', label: 'Single Checkbox', icon: <CheckSquare className="h-4 w-4" />, category: 'Advanced' },
  { type: 'file', label: 'Secure File Upload', icon: <Upload className="h-4 w-4" />, category: 'Advanced' },
  { type: 'signature', label: 'Digital Signature', icon: <PenTool className="h-4 w-4" />, category: 'Advanced' },
];

const LOCAL_STORAGE_KEY = 'monivexa_custom_forms';

const INITIAL_TEMPLATES: StoredFormSchema[] = [
  {
    id: 'compliance-audit',
    title: 'Compliance Self-Audit checklist',
    description: 'Quarterly review requirements for Monivexa ecosystem merchant participants.',
    category: 'Compliance',
    isActive: true,
    allowAnonymous: false,
    fields: [
      { id: 'f-1', type: 'text', label: 'Legal Entity Name', required: true, placeholder: 'Enter registered corporate name' },
      { id: 'f-2', type: 'select', label: 'Primary Operating Jurisdiction', required: true, options: [
        { label: 'European Union', value: 'EU' },
        { label: 'North America', value: 'NA' },
        { label: 'Asia Pacific', value: 'APAC' },
        { label: 'Latin America', value: 'LATAM' }
      ] },
      { id: 'f-3', type: 'file', label: 'Secure KYC Certificate Upload', required: true, placeholder: 'Attach PDF / Max 10MB' },
      { id: 'f-4', type: 'checkbox', label: 'I verify all submitted transaction ledgers match reporting rules', required: true }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'merchant-feedback',
    title: 'Ecosystem Experience Survey',
    description: 'Anonymous general experience feedback form for custom wallets and rails.',
    category: 'User Survey',
    isActive: true,
    allowAnonymous: true,
    fields: [
      { id: 'sf-1', type: 'select', label: 'How would you rate transaction dispatch speed?', required: true, options: [
        { label: 'Excellent (< 2s)', value: 'excellent' },
        { label: 'Acceptable', value: 'good' },
        { label: 'Slow', value: 'slow' }
      ] },
      { id: 'sf-2', type: 'textarea', label: 'What features or updates would you like to request next?', required: false, placeholder: 'Tell us your thoughts...' }
    ],
    updatedAt: new Date().toISOString()
  }
];

export const FormBuilder: React.FC = () => {
  // --- States ---
  const [savedForms, setSavedForms] = useState<StoredFormSchema[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('compliance-audit');
  
  // Active Form Details
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Compliance');
  const [isActive, setIsActive] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  
  // Workspace UI details
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState<'build' | 'preview'>('build');
  const [submittingFormResponse, setSubmittingFormResponse] = useState<Record<string, any>>({});
  const [hasTestedResponse, setHasTestedResponse] = useState(false);

  // --- Initialize Lists from Local Storage ---
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSavedForms(parsed);
        if (parsed.length > 0) {
          setSelectedFormId(parsed[0].id);
        }
      } catch (e) {
        setSavedForms(INITIAL_TEMPLATES);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TEMPLATES));
      }
    } else {
      setSavedForms(INITIAL_TEMPLATES);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TEMPLATES));
    }
  }, []);

  // --- Load Selected Form Detail ---
  useEffect(() => {
    const currentForm = savedForms.find(f => f.id === selectedFormId);
    if (currentForm) {
      setFormTitle(currentForm.title);
      setFormDescription(currentForm.description || '');
      setFormCategory(currentForm.category);
      setIsActive(currentForm.isActive);
      setAllowAnonymous(currentForm.allowAnonymous);
      setFields(currentForm.fields);
      setSelectedFieldId(null);
      setSubmittingFormResponse({});
      setHasTestedResponse(false);
    }
  }, [selectedFormId, savedForms]);

  // --- Handlers ---
  const handleAddNewForm = () => {
    const newId = `form-${Date.now()}`;
    const newForm: StoredFormSchema = {
      id: newId,
      title: 'Untitled Custom System Form',
      description: 'Describe the purpose or compliance target of this form here.',
      category: 'General Feedback',
      isActive: true,
      allowAnonymous: false,
      fields: [
        { id: `f-${Date.now()}-1`, type: 'text', label: 'Sample Question', required: true, placeholder: 'Enter response...' }
      ],
      updatedAt: new Date().toISOString()
    };

    const nextList = [...savedForms, newForm];
    setSavedForms(nextList);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
    setSelectedFormId(newId);
    toast.success('Created new blank form template');
  };

  const handleDuplicateForm = () => {
    const currentForm = savedForms.find(f => f.id === selectedFormId);
    if (!currentForm) return;

    const newId = `form-dup-${Date.now()}`;
    const duplicated: StoredFormSchema = {
      ...currentForm,
      id: newId,
      title: `${currentForm.title} (Copy)`,
      updatedAt: new Date().toISOString()
    };

    const nextList = [...savedForms, duplicated];
    setSavedForms(nextList);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextList));
    setSelectedFormId(newId);
    toast.success('Form template duplicated');
  };

  const handleDeleteForm = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    if (savedForms.length <= 1) {
      toast.error('You must keep at least one form schema in the workspace');
      return;
    }
    const filtered = savedForms.filter(f => f.id !== idToDelete);
    setSavedForms(filtered);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    setSelectedFormId(filtered[0].id);
    toast.error('Form schema deleted');
  };

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      label: `What is your response for ${type === 'signature' ? 'Digital Signature' : type}?`,
      required: false,
      placeholder: type === 'select' || type === 'multiselect' ? undefined : 'Type your answer...',
      options: type === 'select' || type === 'multiselect' ? [
        { label: 'Option A', value: 'opt_a' },
        { label: 'Option B', value: 'opt_b' }
      ] : undefined
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
    toast.success(`Appended ${type} field to form`);
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    toast.info('Removed form field');
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const nextFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nextFields.length) return;

    const temp = nextFields[index];
    nextFields[index] = nextFields[targetIndex];
    nextFields[targetIndex] = temp;
    
    setFields(nextFields);
  };

  const handleSaveWorkspaceForm = () => {
    if (!formTitle.trim()) {
      toast.error('Form Title is required');
      return;
    }

    const updatedFormList = savedForms.map(f => {
      if (f.id === selectedFormId) {
        return {
          ...f,
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          isActive,
          allowAnonymous,
          fields,
          updatedAt: new Date().toISOString()
        };
      }
      return f;
    });

    setSavedForms(updatedFormList);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFormList));
    toast.success('Successfully saved form schema changes to workspace config');
  };

  // --- Preview Submit Test ---
  const handleTestSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    for (const f of fields) {
      if (f.required && !submittingFormResponse[f.id]) {
        toast.error(`Please complete the required field: "${f.label}"`);
        return;
      }
    }
    setHasTestedResponse(true);
    toast.success('Form test verification passed! Form data is valid.');
  };

  const selectedFieldObj = fields.find(f => f.id === selectedFieldId);

  return (
    <div className="space-y-6 container mx-auto">
      {/* Top Controls Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-border/60 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-500" /> Custom Form Architect & Dynamic System Builder
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Build and test secure schemas, KYC questions, feedback fields, or compliance widgets dynamically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicateForm} className="gap-2">
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddNewForm} className="gap-2 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <Plus className="w-3.5 h-3.5" /> Start New Form
          </Button>
          <Button size="sm" onClick={handleSaveWorkspaceForm} className="gap-2 bg-primary hover:bg-primary/95">
            <Save className="w-3.5 h-3.5" /> Save Form Schema
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Leftmost Sidebar - Select Schema & Templates */}
        <Card className="xl:col-span-1 shadow-sm border-border/50">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
              <span>ACTIVE TEMPLATES</span>
              <span className="text-xs font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm">
                {savedForms.length} Total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-4">
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto">
              {savedForms.map(form => {
                const isActiveSelect = form.id === selectedFormId;
                return (
                  <button
                    key={form.id}
                    onClick={() => setSelectedFormId(form.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all text-xs group flex items-start gap-2.5 ${
                      isActiveSelect
                        ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-950 font-medium dark:text-emerald-300'
                        : 'bg-card border-border/50 hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileSpreadsheet className={`w-4 h-4 shrink-0 mt-0.5 ${isActiveSelect ? 'text-emerald-500' : 'text-muted-foreground/60'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate block font-semibold text-foreground/90">{form.title}</span>
                        {form.isActive && (
                          <span className="shrink-0 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/80 truncate block mt-0.5">{form.category} • {form.fields.length} Fields</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteForm(e, form.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-all shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                );
              })}
            </div>
            
            <div className="border-t border-border/60 mt-4 pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
                <span>Core Ecosystem Fields</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button 
                  onClick={() => handleAddField('text')}
                  variant="outline" 
                  className="rounded-md py-1.5 h-9 text-xs justify-start px-2.5 font-normal border-dashed"
                >
                  <Type className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> Text Field
                </Button>
                <Button 
                  onClick={() => handleAddField('select')}
                  variant="outline" 
                  className="rounded-md py-1.5 h-9 text-xs justify-start px-2.5 font-normal border-dashed"
                >
                  <List className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> Dropdown
                </Button>
                <Button 
                  onClick={() => handleAddField('number')}
                  variant="outline" 
                  className="rounded-md py-1.5 h-9 text-xs justify-start px-2.5 font-normal border-dashed"
                >
                  <Hash className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> Numeric
                </Button>
                <Button 
                  onClick={() => handleAddField('date')}
                  variant="outline" 
                  className="rounded-md py-1.5 h-9 text-xs justify-start px-2.5 font-normal border-dashed"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> Date Selector
                </Button>
                <Button 
                  onClick={() => handleAddField('checkbox')}
                  variant="outline" 
                  className="rounded-md py-1.5 h-9 text-xs justify-start px-2.5 font-normal border-dashed"
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> Checkbox
                </Button>
                <Button 
                  onClick={() => handleAddField('file')}
                  variant="outline" 
                  className="rounded-md py-1.5 h-9 text-xs justify-start px-2.5 font-normal border-dashed"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> File Upload
                </Button>
                <Button 
                  onClick={() => handleAddField('signature')}
                  variant="outline" 
                  className="rounded-md py-1.5 h-9 text-xs justify-start px-2.5 font-normal border-dashed col-span-2"
                >
                  <PenTool className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> Digital Signature
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center: Builder Canvas & Live Sandbox */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex bg-muted/60 p-1 rounded-lg border border-border/80 w-fit">
            <button
              onClick={() => setActiveWorkspaceMode('build')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeWorkspaceMode === 'build'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" /> Schema Editor
            </button>
            <button
              onClick={() => setActiveWorkspaceMode('preview')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeWorkspaceMode === 'preview'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Preview Form Sandbox
            </button>
          </div>

          {activeWorkspaceMode === 'build' ? (
            <Card className="shadow-sm border-border/60">
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">Workspace Schema Canvas</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">Click fields to modify validation, labels, and behavior settings.</CardDescription>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Draft schema
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 min-h-[350px]">
                {fields.length === 0 ? (
                  <div className="h-48 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <p className="text-sm text-foreground/80 font-semibold">Your custom Form has no fields yet</p>
                    <p className="text-xs text-muted-foreground">Select system elements or inputs from the left side panel to add fields.</p>
                  </div>
                ) : (
                  fields.map((field, index) => {
                    const isSelected = field.id === selectedFieldId;
                    return (
                      <div
                        key={field.id}
                        onClick={() => setSelectedFieldId(field.id)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border relative group ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-500/5 shadow-sm' 
                            : 'border-border/60 bg-card hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded uppercase">
                                {field.type}
                              </span>
                              {field.required && (
                                <span className="text-xs text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/25 dark:text-rose-400 px-1.5 py-0.5 rounded">
                                  Required *
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-semibold text-foreground/90 mt-2">{field.label}</h4>
                            
                            {/* Render Mock Preview of input depending on field type */}
                            {field.type === 'textarea' ? (
                              <textarea
                                disabled
                                placeholder={field.placeholder || "Enter paragraph text response..."}
                                className="mt-2.5 text-xs w-full p-2 bg-muted/30 border border-border/60 rounded-md resize-none h-16 pointer-events-none"
                              />
                            ) : field.type === 'select' || field.type === 'multiselect' ? (
                              <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {(field.options || []).map((opt, i) => (
                                  <span key={i} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                    {opt.label}
                                  </span>
                                ))}
                                {(field.options || []).length === 0 && (
                                  <span className="text-[10px] text-muted-foreground italic">No options configured yet</span>
                                )}
                              </div>
                            ) : field.type === 'checkbox' ? (
                              <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground pointer-events-none">
                                <span className="w-4 h-4 rounded border border-border flex items-center justify-center shrink-0"></span>
                                <span>{field.placeholder || "Select to agree / confirm"}</span>
                              </div>
                            ) : (
                              <Input
                                disabled
                                placeholder={field.placeholder || "Standard system entry placeholder..."}
                                className="mt-2.5 h-8.5 bg-muted/30 text-xs pointer-events-none"
                              />
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveField(index, 'up');
                              }}
                              disabled={index === 0}
                              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-all disabled:opacity-30 disabled:pointer-events-none"
                              title="Move field up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveField(index, 'down');
                              }}
                              disabled={index === fields.length - 1}
                              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-all disabled:opacity-30 disabled:pointer-events-none"
                              title="Move field down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteField(field.id);
                              }}
                              className="p-1 hover:bg-rose-50 hover:text-rose-600 text-muted-foreground/80 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 rounded transition-all"
                              title="Remove field"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          ) : (
            /* PREVIEW MODE SANDBOX */
            <Card className="shadow-sm border-border">
              <CardHeader className="border-b border-border/40 bg-muted/20">
                <CardTitle className="text-base font-bold text-foreground">Preview Form Sandbox</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Test filling this form out. Verify all required states, options, and placeholders function cleanly.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleTestSubmitForm} className="space-y-5">
                  <div className="pb-4 border-b border-border/40">
                    <h3 className="text-lg font-bold text-foreground">{formTitle}</h3>
                    {formDescription && <p className="text-xs text-muted-foreground mt-1">{formDescription}</p>}
                  </div>

                  {fields.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground text-xs italic">
                      There are no fields configured for this form view. Add fields in the build workspace.
                    </div>
                  )}

                  {fields.map(field => (
                    <div key={field.id} className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>
                          {field.label} {field.required && <span className="text-rose-500 font-bold">*</span>}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70 font-mono capitalize">({field.type})</span>
                      </Label>

                      {field.type === 'textarea' ? (
                        <textarea
                          required={field.required}
                          placeholder={field.placeholder || "Enter details here..."}
                          value={submittingFormResponse[field.id] || ''}
                          onChange={(e) => setSubmittingFormResponse({ ...submittingFormResponse, [field.id]: e.target.value })}
                          className="w-full text-xs p-3 border border-border rounded-lg bg-card focus:outline-emerald-500 min-h-[90px]"
                        />
                      ) : field.type === 'select' || field.type === 'multiselect' ? (
                        <select
                          required={field.required}
                          value={submittingFormResponse[field.id] || ''}
                          onChange={(e) => setSubmittingFormResponse({ ...submittingFormResponse, [field.id]: e.target.value })}
                          className="w-full text-xs p-2.5 border border-border rounded-lg bg-card text-foreground"
                        >
                          <option value="">Choose options...</option>
                          {(field.options || []).map((opt, i) => (
                            <option key={i} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'checkbox' ? (
                        <div className="flex items-start gap-2 pt-1">
                          <input
                            type="checkbox"
                            id={`pre-${field.id}`}
                            required={field.required}
                            className="w-4 h-4 rounded border border-border text-emerald-500"
                            checked={!!submittingFormResponse[field.id]}
                            onChange={(e) => setSubmittingFormResponse({ ...submittingFormResponse, [field.id]: e.target.checked })}
                          />
                          <Label htmlFor={`pre-${field.id}`} className="text-xs font-normal text-muted-foreground cursor-pointer pt-0.5">
                            {field.placeholder || 'I accept legal entity declarations'}
                          </Label>
                        </div>
                      ) : field.type === 'signature' ? (
                        <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-2">
                          <Input
                            type="text"
                            required={field.required}
                            value={submittingFormResponse[field.id] || ''}
                            onChange={(e) => setSubmittingFormResponse({ ...submittingFormResponse, [field.id]: e.target.value })}
                            placeholder="Type full legal name as authorized signature"
                            className="text-xs font-serif italic text-emerald-800 dark:text-emerald-400 bg-card border border-dashed border-emerald-500/30"
                          />
                          <p className="text-[10px] text-muted-foreground">Certified Digital ID compliance verified by cryptographic PIN validation.</p>
                        </div>
                      ) : (
                        <Input
                          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                          required={field.required}
                          placeholder={field.placeholder || `Enter response...`}
                          value={submittingFormResponse[field.id] || ''}
                          onChange={(e) => setSubmittingFormResponse({ ...submittingFormResponse, [field.id]: e.target.value })}
                          className="text-xs"
                        />
                      )}
                    </div>
                  ))}

                  {fields.length > 0 && (
                    <div className="pt-4 flex items-center justify-between">
                      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Submit Sandbox Response
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => { setSubmittingFormResponse({}); setHasTestedResponse(false); }}
                        className="text-xs text-muted-foreground"
                      >
                        Reset Mock Form
                      </Button>
                    </div>
                  )}
                </form>

                {hasTestedResponse && (
                  <Card className="mt-6 border-emerald-500/20 bg-emerald-500/5 text-emerald-900 dark:text-emerald-300">
                    <CardContent className="p-4 flex gap-3 text-xs">
                      <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="font-bold">Test Submission Successful</p>
                        <p className="mt-1 font-mono text-[10px] break-all text-muted-foreground">
                          {JSON.stringify(submittingFormResponse)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Settings and Properties Panel */}
        <Card className="xl:col-span-1 shadow-sm border-border/50">
          <CardHeader className="py-4 border-b border-border/40">
            <CardTitle className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase">
              <Settings className="w-4 h-4 text-primary" /> Core Properties
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-5 space-y-5 pb-6">
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-foreground">Form Title</Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1.5 text-xs h-9" />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground">Description</Label>
                <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="mt-1.5 text-xs h-9" />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground">Schema Category</Label>
                <select 
                  value={formCategory} 
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full mt-1.5 text-xs p-2 bg-card border rounded-md text-foreground"
                >
                  <option value="Compliance">Compliance Checklist</option>
                  <option value="User Survey">Ecosystem Survey</option>
                  <option value="Merchant KYC">Merchant Verification</option>
                  <option value="General Feedback">Feedback Form</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-muted/30 border rounded-lg">
                <div>
                  <Label className="text-xs font-semibold text-foreground block">Is Schema Active</Label>
                  <span className="text-[10px] text-muted-foreground">Expose in portal</span>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-muted/30 border rounded-lg">
                <div>
                  <Label className="text-xs font-semibold text-foreground block">Allow Anonymous</Label>
                  <span className="text-[10px] text-muted-foreground">No account required</span>
                </div>
                <Switch checked={allowAnonymous} onCheckedChange={setAllowAnonymous} />
              </div>
            </div>

            {/* Field Options Drawer if field is selected */}
            {selectedFieldObj && (
              <div className="border-t border-border/80 pt-4 space-y-4">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-lg">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 block uppercase">
                    Selected Input Configurations
                  </span>
                  
                  <div className="space-y-3.5 mt-3">
                    <div>
                      <Label className="text-[11px] font-semibold text-foreground">Field Label</Label>
                      <Input
                        value={selectedFieldObj.label}
                        onChange={(e) => handleUpdateField(selectedFieldObj.id, { label: e.target.value })}
                        className="mt-1 h-8 text-xs font-medium"
                      />
                    </div>

                    {selectedFieldObj.type !== 'select' && selectedFieldObj.type !== 'multiselect' && selectedFieldObj.type !== 'checkbox' && (
                      <div>
                        <Label className="text-[11px] font-semibold text-foreground">Input Placeholder Value</Label>
                        <Input
                          value={selectedFieldObj.placeholder || ''}
                          onChange={(e) => handleUpdateField(selectedFieldObj.id, { placeholder: e.target.value })}
                          className="mt-1 h-8 text-xs font-medium text-muted-foreground"
                          placeholder="Ex: Enter text..."
                        />
                      </div>
                    )}

                    {/* Manage Dropdown Options if select type */}
                    {(selectedFieldObj.type === 'select' || selectedFieldObj.type === 'multiselect') && (
                      <div className="space-y-2">
                        <Label className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                          <span>Configure Options</span>
                        </Label>
                        <div className="space-y-1.5">
                          {(selectedFieldObj.options || []).map((opt, idx) => (
                            <div key={idx} className="flex gap-1 items-center">
                              <Input
                                className="h-7 text-[10px] flex-1 px-1.5"
                                value={opt.label}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  const nextOptions = [...(selectedFieldObj.options || [])];
                                  nextOptions[idx] = { label: text, value: text.toLowerCase().replace(/\s+/g, '_') };
                                  handleUpdateField(selectedFieldObj.id, { options: nextOptions });
                                }}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  const filteredOpts = (selectedFieldObj.options || []).filter((_, i) => i !== idx);
                                  handleUpdateField(selectedFieldObj.id, { options: filteredOpts });
                                }}
                                className="h-7 w-7 text-rose-500 p-0 text-center flex items-center justify-center shrink-0 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newOpts = [
                                ...(selectedFieldObj.options || []),
                                { label: `New Option`, value: `new_${Date.now()}` }
                              ];
                              handleUpdateField(selectedFieldObj.id, { options: newOpts });
                            }}
                            className="w-full text-[10px] h-7 bg-card mt-1 shrink-0"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-emerald-500/20">
                      <div>
                        <Label className="text-[11px] font-semibold text-foreground block">Is Field Mandatory</Label>
                        <span className="text-[9px] text-muted-foreground">Flag as required field</span>
                      </div>
                      <Switch
                        checked={selectedFieldObj.required}
                        onCheckedChange={(val) => handleUpdateField(selectedFieldObj.id, { required: val })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
