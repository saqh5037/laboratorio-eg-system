import { Switch } from '@headlessui/react';

export default function Toggle({ enabled, onChange, disabled = false, label, description }) {
  return (
    <Switch.Group>
      <div className="flex items-center justify-between">
        {label && (
          <div className="flex-1 mr-4">
            <Switch.Label className="text-sm font-medium text-gray-900 cursor-pointer">
              {label}
            </Switch.Label>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}
        <Switch
          checked={enabled}
          onChange={onChange}
          disabled={disabled}
          className={`
            ${enabled ? 'bg-eg-purple' : 'bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors focus:outline-none focus:ring-2 focus:ring-eg-purple focus:ring-offset-2
          `}
        >
          <span
            className={`
              ${enabled ? 'translate-x-6' : 'translate-x-1'}
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            `}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}
