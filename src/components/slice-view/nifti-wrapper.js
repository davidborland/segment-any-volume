import { useEffect, useState, useRef } from 'react';
import { RenderingEngine } from '@cornerstonejs/core';
import { ViewportType } from '@cornerstonejs/core/dist/esm/enums';
import { ToolGroupManager, StackScrollMouseWheelTool } from '@cornerstonejs/tools';
import { registerNiftiImageLoader, loadNiftiImage } from 'loaders';

export const NiftiWrapper = ({ url }) => {
  const [viewport, setViewport] = useState();
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

  return (
    <div 
      ref={ div } 
      style={{ 
        width: '100%', 
        aspectRatio: '1 / 1' 
      }} 
    />
  );
};