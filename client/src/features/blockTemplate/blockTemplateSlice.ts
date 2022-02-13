import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { GlobalSettings } from '../../app/globalSettingsSlice';
import { RootState } from '../../app/store';
import { MidiBlockT } from '../midiBlock/midiBlockSlice';

export interface BlockTemplate {
  id: string;
  midiBlocks: MidiBlockT[];
  blockLayout: Layout[];
  globalSettings: GlobalSettings;
}

const blockTemplateAdapter = createEntityAdapter<BlockTemplate>({
  selectId: (template) => template.id,
});

const initialState = blockTemplateAdapter.getInitialState({
  activeTemplateId: ''
});

const blockTemplateSlice = createSlice({
  name: 'blockTemplates',
  initialState,
  reducers: {
    setOneBlockLayout: blockTemplateAdapter.setOne,
    removeOneBlockLayout: blockTemplateAdapter.removeOne
  },
});

export const {
  setOneBlockLayout,
  removeOneBlockLayout
} = blockTemplateSlice.actions;

export const { selectAll: selectAllBlockLayouts } =
blockTemplateAdapter.getSelectors<RootState>((state) => state.blockTemplate);

export default blockTemplateSlice.reducer;
