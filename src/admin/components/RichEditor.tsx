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
}

type ToolBtn = {
  type: 'btn';
  icon: React.ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};
type ToolSep = { type: 'sep' };
type Tool = ToolBtn | ToolSep;

export default function RichEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your post here…' }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

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

  const headingLevel = editor.isActive('heading', { level: 1 }) ? '1'
    : editor.isActive('heading', { level: 2 }) ? '2'
    : editor.isActive('heading', { level: 3 }) ? '3'
    : '0';

  const tools: Tool[] = [
    { type: 'btn', icon: <FiBold size={14} />, title: 'Bold (Ctrl+B)', active: editor.isActive('bold'), onClick: () => editor.chain().focus().toggleBold().run() },
    { type: 'btn', icon: <FiItalic size={14} />, title: 'Italic (Ctrl+I)', active: editor.isActive('italic'), onClick: () => editor.chain().focus().toggleItalic().run() },
    { type: 'btn', icon: <span style={{ fontWeight: 800, textDecoration: 'underline', fontSize: 13, lineHeight: 1 }}>U</span>, title: 'Underline (Ctrl+U)', active: editor.isActive('underline'), onClick: () => editor.chain().focus().toggleUnderline().run() },
    { type: 'btn', icon: <span style={{ textDecoration: 'line-through', fontSize: 13, fontWeight: 600, lineHeight: 1 }}>S</span>, title: 'Strikethrough', active: editor.isActive('strike'), onClick: () => editor.chain().focus().toggleStrike().run() },
    { type: 'sep' },
    { type: 'btn', icon: <FiList size={14} />, title: 'Bullet list', active: editor.isActive('bulletList'), onClick: () => editor.chain().focus().toggleBulletList().run() },
    { type: 'btn', icon: <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>1.</span>, title: 'Numbered list', active: editor.isActive('orderedList'), onClick: () => editor.chain().focus().toggleOrderedList().run() },
    { type: 'btn', icon: <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1 }}>"</span>, title: 'Blockquote', active: editor.isActive('blockquote'), onClick: () => editor.chain().focus().toggleBlockquote().run() },
    { type: 'btn', icon: <FiCode size={14} />, title: 'Inline code', active: editor.isActive('code'), onClick: () => editor.chain().focus().toggleCode().run() },
    { type: 'btn', icon: <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>{`</>`}</span>, title: 'Code block', active: editor.isActive('codeBlock'), onClick: () => editor.chain().focus().toggleCodeBlock().run() },
    { type: 'sep' },
    { type: 'btn', icon: <FiLink2 size={14} />, title: 'Insert / edit link', active: editor.isActive('link'), onClick: addLink },
    { type: 'btn', icon: <FiImage size={14} />, title: 'Insert image', active: false, onClick: addImage },
    { type: 'btn', icon: <FiMinus size={14} />, title: 'Horizontal rule', active: false, onClick: () => editor.chain().focus().setHorizontalRule().run() },
    { type: 'sep' },
    { type: 'btn', icon: <FiRotateCcw size={13} />, title: 'Undo (Ctrl+Z)', active: false, disabled: !editor.can().undo(), onClick: () => editor.chain().focus().undo().run() },
    { type: 'btn', icon: <FiRotateCw size={13} />, title: 'Redo (Ctrl+Y)', active: false, disabled: !editor.can().redo(), onClick: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div className="a-rich-editor">
      <div className="a-rich-toolbar">
        {/* Heading select */}
        <select
          className="a-rich-select"
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

        <div className="a-rich-sep" />

        {tools.map((tool, i) =>
          tool.type === 'sep' ? (
            <div key={`sep-${i}`} className="a-rich-sep" />
          ) : (
            <button
              key={`btn-${i}`}
              type="button"
              className={`a-rich-btn${tool.active ? ' is-active' : ''}`}
              onClick={tool.onClick}
              disabled={tool.disabled}
              title={tool.title}
              aria-label={tool.title}
            >
              {tool.icon}
            </button>
          )
        )}
      </div>

      <div className="a-rich-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
