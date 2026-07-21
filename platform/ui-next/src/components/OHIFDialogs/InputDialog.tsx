import React, { createContext, useContext, useRef, useEffect } from 'react';
import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Label,
  Input as InputComponent,
  FooterAction,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
} from '../../components';
import { cn } from '../../lib/utils';

interface InputDialogContextValue {
  value: string;
  setValue: (value: string) => void;
  submitOnEnter?: boolean;
}

const InputDialogContext = createContext<InputDialogContextValue | null>(null);

export type InputDialogRootProps = {
  /** The controlled value of the input */
  value?: string;
  /** The default value for uncontrolled usage */
  defaultValue?: string;
  /** Callback when input value changes */
  onChange?: (value: string) => void;
  /** Optional className for the root container */
  className?: string;
  /** Enable save on Enter key press */
  submitOnEnter?: boolean;
  children: React.ReactNode;
};

const InputDialogRoot = React.forwardRef<HTMLDivElement, InputDialogRootProps>(
  ({ value, defaultValue = '', onChange, className, submitOnEnter, children }, ref) => {
    const [internalValue, setInternalValue] = useControllableState({
      prop: value,
      defaultProp: defaultValue,
      onChange,
    });

    return (
      <InputDialogContext.Provider
        value={{
          value: internalValue,
          setValue: setInternalValue,
          submitOnEnter,
        }}
      >
        <div
          ref={ref}
          className={cn('flex flex-col', className)}
        >
          {children}
        </div>
      </InputDialogContext.Provider>
    );
  }
);

InputDialogRoot.displayName = 'InputDialog';

export interface InputDialogFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional className for the field container */
  className?: string;
  children: React.ReactNode;
}

const Field = React.forwardRef<HTMLDivElement, InputDialogFieldProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-4 flex flex-col space-y-2', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Field.displayName = 'InputDialog.Field';

export interface InputDialogInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /** ID for the input field */
  id?: string;
  /** Optional className for the input container */
  className?: string;
  /** Save handler */
  onSave?: (value: string) => void;
  /** Placeholder text for the input field */
  placeholder?: string;
}

const InputDialogInput = React.forwardRef<HTMLInputElement, InputDialogInputProps>(
  ({ id = 'dialog-input', className, onSave, ...props }, ref) => {
    const context = useContext(InputDialogContext);
    if (!context) {
      throw new Error('InputDialog.Input must be used within an InputDialog');
    }

    const { value, setValue } = context;
    const inputRef = useRef<HTMLInputElement>(null);

    // Combine the forwarded ref with our local ref
    React.useImperativeHandle(ref, () => inputRef.current);

    // Focus the input when it mounts
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (context.submitOnEnter && e.key === 'Enter') {
        e.preventDefault();
        const saveButton = document.querySelector(
          '[data-cy="input-dialog-save-button"]'
        ) as HTMLButtonElement;
        if (saveButton) {
          saveButton.click();
        }
      }
    };

    return (
      <div className={cn('w-full', className)}>
        <InputComponent
          ref={inputRef}
          id={id}
          data-cy={id}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          {...props}
        />
      </div>
    );
  }
);

InputDialogInput.displayName = 'InputDialog.Input';

export interface InputDialogLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Optional className for the label */
  className?: string;
  /** For attribute to match input ID */
  htmlFor?: string;
  children: React.ReactNode;
}

const InputDialogLabel = React.forwardRef<HTMLLabelElement, InputDialogLabelProps>(
  ({ className, htmlFor = 'dialog-input', children, ...props }, ref) => {
    return (
      <Label
        ref={ref}
        className={cn(className)}
        htmlFor={htmlFor}
        {...props}
      >
        {children}
      </Label>
    );
  }
);

InputDialogLabel.displayName = 'InputDialog.Label';

export interface InputDialogActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional className for the actions container */
  className?: string;
  children: React.ReactNode;
}

const Actions = React.forwardRef<HTMLDivElement, InputDialogActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
      >
        <FooterAction className={cn(className)}>
          <FooterAction.Right>{children}</FooterAction.Right>
        </FooterAction>
      </div>
    );
  }
);

