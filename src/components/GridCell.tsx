import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const libheif = require('libheif-js/wasm-bundle');

import { TedTaggerDispatch, setLoupeViewMediaItemIdRedux, setPhotoLayoutRedux } from '../models';

import '../styles/TedTagger.css';
import { MediaItem, PhotoLayout } from '../types';
import { getDisplayMetadata, getKeywordLabelsForMediaItem, getMediaItems, isMediaItemSelected } from '../selectors';
import { getPhotoUrl } from '../utilities';
import { Tooltip, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { selectPhoto } from '../controllers';
import { borderSizeStr } from '../constants';

export interface GridCellPropsFromParent {
  mediaItemIndex: number;
  mediaItem: MediaItem
  rowHeight: number;
  cellWidth: number;
}

export interface GridCellProps extends GridCellPropsFromParent {
  displayMetadata: boolean;
  isSelected: boolean;
  keywordLabels: string[];
  onClickPhoto: (id: string, commandKey: boolean, shiftKey: boolean) => any;
  onSetLoupeViewMediaItemId: (id: string) => any;
  onSetPhotoLayoutRedux: (photoLayout: PhotoLayout) => any;
}

const GridCell = (props: GridCellProps) => {

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const { fileName } = props.mediaItem;
  const isHeic = fileName.toLowerCase().endsWith('.heic');

  const [clickTimeout, setClickTimeout] = React.useState<NodeJS.Timeout | null>(null);

  const mediaItem: MediaItem = props.mediaItem;

  const photoUrl = getPhotoUrl(mediaItem);

  React.useEffect(() => {
    const renderHeicImage = async () => {
      if (isHeic && canvasRef.current) {
        try {

          // Fetch the HEIC file from the server as ArrayBuffer
          const response = await fetch(photoUrl);
          if (!response.ok) throw new Error('Failed to fetch HEIC file');

          const arrayBuffer = await response.arrayBuffer();

          // Decode the HEIC image using libheif-js
          const heifDecoder = new libheif.HeifDecoder();
          const heifImage = heifDecoder.decode(arrayBuffer);

          const image = heifImage[0];
          const width = image.get_width();
          const height = image.get_height();

          const canvas = canvasRef.current;

          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext('2d')!;
          const imageData = context!.createImageData(width, height);

          await new Promise<void>((resolve, reject) => {
            image.display(imageData, (displayData: any) => {
              if (!displayData) {
                return reject(new Error('HEIF processing error'));
              }

              resolve();
            });
          });

          context.putImageData(imageData, 0, 0);
        } catch (error) {
          console.error('Error decoding HEIC image:', error);
        }
      }
    };

    renderHeicImage();
  }, [photoUrl, isHeic]);


  const handleDoubleClick = () => {
    props.onSetLoupeViewMediaItemId(props.mediaItem.uniqueId);
    props.onSetPhotoLayoutRedux(PhotoLayout.Loupe);
  };

  const handleClickPhoto = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    props.onClickPhoto(props.mediaItem.uniqueId, e.metaKey, e.shiftKey);
  };

  const handleClicks = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      handleDoubleClick();
    } else {
      const clickTimeout = setTimeout(() => {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
        handleClickPhoto(e);
      }, 200);
      setClickTimeout(clickTimeout);
    }
  };


  const getMetadataJsx = (): JSX.Element | null => {

    if (!props.displayMetadata) {
      return null;
    }

    const creationDate: Dayjs = dayjs(mediaItem.creationTime!);
    const formattedCreationDate: string = creationDate.format('MM/DD/YYYY hh:mm A');
    const keywords: string = props.keywordLabels.join(', ');

    return (
      <div style={{
        backgroundColor: 'silver',
        minHeight: '60px',
      }}
      >
        <Typography variant='body2' color='black' fontSize='12px'>
          {mediaItem.fileName}
          <br />
          {formattedCreationDate}
          <br />
          {keywords}
        </Typography>
      </div >
    );

  };

  const widthAttribute: string = props.cellWidth.toString() + 'px';
  const metadataHeight: number = props.displayMetadata ? 60 : 0;
  const imgHeightAttribute: string = props.rowHeight.toString() + 'px';
  const divHeightAttribute: string = (props.rowHeight + metadataHeight).toString() + 'px';

  const metadataJsx: JSX.Element | null = getMetadataJsx();


  let borderAttr: string = borderSizeStr + ' ';
  borderAttr += props.isSelected ? ' solid blue' : ' solid white';

  return (
    <Tooltip
      title={props.mediaItem.fileName}
      placement='top'
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -32],
              },
            },
          ],
        },
      }}
    >
      <div
        style={{
          display: 'inline-block',
          width: widthAttribute,
          height: divHeightAttribute,
          border: borderAttr,
        }}
        onClick={handleClicks}
      >
        {metadataJsx}
        {isHeic ? (
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        ) : (<img
          src={photoUrl}
          width={widthAttribute}
          height={imgHeightAttribute}
          loading='lazy'
        />
        )}
      </div>
    </Tooltip>
  );
};

function mapStateToProps(state: any, ownProps: GridCellPropsFromParent) {
  return {
    displayMetadata: getDisplayMetadata(state),
    isSelected: isMediaItemSelected(state, ownProps.mediaItem),
    mediaItem: ownProps.mediaItem,
    keywordLabels: getKeywordLabelsForMediaItem(state, getMediaItems(state)[ownProps.mediaItemIndex]),
  };
}

const mapDispatchToProps = (dispatch: TedTaggerDispatch) => {
  return bindActionCreators({
    onClickPhoto: selectPhoto,
    onSetLoupeViewMediaItemId: setLoupeViewMediaItemIdRedux,
    onSetPhotoLayoutRedux: setPhotoLayoutRedux,
  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(GridCell);
