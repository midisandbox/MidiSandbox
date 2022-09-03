import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { MidiBlockT } from '../../midiBlock/midiBlockSlice';

interface NotepadProps {
  containerWidth: number;
  containerHeight: number;
  block: MidiBlockT;
}
function Notepad({ containerHeight, containerWidth, block }: NotepadProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        dropcursor: false,
        gapcursor: false,
        hardBreak: false,
        strike: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: '<p>Hello World!</p>',
  });

  return <EditorContent editor={editor} />;
}

export default Notepad;
