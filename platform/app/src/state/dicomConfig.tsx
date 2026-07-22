import React, { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

type DicomConfigContextValue = [
  DicomConfig | null,
  React.Dispatch<React.SetStateAction<DicomConfig | null>>,
];

const dicomConfigContext = createContext<DicomConfigContextValue | null>(null);
const { Provider } = dicomConfigContext;

export const useDicomConfig = () => useContext(dicomConfigContext);

export function DicomConfigProvider({ children }: { children: React.ReactNode }) {
  const [dicomConfig, setDicomConfig] = useState<DicomConfig | null>(null);

  return <Provider value={[dicomConfig, setDicomConfig]}>{children}</Provider>;
}

DicomConfigProvider.propTypes = {
  children: PropTypes.any,
};

export default DicomConfigProvider;

export interface DicomToolConfig {
  toolName: string;
  ischecked: boolean;
  label: string;
  labels?: { code: string; text: string; color: string }[];
}

export interface DicomToolGroups {
  MeasurementTools: DicomToolConfig[];
  [group: string]: DicomToolConfig[];
}

export interface DicomModeConfig {
  modeId: string;
  routeName: string;
  displayName: string;
  label: string;
  ischecked: boolean;
  tools: DicomToolGroups;
}

export interface DicomConfig {
  report_name_labels?: { code: string; text: string; color: string }[];
  measurement_labels?: { code: string; text: string; color: string }[];
  mode_catalog?: DicomModeConfig[];
}

/**
 * Derives the route name from the browser address bar, e.g.
 * http://host:3000/viewer?StudyInstanceUIDs=... -> 'viewer'.
 * Falls back to 'viewer' when no path segment is available.
 */
function getRouteNameFromUrl(): string {
  const path =
    typeof window !== 'undefined' ? window.location.pathname : '';
  const segments = path.split('/').filter(Boolean);
  return segments[0] || 'viewer';
}

/**
 * Returns the toolNames that are checked (ischecked === true) for the mode
 * whose `routeName` equals `routeName`. When not provided, the route name is
 * read from the browser address bar.
 */
export function getCheckedToolNames(
  dicomConfig: DicomConfig | null,
  routeName = getRouteNameFromUrl()
): Set<string> {
  const mode = dicomConfig?.mode_catalog?.find(m => m.routeName === routeName);

  if (!mode) {
    return new Set();
  }

  // `tools` is a map of tool groups (e.g. MeasurementTools) to their tool
  // configs. Collect the checked tool names across all groups so the result
  // is independent of how the groups are named / extended in the future.
  return new Set(
    Object.values(mode.tools ?? {})
      .flat()
      .filter(tool => tool.ischecked)
      .map(tool => tool.toolName)
  );
}

/**
 * Hook variant: reads the dicomConfig from context and returns the filtered
 * list of measurement tool names for the given route (defaults to 'viewer').
 * When no config / no matching mode is available, the original list is
 * returned untouched.
 */
export function useCheckedMeasurementTools(
  measurementTools: string[],
  routeName = getRouteNameFromUrl()
): string[] {
  const [dicomConfig] = (useDicomConfig() as unknown) as [
    DicomConfig | null,
    (value: unknown) => void,
  ];

  const checkedToolNames = getCheckedToolNames(dicomConfig, routeName);

  if (checkedToolNames.size === 0) {
    return measurementTools;
  }

  return measurementTools.filter(toolName => checkedToolNames.has(toolName));
}
