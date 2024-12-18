import * as React from 'react';
import { connect } from 'react-redux';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';

import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';

import { getAppInitialized, getTakeouts } from '../selectors';
import { Button, DialogActions, DialogContent } from '@mui/material';

import { Takeout } from '../types';

export interface MergePeopleDialogPropsFromParent {
  open: boolean;
  onMergePeople: (id: string) => void;
  onClose: () => void;
}

export interface MergePeopleDialogProps extends MergePeopleDialogPropsFromParent {
  takeouts: Takeout[];
  appInitialized: boolean;
}

const MergePeopleDialog = (props: MergePeopleDialogProps) => {

  const { open, onClose } = props;

  const folderInputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  if (!props.appInitialized) {
    return null;
  }

  if (!open) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      console.log('event.target.files', event.target.files);
      setSelectedFiles(event.target.files);
      setError(null); // Reset error message when new folder is selected
      setSuccessMessage(null); // Reset success message
    }
  };

  function handleImport(): void {
    console.log('Importing from Takeout');
    // props.onMergePeople(takeoutId);
    onClose();
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Import from Takeout</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        <div>
          <Box
            component="form"
            noValidate
            autoComplete="off"
          >
            <input
              type="file"
              webkitdirectory=""
              id="folderInput"
              name="file"
              multiple
              onChange={handleFolderSelect}
              ref={folderInputRef}
              style={{ marginBottom: '1rem' }}
            />
          </Box>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleImport} autoFocus>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function mapStateToProps(state: any) {
  return {
    appInitialized: getAppInitialized(state),
    takeouts: getTakeouts(state),
  };
}

export default connect(mapStateToProps)(MergePeopleDialog);
