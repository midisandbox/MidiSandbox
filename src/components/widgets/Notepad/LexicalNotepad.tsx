export {};
// import { AutoLinkNode, LinkNode } from '@lexical/link';
// import { ListItemNode, ListNode } from '@lexical/list';
// import { HeadingNode } from '@lexical/rich-text';

// import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
// import { AutoScrollPlugin } from '@lexical/react/LexicalAutoScrollPlugin';
// import { LexicalComposer } from '@lexical/react/LexicalComposer';
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// import { ContentEditable } from '@lexical/react/LexicalContentEditable';
// import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
// import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
// import { ListPlugin } from '@lexical/react/LexicalListPlugin';
// import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
// import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
// import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
// import { useTheme } from '@mui/material/styles';
// import { Box } from '@mui/system';
// import { EditorState, LexicalEditor } from 'lexical';
// import { debounce } from 'lodash';
// import { useEffect, useMemo, useRef } from 'react';
// import { useAppDispatch } from '../../../app/store';
// import {  updateOneMidiBlock } from '../../midiBlock/midiBlockSlice';
// import NotepadToolbar from './NotepadToolbar';

// interface NotepadProps {
//   containerWidth: number;
//   containerHeight: number;
//   block: MidiBlockT;
// }
// function Notepad({ containerHeight, containerWidth, block }: NotepadProps) {
//   const muiTheme = useTheme();
//   const dispatch = useAppDispatch();
//   const containerWithScrollRef = useRef(null);

//   // Catch any errors that occur during Lexical updates and log them
//   // or throw them as needed. If you don't throw them, Lexical will
//   // try to recover gracefully without losing user data.
//   function onError(error: any) {
//     console.error(error);
//   }

//   // When the editor changes, save the currentEditorState in block.notepadSettings
//   // this will be used to initialize the notepad when loading a template
//   function onChange(editorState: EditorState, editor: LexicalEditor) {
//     debouncedStoreUpdate({
//       ...block.notepadSettings,
//       currentEditorState: JSON.stringify(editorState.toJSON()),
//     });
//   }

//   const debouncedStoreUpdate = useMemo(
//     () =>
//       debounce((updatedNotepadSettings: NotepadSettingsT) => {
//         dispatch(
//           updateOneMidiBlock({
//             id: block.id,
//             changes: {
//               notepadSettings: updatedNotepadSettings,
//             },
//           })
//         );
//       }, 5000),
//     [block, dispatch]
//   );

//   return (
//     <Box
//       sx={{
//         height: containerHeight,
//         width: containerWidth,
//         display: 'flex',
//         flexDirection: 'column',
//         pr: 10,
//       }}
//       className="lexical-wrapper"
//       ref={containerWithScrollRef}
//     >
//       <LexicalComposer
//         initialConfig={{
//           namespace: `Notepad-${block.id}`,
//           theme: {},
//           onError,
//           nodes: [LinkNode, AutoLinkNode, ListNode, ListItemNode, HeadingNode],
//         }}
//       >
//         <CustomTemplateLoaderPlugin block={block} />

//         <RichTextPlugin
//           contentEditable={
//             <ContentEditable
//               style={{
//                 overflow: 'auto',
//                 outline: 'none',
//                 paddingLeft: muiTheme.spacing(2),
//                 height: '100%',
//                 lineHeight: 1,
//                 // background: 'grey',
//               }}
//             />
//           }
//           placeholder={<div></div>}
//         />
//         <NotepadToolbar />
//         <OnChangePlugin onChange={onChange} />
//         <LinkPlugin />
//         <ListPlugin />
//         <HistoryPlugin />
//         <MarkdownShortcutPlugin />
//         <AutoScrollPlugin scrollRef={containerWithScrollRef} />
//         <AutoLinkPlugin
//           matchers={[
//             (text) => {
//               const match =
//                 /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.exec(
//                   text
//                 );
//               return (
//                 match && {
//                   index: match.index,
//                   length: match[0].length,
//                   text: match[0],
//                   url: match[0],
//                 }
//               );
//             },
//           ]}
//         />
//       </LexicalComposer>
//     </Box>
//   );
// }

// function CustomTemplateLoaderPlugin({ block }: { block: MidiBlockT }) {
//   const [editor] = useLexicalComposerContext();

//   useEffect(() => {
//     if (block.notepadSettings.templateEditorState) {
//       editor.setEditorState(
//         editor.parseEditorState(block.notepadSettings.templateEditorState)
//       );
//     }
//   }, [editor, block.notepadSettings.templateEditorState]);

//   return null;
// }

// export default Notepad;
