import React, { useState, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

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

/**
 * The top-level project configuration returned by the backend. The DICOM
 * related configuration lives under `dicom_config`.
 */
export interface ProjectConfig {
  dicom_config?: {
    report_name_labels?: { code: string; text: string; color: string }[];
    measurement_labels?: { code: string; text: string; color: string }[];
    mode_catalog?: DicomModeConfig[];
  };
  /** 数据包 ID（来自 mark-conf） */
  package_id?: string;
  /** 任务批次 key（来自 mark-conf） */
  task_key?: string;
  /** 标注/作业类型（来自 mark-conf） */
  work_type?: number;
  /** 访问角色（来自 mark-conf） */
  access?: number;
  /** 抽检包 ID（来自 mark-conf / 入口 URL） */
  spot_check_pack_id?: string;
}

type ProjectConfigContextValue = [
  ProjectConfig | null,
  React.Dispatch<React.SetStateAction<ProjectConfig | null>>,
];

const projectConfigContext = createContext<ProjectConfigContextValue>([null, () => {}]);
const { Provider } = projectConfigContext;

export const useProjectConfig = () => useContext(projectConfigContext);

export function ProjectConfigProvider({ children }: { children: React.ReactNode }) {
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null);

  return <Provider value={[projectConfig, setProjectConfig]}>{children}</Provider>;
}

ProjectConfigProvider.propTypes = {
  children: PropTypes.any,
};

export default ProjectConfigProvider;

/**
 * Derives the route name from the browser address bar, e.g.
 * http://host:3000/viewer?StudyInstanceUIDs=... -> 'viewer'.
 * Falls back to 'viewer' when no path segment is available.
 */
function getRouteNameFromUrl(): string {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const segments = path.split('/').filter(Boolean);
  return segments[0] || 'viewer';
}

/**
 * Returns the toolNames that are checked (ischecked === true) for the mode
 * whose `routeName` equals `routeName`. When not provided, the route name is
 * read from the browser address bar.
 */
export function getCheckedToolNames(
  projectConfig: ProjectConfig | null,
  routeName = getRouteNameFromUrl()
): Set<string> {
  const dicomConfig = projectConfig?.dicom_config ?? null;
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
 * Hook variant: reads the projectConfig from context and returns the filtered
 * list of measurement tool names for the given route (defaults to 'viewer').
 * When no config / no matching mode is available, the original list is
 * returned untouched.
 */
export function useCheckedMeasurementTools(
  measurementTools: string[],
  routeName = getRouteNameFromUrl()
): string[] {
  const [projectConfig] = useProjectConfig() as unknown as [
    ProjectConfig | null,
    (value: unknown) => void,
  ];

  const checkedToolNames = getCheckedToolNames(projectConfig, routeName);

  if (checkedToolNames.size === 0) {
    return measurementTools;
  }

  return measurementTools.filter(toolName => checkedToolNames.has(toolName));
}
