import React, { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

const dicomConfigContext = createContext(null);
const { Provider } = dicomConfigContext;

export const useDicomConfig = () => useContext(dicomConfigContext);

export function DicomConfigProvider({ children }) {
  const [dicomConfig, setDicomConfig] = useState(null);

  return <Provider value={[dicomConfig, setDicomConfig]}>{children}</Provider>;
}

DicomConfigProvider.propTypes = {
  children: PropTypes.any,
};

export default DicomConfigProvider;
