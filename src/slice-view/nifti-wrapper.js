import { useEffect, useState, useRef } from 'react';
import { RenderingEngine } from '@cornerstonejs/core';
import { ViewportType } from '@cornerstonejs/core/dist/esm/enums';
import { ToolGroupManager, StackScrollMouseWheelTool } from '@cornerstonejs/tools';
import { registerNiftiImageLoader, loadNiftiImage } from 'loaders';
import { useOnnx } from 'hooks';

const imageBaseName = `${ process.env.PUBLIC_URL }/data/images/test_image_`;
const getImageName = index => `${ imageBaseName }0${ index + 1 }.png`;

export const NiftiWrapper = ({ url }) => {
  const [viewport, setViewport] = useState();
  const [clicks, setClicks] = useState();
  const [points, setPoints] = useState();
  const [threshold, setThreshold] = useState(0);
  const [imageName, setImageName] = useState(imageBaseName + '01.png');
  const { image, maskImage } = useOnnx(imageName, points, threshold);
  const div = useRef();
  const toolGroup = useRef();

  // Initialize
  useEffect(() => {
    if (!viewport) {
      registerNiftiImageLoader();

      const renderingEngineId = 'nifti-engine';
      const renderingEngine = new RenderingEngine(renderingEngineId);
  
      const viewportId = 'nifti-viewport';
      const viewportInput = {
        viewportId: viewportId,
        element: div.current,
        type: ViewportType.STACK
      };

      renderingEngine.setViewports([viewportInput]);
      setViewport(renderingEngine.getStackViewports()[0]);
      
      if (!toolGroup.current) {
        const toolGroupId = 'nifti-tool-group';
        toolGroup.current = ToolGroupManager.createToolGroup(toolGroupId);
        
        toolGroup.current.addTool(StackScrollMouseWheelTool.toolName);
        toolGroup.current.addViewport(viewportId, renderingEngineId);

        toolGroup.current.setToolActive(StackScrollMouseWheelTool.toolName);        
      } 
    }
  }, [viewport]);

  // Load image
  useEffect(() => {
    const loadImage = async url => {
      const imageIds = await loadNiftiImage(`nifti:${ url }`);
      viewport.setStack(imageIds);
    }

    if (viewport && url) loadImage(url);
  }, [viewport, url]);

  const getClickPoints = evt => {
    const x = evt.nativeEvent.offsetX / 800 * 48;
    const y = evt.nativeEvent.offsetY / 800 * 48;

    const point = { x: x, y: y, clickType: evt.shiftKey ? 0 : 1 };
    const points = (evt.altKey || evt.shiftKey) && clicks ? [...clicks, point] : [point];

    return points;
  }

  const onClick = evt => {
    const points = getClickPoints(evt);

    setClicks(points);
    setPoints(points);
  };

  const onMouseMove = evt => {
    const points= getClickPoints(evt);

    setPoints(points);
  };

  const onMouseLeave = () => {
    setPoints(clicks);
  };

  const onThresholdChange = evt => {
    setThreshold(+evt.target.value);
  };

  const onSliceChange = evt => {
    setClicks();    
    setImageName(getImageName(+evt.target.value));
  };

console.log(clicks);

  return (
    <>
      <div 
        ref={ div } 
        style={{ 
          width: '100%', 
          aspectRatio: '1 / 1' 
        }} 
      />
      <div 
        style={{ position: 'relative' }} 
        onMouseMove={ onMouseMove }
        onMouseLeave={ onMouseLeave }
        onClick={ onClick }        
      >
        { image && 
          <img 
            style={{ 
              width: '100%', 
              aspectRatio: '1 / 1', 
              pointerEvents: 'none' 
            }} 
            src={ image.src } 
            alt='original' 
          /> 
        }
        { maskImage && 
          <img 
            style={{ 
              width: '100%', 
              aspectRatio: '1 / 1', 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              pointerEvents: 'none',
              opacity: 0.5
            }} 
            src={ maskImage.src } 
            alt='mask' 
          /> 
        }
        { clicks?.map(({ x, y, clickType }, i) => (
          <div
            key={ i }
            style={{
              position: 'absolute',
              // XXX: Hack for + / - offset below
              top: y / 48 * 800 - (clickType === 0 ? 26 : 25),
              left: x / 48 * 800 - (clickType === 0 ? 6 : 11),
              pointerEvents: 'none',
              color: '#993404',
              fontWeight: 'bold',
              fontSize: 32
            }}
          >
            { clickType === 0 ? '-' : '+' }
          </div>
        ))}
      </div>
      <label>Threshold</label><input type='range' min={ -20 } max={ 20 } defaultValue={ 0 } onMouseUp={ onThresholdChange } />
      <label>Slice</label><input type='range' min={ 0 } max={ 7 } defaultValue={ 0 } onChange={ onSliceChange } />
    </>
  );
};