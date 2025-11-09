"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color, TextStyle, FontSize } from "@tiptap/extension-text-style";
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Palette, Strikethrough } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start typing...",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextStyle,
      Color,
      FontSize,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  // Update editor content when value prop changes (for controlled component)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleStrike = useCallback(() => {
    editor?.chain().focus().toggleStrike().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run();
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run();
  }, [editor]);

  const undo = useCallback(() => {
    editor?.chain().focus().undo().run();
  }, [editor]);

  const redo = useCallback(() => {
    editor?.chain().focus().redo().run();
  }, [editor]);

  const setColor = useCallback(
    (color: string) => {
      editor?.chain().focus().setColor(color).run();
    },
    [editor]
  );

  const unsetColor = useCallback(() => {
    editor?.chain().focus().unsetColor().run();
  }, [editor]);

  const setFontSize = useCallback(
    (size: string) => {
      if (size === "default") {
        editor?.chain().focus().unsetFontSize().run();
      } else {
        editor?.chain().focus().setFontSize(size).run();
      }
    },
    [editor]
  );

  const setHeading = useCallback(
    (level: number) => {
      if (level === 0) {
        editor?.chain().focus().setParagraph().run();
      } else {
        editor
          ?.chain()
          .focus()
          .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
          .run();
      }
    },
    [editor]
  );

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const textTypeOptions = [
    { value: "paragraph", label: "Paragraph", level: 0 },
    { value: "h1", label: "Heading 1", level: 1 },
    { value: "h2", label: "Heading 2", level: 2 },
    { value: "h3", label: "Heading 3", level: 3 },
    { value: "h4", label: "Heading 4", level: 4 },
    { value: "h5", label: "Heading 5", level: 5 },
    { value: "h6", label: "Heading 6", level: 6 },
  ];

  const fontSizeOptions = [
    { value: "default", label: "Default" },
    { value: "12px", label: "12px" },
    { value: "14px", label: "14px" },
    { value: "16px", label: "16px" },
    { value: "18px", label: "18px" },
    { value: "20px", label: "20px" },
    { value: "24px", label: "24px" },
    { value: "28px", label: "28px" },
    { value: "32px", label: "32px" },
    { value: "36px", label: "36px" },
  ];

  const predefinedColors = [
    "#000000", // Black
    "#374151", // Gray 700
    "#6B7280", // Gray 500
    "#9CA3AF", // Gray 400
    "#EF4444", // Red 500
    "#F97316", // Orange 500
    "#EAB308", // Yellow 500
    "#22C55E", // Green 500
    "#3B82F6", // Blue 500
    "#6366F1", // Indigo 500
    "#8B5CF6", // Violet 500
    "#EC4899", // Pink 500
  ];

  if (!editor) {
    return (
      <div className={cn("border rounded-md", className)}>
        {/* Toolbar Skeleton */}
        <div className="flex flex-wrap items-center gap-1 p-1 border-b">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-20 h-8" />
          <div className="w-px h-6 mx-1 bg-border" />
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
          <div className="w-px h-6 mx-1 bg-border" />
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
          <div className="w-px h-6 mx-1 bg-border" />
          <Skeleton className="w-8 h-8" />
          <div className="w-px h-6 mx-1 bg-border" />
          <Skeleton className="w-8 h-8" />
          <Skeleton className="w-8 h-8" />
        </div>

        {/* Editor Content Skeleton */}
        <div className="space-y-3 p-3">
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-2/3 h-4" />
          <Skeleton className="w-5/6 h-4" />
          <Skeleton className="w-1/2 h-4" />
          <div className="space-y-2 pt-8">
            <Skeleton className="w-4/5 h-3" />
            <Skeleton className="w-full h-3" />
            <Skeleton className="w-3/4 h-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-md", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1 border-b">
        {/* Text Type Selector */}
        <Select
          defaultValue="paragraph"
          onValueChange={(value) => {
            const option = textTypeOptions.find((opt) => opt.value === value);
            if (option) {
              setHeading(option.level);
            }
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {textTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font Size Selector */}
        <Select defaultValue="14px" onValueChange={setFontSize} disabled={disabled}>
          <SelectTrigger className="w-20 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontSizeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="w-px h-6 mx-1 bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBold}
          disabled={disabled}
          className={cn("w-8 h-8 p-0", editor.isActive("bold") && "bg-muted")}
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleItalic}
          disabled={disabled}
          className={cn("w-8 h-8 p-0", editor.isActive("italic") && "bg-muted")}
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleStrike}
          disabled={disabled}
          className={cn("w-8 h-8 p-0", editor.isActive("strike") && "bg-muted")}
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 mx-1 bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBulletList}
          disabled={disabled}
          className={cn("w-8 h-8 p-0", editor.isActive("bulletList") && "bg-muted")}
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleOrderedList}
          disabled={disabled}
          className={cn("w-8 h-8 p-0", editor.isActive("orderedList") && "bg-muted")}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={toggleBlockquote}
          disabled={disabled}
          className={cn("w-8 h-8 p-0", editor.isActive("blockquote") && "bg-muted")}
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 mx-1 bg-border" />

        {/* Color Picker */}
        <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className={cn("w-8 h-8 p-0", editor.isActive("textStyle") && "bg-muted")}
            >
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-3">
              <div className="font-medium text-sm">Text Color</div>
              <div className="gap-2 grid grid-cols-6">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 border border-border rounded hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setColor(color);
                      setIsColorPickerOpen(false);
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    unsetColor();
                    setIsColorPickerOpen(false);
                  }}
                  className="w-full text-xs"
                >
                  Remove Color
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 mx-1 bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          className="w-8 h-8 p-0"
        >
          <Undo className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          className="w-8 h-8 p-0"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="p-3">
        <EditorContent
          editor={editor}
          className={cn(
            "focus-within:outline-none",
            "[&_.ProseMirror]:outline-none",
            "[&_.ProseMirror]:min-h-[120px]",
            "[&_.ProseMirror]:h-[300px]",
            "[&_.ProseMirror]:resize-y",
            "[&_.ProseMirror]:overflow-y-auto",
            "[&_.ProseMirror]:text-sm",
            "[&_.ProseMirror]:leading-6",
            "[&_.ProseMirror_p]:my-2",
            "[&_.ProseMirror_p]:first:mt-0",
            "[&_.ProseMirror_p]:last:mb-0",
            "[&_.ProseMirror_ul]:my-2",
            "[&_.ProseMirror_ol]:my-2",
            "[&_.ProseMirror_li]:my-1",
            "[&_.ProseMirror_blockquote]:border-l-4",
            "[&_.ProseMirror_blockquote]:border-border",
            "[&_.ProseMirror_blockquote]:pl-4",
            "[&_.ProseMirror_blockquote]:my-4",
            "[&_.ProseMirror_blockquote]:italic",
            "[&_.ProseMirror_strong]:font-bold",
            "[&_.ProseMirror_em]:italic",
            "[&_.ProseMirror_s]:line-through",
            "[&_.ProseMirror_span[style*='color']]:text-current",
            "[&_.ProseMirror_span[style*='font-size']]:text-current",
            "[&_.ProseMirror_h1]:text-2xl",
            "[&_.ProseMirror_h1]:font-bold",
            "[&_.ProseMirror_h1]:my-4",
            "[&_.ProseMirror_h1]:first:mt-0",
            "[&_.ProseMirror_h1]:last:mb-0",
            "[&_.ProseMirror_h2]:text-xl",
            "[&_.ProseMirror_h2]:font-bold",
            "[&_.ProseMirror_h2]:my-3",
            "[&_.ProseMirror_h2]:first:mt-0",
            "[&_.ProseMirror_h2]:last:mb-0",
            "[&_.ProseMirror_h3]:text-lg",
            "[&_.ProseMirror_h3]:font-semibold",
            "[&_.ProseMirror_h3]:my-3",
            "[&_.ProseMirror_h3]:first:mt-0",
            "[&_.ProseMirror_h3]:last:mb-0",
            "[&_.ProseMirror_h4]:text-base",
            "[&_.ProseMirror_h4]:font-semibold",
            "[&_.ProseMirror_h4]:my-2",
            "[&_.ProseMirror_h4]:first:mt-0",
            "[&_.ProseMirror_h4]:last:mb-0",
            "[&_.ProseMirror_h5]:text-sm",
            "[&_.ProseMirror_h5]:font-medium",
            "[&_.ProseMirror_h5]:my-2",
            "[&_.ProseMirror_h5]:first:mt-0",
            "[&_.ProseMirror_h5]:last:mb-0",
            "[&_.ProseMirror_h6]:text-xs",
            "[&_.ProseMirror_h6]:font-medium",
            "[&_.ProseMirror_h6]:my-2",
            "[&_.ProseMirror_h6]:first:mt-0",
            "[&_.ProseMirror_h6]:last:mb-0",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
            disabled && "opacity-50 pointer-events-none"
          )}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
