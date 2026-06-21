import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import {
  FiBold, FiItalic, FiCode, FiList, FiLink2, FiImage,
  FiMinus, FiRotateCcw, FiRotateCw,
} from 'react-icons/fi';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function wordCount(html: string) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

export default function RichEditor({ value, onChange, placeholder, minHeight = 340 }: Props) {
  const mounted = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing here…' }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  // Sync when value changes externally (e.g. after API load)
  useEffect(() => {
    if (!editor) return;
    if (!mounted.current) { mounted.current = true; return; }
    if (editor.isEmpty && value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  const headingLevel = editor.isActive('heading', { level: 1 }) ? '1'
    : editor.isActive('heading', { level: 2 }) ? '2'
    : editor.isActive('heading', { level: 3 }) ? '3'
    : '0';

  const addLink = () => {
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('Link URL:', prev);
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL:');
    if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  return (
    <div className="ep-card" style={{ marginBottom: 0 }}>
      {/* Toolbar */}
      <div className="ep-editor-toolbar">
        <select
          className="ep-tool-select"
          value={headingLevel}
          onChange={e => {
            const l = Number(e.target.value);
            if (l === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().setHeading({ level: l as 1 | 2 | 3 }).run();
          }}
          aria-label="Text format"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <div className="ep-tool-sep" />

        <button type="button" className={`ep-tool-btn${editor.isActive('bold') ? ' is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
          <FiBold size={14} />
        </button>
        <button type="button" className={`ep-tool-btn${editor.isActive('italic') ? ' is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <FiItalic size={14} />
        </button>
        <button type="button" className={`ep-tool-btn${editor.isActive('underline') ? ' is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <span style={{ fontWeight: 800, textDecoration: 'underline', fontSize: 13, lineHeight: 1 }}>U</span>
        </button>
        <button type="button" className={`ep-tool-btn${editor.isActive('strike') ? ' is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <span style={{ textDecoration: 'line-through', fontSize: 13, fontWeight: 600, lineHeight: 1 }}>S</span>
        </button>

        <div className="ep-tool-sep" />

        <button type="button" className={`ep-tool-btn${editor.isActive('bulletList') ? ' is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <FiList size={14} />
        </button>
        <button type="button" className={`ep-tool-btn${editor.isActive('orderedList') ? ' is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>1.</span>
        </button>
        <button type="button" className={`ep-tool-btn${editor.isActive('blockquote') ? ' is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1 }}>"</span>
        </button>
        <button type="button" className={`ep-tool-btn${editor.isActive('code') ? ' is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
          <FiCode size={14} />
        </button>
        <button type="button" className={`ep-tool-btn${editor.isActive('codeBlock') ? ' is-active' : ''}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>{`</>`}</span>
        </button>

        <div className="ep-tool-sep" />

        <button type="button" className={`ep-tool-btn${editor.isActive('link') ? ' is-active' : ''}`}
          onClick={addLink} title="Insert link">
          <FiLink2 size={14} />
        </button>
        <button type="button" className="ep-tool-btn" onClick={addImage} title="Insert image">
          <FiImage size={14} />
        </button>
        <button type="button" className="ep-tool-btn"
          onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <FiMinus size={14} />
        </button>

        <div className="ep-tool-sep" />

        <button type="button" className="ep-tool-btn"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()} title="Undo">
          <FiRotateCcw size={13} />
        </button>
        <button type="button" className="ep-tool-btn"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()} title="Redo">
          <FiRotateCw size={13} />
        </button>
      </div>

      {/* Editor body */}
      <div className="ep-editor-body" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>

      {/* Footer */}
      <div className="ep-editor-footer">
        <span className="ep-editor-footer__word-count">{wordCount(value)} words</span>
      </div>
    </div>
  );
}
