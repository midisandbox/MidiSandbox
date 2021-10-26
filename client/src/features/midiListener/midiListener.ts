import { WebMidi } from 'webmidi/dist/webmidi.esm';
import { AppDispatch, RootState } from '../../app/store';
import { upsertManyMidiInputs } from './midiInputSlice';

const addMidiListeners = (dispatch: AppDispatch, getState: Function) => {
  WebMidi.enable()
    .then(() => {
      console.log(WebMidi.inputs);
      console.log(WebMidi.outputs);
      dispatch(
        upsertManyMidiInputs(
          WebMidi.inputs.map((input) => ({
            connection: input._midiInput.connection,
            id: input._midiInput.id,
            manufacturer: input._midiInput.manufacturer,
            name: input._midiInput.name,
            state: input._midiInput.state,
            type: input._midiInput.type,
            version: input._midiInput.version,
          }))
        )
      );

      // let input = WebMidi.getInputByName('MPK Mini Mk II');
      // console.log('input: ', input);
      // if (input) {
      //   input.addListener(
      //     'noteon',
      //     (e: any) => {
      //       console.log('e: ', e);
      //     },
      //     { channels: [1,2] }
      //   );
      // }
    })
    .catch((err) => alert(err));
};

export default addMidiListeners;
