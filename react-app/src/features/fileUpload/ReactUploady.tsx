import React from 'react';
import Uploady from '@rpldy/uploady';
import UploadButton from '@rpldy/upload-button';
import { asUploadButton } from '@rpldy/upload-button';

function ReactUploady() {
  return (
    <Uploady destination={{ url: 'http://localhost:3001/dev/sheet-music' }}>
      <DivUploadButton />
    </Uploady>
  );
}

const DivUploadButton = asUploadButton((props: any) => {
  return (
    <div {...props} style={{ cursor: 'pointer' }}>
      Upload Button
    </div>
  );
});

export default ReactUploady;
