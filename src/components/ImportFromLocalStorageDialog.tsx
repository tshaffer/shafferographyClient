import * as React from 'react';
import { connect } from 'react-redux';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';

import { FormControl, InputLabel, MenuItem, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';

import { getAppInitialized, getLocalStorageFolders } from '../selectors';
import { Button, DialogActions, DialogContent } from '@mui/material';

export interface ImportFromLocalStorageDialogPropsFromParent {
  open: boolean;
  onImportFromLocalStorage: (folder: string) => void;
  onClose: () => void;
}

export interface ImportFromLocalStorageDialogProps extends ImportFromLocalStorageDialogPropsFromParent {
  folders: string[];
  appInitialized: boolean;
}

const ImportFromLocalStorageDialog = (props: ImportFromLocalStorageDialogProps) => {

  const { open, onClose } = props;

  if (!props.appInitialized) {
    return null;
  }

  if (!open) {
    return null;
  }

  const [selectedFolder, setSelectedFolder] = React.useState(props.folders[0] || '');

  const handleChange = (event: SelectChangeEvent<typeof selectedFolder>) => {
    setSelectedFolder(event.target.value || '');
  };

  const handleClose = () => {
    onClose();
  };

  function handleImport(): void {
    console.log('Importing from LocalStorage', selectedFolder);
    props.onImportFromLocalStorage(selectedFolder);
    onClose();
  }

  const renderFolder = (folder: string): JSX.Element => {
    return (
      <MenuItem key={folder} value={folder}>{folder}</MenuItem>
    );
  };

  const renderFolders = (): JSX.Element[] => {
    const folders = props.folders;
    const foldersJSX: JSX.Element[] = folders.map((folder: string) => {
      return renderFolder(folder);
    });
    return foldersJSX;
  };

  const folderItems: JSX.Element[] = renderFolders();

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Import from Local Storage</DialogTitle>
      <DialogContent style={{ paddingBottom: '0px' }}>
        <div>
          <Box
            component="form"
            noValidate
            autoComplete="off"
          >
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="demo-dialog-select-label">Local Storage</InputLabel>
              <Select
                value={selectedFolder}
                onChange={handleChange}
                input={<OutlinedInput label="Parent Keyword" />}
              >
                {folderItems}
              </Select>
            </FormControl>
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
    folders: getLocalStorageFolders(state),
  };
}

export default connect(mapStateToProps)(ImportFromLocalStorageDialog);
