import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Layout } from 'react-grid-layout';
import { GlobalSettings } from '../../app/globalSettingsSlice';
import { RootState } from '../../app/store';
import { MidiBlockT } from '../midiBlock/midiBlockSlice';

export interface BlockTemplate {
  id: string;
  name: string;
  midiBlocks: MidiBlockT[];
  blockLayout: Layout[];
  globalSettings: GlobalSettings;
}

const blockTemplateAdapter = createEntityAdapter<BlockTemplate>({
  selectId: (template) => template.id,
});

const initialState = blockTemplateAdapter.getInitialState({
  activeTemplateId: '',
});

const blockTemplateSlice = createSlice({
  name: 'blockTemplates',
  initialState,
  reducers: {
    setOneBlockTemplate(state, action: PayloadAction<BlockTemplate>) {
      const newTemplate = action.payload;
      state.activeTemplateId = newTemplate.id;
      blockTemplateAdapter.setOne(state, newTemplate);
    },
    removeOneBlockTemplate(state, action: PayloadAction<string>) {
      state.activeTemplateId = '';
      blockTemplateAdapter.removeOne(state, action.payload);
    },
    setActiveTemplate(state, action: PayloadAction<BlockTemplate>) {
      state.activeTemplateId = action.payload.id;
    },
  },
});

export const {
  setOneBlockTemplate,
  removeOneBlockTemplate,
  setActiveTemplate,
} = blockTemplateSlice.actions;

export const { selectAll: selectAllBlockTemplates } =
  blockTemplateAdapter.getSelectors<RootState>((state) => state.blockTemplate);

export const selectActiveTemplate = createSelector(
  [(state: RootState) => state.blockTemplate.entities[state.blockTemplate.activeTemplateId]],
  (activeTemplate) => activeTemplate
);

export default blockTemplateSlice.reducer;
