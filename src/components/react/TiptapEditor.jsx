import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading1, Heading2, Heading3,
  Quote, Code, Minus, Undo, Redo, Eraser, Link2,
  Pilcrow
} from 'lucide-react';

export default function TiptapEditor({ content = '', onChange, placeholder = 'Write a detailed product description...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-600 underline font-medium hover:text-brand-800',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[160px] p-3.5 text-xs text-slate-800 font-normal leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html === '<p></p>' ? '' : html);
      }
    },
  });

  // Sync external content changes if necessary
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (!editor.isFocused) {
        editor.commands.setContent(content || '', false);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
        Loading editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-all">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-50/90 border-b border-slate-200 select-none">
        {/* Paragraph & Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1 ${
            editor.isActive('paragraph') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Normal Text (Paragraph)"
        >
          <Pilcrow className="w-3.5 h-3.5" />
          <span>P</span>
        </button>

        {[1, 2, 3, 4, 5, 6].map(level => (
          <button
            key={level}
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-200 transition-colors ${
              editor.isActive('heading', { level }) ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm font-extrabold' : ''
            }`}
            title={`Heading ${level} (H${level})`}
          >
            H{level}
          </button>
        ))}

        <div className="w-[1px] h-4 bg-slate-300 mx-1 self-center" />

        {/* Text Formats */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ${
            editor.isActive('bold') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ${
            editor.isActive('italic') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ${
            editor.isActive('underline') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ${
            editor.isActive('strike') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 mx-1 self-center" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Bullet List (Unordered List)"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Numbered List (Ordered List)"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 mx-1 self-center" />

        {/* Extras: Quote, Code, Link, HR */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ${
            editor.isActive('codeBlock') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ${
            editor.isActive('link') ? 'bg-slate-200 text-brand-600 font-bold' : ''
          }`}
          title="Insert / Edit Link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
          title="Horizontal Rule"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
          title="Clear Formatting"
        >
          <Eraser className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-300 mx-1 self-center" />

        {/* History */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-40"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── Editor Content Area ─── */}
      <div className="tiptap-content-container bg-slate-50/30 min-h-[160px] cursor-text" onClick={() => editor.chain().focus().run()}>
        <EditorContent editor={editor} />
      </div>

      {/* Custom Styles for Tiptap HTML Elements */}
      <style>{`
        .tiptap-content-container .ProseMirror {
          min-height: 160px;
          outline: none;
        }
        .tiptap-content-container .ProseMirror p {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        .tiptap-content-container .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 0.8rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        .tiptap-content-container .ProseMirror h2 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-top: 0.7rem;
          margin-bottom: 0.4rem;
          color: #1e293b;
        }
        .tiptap-content-container .ProseMirror h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 0.6rem;
          margin-bottom: 0.35rem;
          color: #334155;
        }
        .tiptap-content-container .ProseMirror h4 {
          font-size: 1.05rem;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.3rem;
          color: #475569;
        }
        .tiptap-content-container .ProseMirror h5 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-top: 0.45rem;
          margin-bottom: 0.25rem;
          color: #64748b;
        }
        .tiptap-content-container .ProseMirror h6 {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 0.4rem;
          margin-bottom: 0.25rem;
          color: #64748b;
        }
        .tiptap-content-container .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin-top: 0.3rem !important;
          margin-bottom: 0.6rem !important;
        }
        .tiptap-content-container .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin-top: 0.3rem !important;
          margin-bottom: 0.6rem !important;
        }
        .tiptap-content-container .ProseMirror li {
          margin-bottom: 0.2rem;
          display: list-item !important;
        }
        .tiptap-content-container .ProseMirror blockquote {
          border-left: 3px solid #cbd5e1;
          padding-left: 0.85rem;
          margin-left: 0;
          margin-right: 0;
          color: #64748b;
          font-style: italic;
        }
        .tiptap-content-container .ProseMirror code {
          background-color: #f1f5f9;
          padding: 0.15rem 0.35rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.85em;
        }
        .tiptap-content-container .ProseMirror pre {
          background-color: #0f172a;
          color: #f8fafc;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-family: monospace;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          overflow-x: auto;
        }
        .tiptap-content-container .ProseMirror hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 1rem 0;
        }
        .tiptap-content-container .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
