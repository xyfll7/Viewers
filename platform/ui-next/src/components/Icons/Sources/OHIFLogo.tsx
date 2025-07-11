import React from 'react';
import type { IconProps } from '../types';

export const OHIFLogo = (props: IconProps) => (
  <div className='flex items-center ' >
    <OHIFLogoImage {...props} />
    <div className='text-primary ml-2 '>淘丁集团</div>
  </div>
);

export default OHIFLogo;


export const OHIFLogoImage = (props: IconProps) => (
      <svg version="1.1" id="Layer_1" 
    xmlns="http://www.w3.org/2000/svg" 
    xmlnsXlink="http://www.w3.org/1999/xlink" 
    x="0px" y="0px" 
    width="30px" 
    height="30px" 
    viewBox="0 0 30 30" 
    enableBackground="new 0 0 30 30" 
    xmlSpace="preserve">  
    <image id="image0" width="30" height="30" x="0" y="0"
      xlinkHref="data:image/png;base64,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" />
    </svg>
)
