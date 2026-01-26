<script setup lang="ts">
import { ref, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Nhập nội dung...'
  },
  minHeight: {
    type: String,
    default: '300px'
  }
})

const emit = defineEmits(['update:modelValue', 'ready'])

const quillRef = ref<InstanceType<typeof QuillEditor> | null>(null)
const content = ref<string>(props.modelValue)

// Toolbar configuration - Full featured like Word
const toolbarOptions = [
  // Heading / Font styles
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ size: ['small', false, 'large', 'huge'] }],

  // Separator
  ['bold', 'italic', 'underline', 'strike'],

  // Scripts
  [{ script: 'sub' }, { script: 'super' }],

  // Colors
  [{ color: [] }, { background: [] }],

  // Alignment
  [{ align: [] }],

  // Lists & Indent
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],

  // Formatting
  ['blockquote', 'code-block'],

  // Links & Media
  ['link', 'image', 'video'],

  // Clear formatting
  ['clean']
]

const editorOptions = {
  theme: 'snow',
  placeholder: props.placeholder,
  modules: {
    toolbar: toolbarOptions
  }
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal !== content.value) {
    content.value = newVal
  }
})

// Watch for internal changes and emit
watch(content, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleReady = (quill: unknown) => {
  emit('ready', quill)
}

// Get Quill instance
const getQuill = () => {
  return quillRef.value?.getQuill()
}

// Insert content at cursor position
const insertContent = (html: string) => {
  const quill = getQuill()
  if (quill) {
    const range = quill.getSelection(true)
    quill.clipboard.dangerouslyPasteHTML(range.index, html)
  }
}

// Insert image at cursor position
const insertImage = (url: string) => {
  const quill = getQuill()
  if (quill) {
    const range = quill.getSelection(true)
    quill.insertEmbed(range.index, 'image', url)
  }
}

// Insert video at cursor position
const insertVideo = (url: string) => {
  const quill = getQuill()
  if (quill) {
    const range = quill.getSelection(true)
    quill.insertEmbed(range.index, 'video', url)
  }
}

// Expose methods for parent component
defineExpose({
  getQuill,
  insertContent,
  insertImage,
  insertVideo
})
</script>

<template>
  <div class="rich-text-editor" :style="{ '--editor-min-height': minHeight }">
    <QuillEditor
      ref="quillRef"
      v-model:content="content"
      content-type="html"
      :options="editorOptions"
      @ready="handleReady"
    />
  </div>
</template>

<style scoped>
.rich-text-editor {
  --editor-min-height: 300px;
}

.rich-text-editor :deep(.ql-container) {
  min-height: var(--editor-min-height);
  font-size: 1rem;
  font-family: inherit;
}

.rich-text-editor :deep(.ql-editor) {
  min-height: var(--editor-min-height);
  line-height: 1.6;
  padding: 1rem;
}

.rich-text-editor :deep(.ql-editor.ql-blank::before) {
  color: var(--text-muted, #9ca3af);
  font-style: normal;
}

/* Toolbar styling */
.rich-text-editor :deep(.ql-toolbar) {
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 0.5rem) var(--radius-md, 0.5rem) 0 0;
  background: var(--bg-secondary, #f9fafb);
  padding: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.rich-text-editor :deep(.ql-toolbar .ql-formats) {
  margin-right: 0.5rem;
}

.rich-text-editor :deep(.ql-toolbar button),
.rich-text-editor :deep(.ql-toolbar .ql-picker-label) {
  border-radius: var(--radius-sm, 0.25rem);
  transition: all 0.15s ease;
}

.rich-text-editor :deep(.ql-toolbar button:hover),
.rich-text-editor :deep(.ql-toolbar .ql-picker-label:hover),
.rich-text-editor :deep(.ql-toolbar button.ql-active),
.rich-text-editor :deep(.ql-toolbar .ql-picker-label.ql-active) {
  background: var(--primary-color, #0ea5e9);
  color: white;
}

.rich-text-editor :deep(.ql-toolbar button:hover .ql-stroke),
.rich-text-editor :deep(.ql-toolbar button.ql-active .ql-stroke),
.rich-text-editor :deep(.ql-toolbar .ql-picker-label:hover .ql-stroke),
.rich-text-editor :deep(.ql-toolbar .ql-picker-label.ql-active .ql-stroke) {
  stroke: white;
}

.rich-text-editor :deep(.ql-toolbar button:hover .ql-fill),
.rich-text-editor :deep(.ql-toolbar button.ql-active .ql-fill),
.rich-text-editor :deep(.ql-toolbar .ql-picker-label:hover .ql-fill),
.rich-text-editor :deep(.ql-toolbar .ql-picker-label.ql-active .ql-fill) {
  fill: white;
}

/* Editor container styling */
.rich-text-editor :deep(.ql-container) {
  border: 1px solid var(--border-color, #e5e7eb);
  border-top: none;
  border-radius: 0 0 var(--radius-md, 0.5rem) var(--radius-md, 0.5rem);
  background: white;
}

/* Content styling */
.rich-text-editor :deep(.ql-editor h1) {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.rich-text-editor :deep(.ql-editor h2) {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.875rem;
}

.rich-text-editor :deep(.ql-editor h3) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.rich-text-editor :deep(.ql-editor h4) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.625rem;
}

.rich-text-editor :deep(.ql-editor p) {
  margin-bottom: 0.75rem;
}

.rich-text-editor :deep(.ql-editor blockquote) {
  border-left: 4px solid var(--primary-color, #0ea5e9);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary, #6b7280);
  font-style: italic;
}

.rich-text-editor :deep(.ql-editor pre) {
  background: var(--bg-secondary, #f3f4f6);
  border-radius: var(--radius-md, 0.5rem);
  padding: 1rem;
  overflow-x: auto;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.875rem;
}

.rich-text-editor :deep(.ql-editor ul),
.rich-text-editor :deep(.ql-editor ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.rich-text-editor :deep(.ql-editor li) {
  margin-bottom: 0.25rem;
}

.rich-text-editor :deep(.ql-editor img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md, 0.5rem);
  margin: 1rem 0;
}

.rich-text-editor :deep(.ql-editor a) {
  color: var(--primary-color, #0ea5e9);
  text-decoration: underline;
}

.rich-text-editor :deep(.ql-editor a:hover) {
  color: var(--primary-hover, #0284c7);
}

/* Snow theme color picker fixes */
.rich-text-editor :deep(.ql-color-picker),
.rich-text-editor :deep(.ql-background) {
  width: auto;
}

.rich-text-editor :deep(.ql-picker-options) {
  background: white;
  border-radius: var(--radius-md, 0.5rem);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .rich-text-editor :deep(.ql-toolbar) {
    padding: 0.5rem;
  }

  .rich-text-editor :deep(.ql-editor) {
    padding: 0.75rem;
  }
}
</style>