Actions.displayName = 'InputDialog.Actions';

export interface InputDialogActionButtonProps {
  /** Optional className for the button */
  className?: string;
  /** Click handler that receives the current input value */
  onClick: (value: string) => void;
  children: React.ReactNode;
}

const ActionsSecondary = React.forwardRef<HTMLDivElement, InputDialogActionButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const context = useContext(InputDialogContext);
    if (!context) {
      throw new Error('InputDialog.ActionsSecondary must be used within an InputDialog');
    }

    const { value } = context;

    return (
      <div
        ref={ref}
        {...props}
      >
        <FooterAction.Secondary
          onClick={() => onClick(value)}
          className={cn(className)}
        >
          {children}
        </FooterAction.Secondary>
      </div>
    );
  }
);

ActionsSecondary.displayName = 'InputDialog.ActionsSecondary';

const ActionsPrimary = React.forwardRef<HTMLDivElement, InputDialogActionButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const context = useContext(InputDialogContext);
    if (!context) {
      throw new Error('InputDialog.ActionsPrimary must be used within an InputDialog');
    }

    const { value } = context;
    return (
      <div
        ref={ref}
        {...props}
        data-cy="input-dialog-save-button"
        onClick={() => onClick(value)}
      >
        <FooterAction.Primary
          onClick={() => onClick(value)}
          className={cn(className)}
        >
          {children}
        </FooterAction.Primary>
      </div>
    );
  }
);

ActionsPrimary.displayName = 'InputDialog.ActionsPrimary';

export interface InputDialogComboboxOption {
  /** The value stored in the dialog when this option is selected */
  value: string;
  /** The human-readable label shown in the list and trigger */
  label: string;
}

export interface InputDialogComboboxProps {
  /** Options to display in the combobox */
  data?: InputDialogComboboxOption[];
  /** Placeholder text shown when no option is selected */
  placeholder?: string;
  /** Optional className for the trigger button */
  className?: string;
  /** Disable the combobox */
  disabled?: boolean;
  /** Optional callback fired when the selected value changes */
  onValueChange?: (value: string) => void;
}

const InputDialogCombobox = React.forwardRef<HTMLButtonElement, InputDialogComboboxProps>(
  (
    { data = [], placeholder = 'Select item...', className, disabled, onValueChange },
    ref
  ) => {
    const context = useContext(InputDialogContext);
    if (!context) {
      throw new Error('InputDialog.Combobox must be used within an InputDialog');
    }

    const { value, setValue } = context;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');

    const trimmedQuery = query.trim();
    const selectedLabel =
      (value && data.find(item => item.value === value)?.label) || value || placeholder;

    // Show a "Create" entry when the typed text does not exactly match an option
    const showCreate =
      trimmedQuery.length > 0 &&
      !data.some(item => item.label.toLowerCase() === trimmedQuery.toLowerCase());

    const handleSelect = (currentValue: string) => {
      const newValue = currentValue === value ? '' : currentValue;
      setValue(newValue);
      onValueChange?.(newValue);
      setOpen(false);
    };

    return (
      <Popover
        open={open}
        onOpenChange={nextOpen => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setQuery('');
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn('w-full justify-between', className)}
          >
            {selectedLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command
            filter={(itemValue, search) => {
              const item = data.find(d => d.value === itemValue);
              // The "Create" item (typed query) is not in `data`, always keep it
              if (!item) {
                return 1;
              }
              return item.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
            }}
          >
            <CommandInput
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={query}
              onValueChange={setQuery}
            />
            <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {data.map(item => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === item.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
                {showCreate && (
                  <CommandItem
                    key="__create__"
                    value={trimmedQuery}
                    onSelect={() => handleSelect(trimmedQuery)}
                  >
                    Create &quot;{trimmedQuery}&quot;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

InputDialogCombobox.displayName = 'InputDialog.Combobox';

export const InputDialog = Object.assign(InputDialogRoot, {
  Label: InputDialogLabel,
  Input: InputDialogInput,
  Combobox: InputDialogCombobox,
  Field,
  Actions,
  ActionsSecondary,
  ActionsPrimary,
});
