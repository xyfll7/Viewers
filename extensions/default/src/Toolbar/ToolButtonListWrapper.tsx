import React from 'react';
import {
  ToolButtonList,
  ToolButton,
  ToolButtonListDefault,
  ToolButtonListDropDown,
  ToolButtonListItem,
  ToolButtonListDivider,
} from '@ohif/ui-next';
import { useToolbar } from '@ohif/core/src';
import { useCheckedMeasurementTools } from '@state';

interface ToolButtonListWrapperProps {
  buttonSection: string;
  onInteraction?: (details: { itemId: string; commands?: Record<string, unknown> }) => void;
  id: string;
}

/**
 * Wraps the ToolButtonList component to handle the OHIF toolbar button structure
 * @param props - Component props
 * @returns Component
 * // test
 */
export default function ToolButtonListWrapper({ buttonSection, id }: ToolButtonListWrapperProps) {
  const { onInteraction, toolbarButtons } = useToolbar({
    buttonSection,
  });

  if (!toolbarButtons?.length) {
    return null;
  }

  // For the MeasurementTools and MoreTools sections, keep only the tools that
  // are enabled (ischecked) in the projectConfig.dicom_config for the current mode.
  // The useCheckedMeasurementTools hook returns the set of checked tool names across
  // every group (MeasurementTools + MoreTools + ...), so the same set works for
  // both sections. Other sections are rendered as-is. The hook gracefully
  // returns the full list when no config / no matching mode is available, so
  // filtering is a no-op until projectConfig is loaded.
  const toolIds = React.useMemo(() => toolbarButtons.map(button => button.id), [toolbarButtons]);
  const checkedToolIds = useCheckedMeasurementTools(toolIds);
  const checkedToolSet = React.useMemo(() => new Set(checkedToolIds), [checkedToolIds]);

  const visibleToolbarButtons =
    buttonSection === 'MeasurementTools' || buttonSection === 'MoreTools'
      ? toolbarButtons.filter(button => checkedToolSet.has(button.id))
      : toolbarButtons;

  if (!visibleToolbarButtons.length) {
    return null;
  }

  const primary =
    visibleToolbarButtons.find(button => button.componentProps.isActive)?.componentProps ||
    visibleToolbarButtons[0].componentProps;

  const items = visibleToolbarButtons.map(button => button.componentProps);

  return (
    <ToolButtonList>
      <ToolButtonListDefault>
        <div
          data-cy={`${id}-split-button-primary`}
          data-tool={primary.id}
          data-active={primary.isActive}
        >
          <ToolButton
            {...primary}
            onInteraction={({ itemId }) =>
              onInteraction?.({ id, itemId, commands: primary.commands })
            }
            className={primary.className}
          />
        </div>
      </ToolButtonListDefault>
      <ToolButtonListDivider className={primary.isActive ? 'opacity-0' : 'opacity-100'} />
      <div data-cy={`${id}-split-button-secondary`}>
        <ToolButtonListDropDown>
          {items.map(item => {
            // `componentProps` contains internal-only flags (e.g. `visible`,
            // `commands`, `isActive`) that must NOT be forwarded to the DOM.
            // Only pass the props ToolButtonListItem understands plus data-* attrs.
            const { id: itemId, icon, label, tooltip, disabled, disabledText } = item;

            return (
              <ToolButtonListItem
                key={itemId}
                icon={icon}
                disabled={disabled}
                disabledText={disabledText}
                tooltip={tooltip}
                data-cy={itemId}
                data-tool={itemId}
                data-active={item.isActive}
                onSelect={() => onInteraction?.({ id, itemId, commands: item.commands })}
              >
                <span className="pl-1">{label || tooltip || itemId}</span>
              </ToolButtonListItem>
            );
          })}
        </ToolButtonListDropDown>
      </div>
    </ToolButtonList>
  );
}
