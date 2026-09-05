import React from 'react';
import _PhoneInput from 'react-phone-input-2';

const PhoneInput = _PhoneInput?.default || _PhoneInput;

export default function PhoneInputField({
  country = 'in',
  value = '',
  onChange,
  disabled = false,
  inputClass = '',
  buttonClass = '',
  containerClass = '',
  placeholder = '98201 44521',
  ...rest
}) {
  return (
    <PhoneInput
      country={country}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      inputClass={inputClass || '!w-full !h-11 !text-xs !bg-slate-50 !rounded-xl !border-slate-200 font-medium'}
      buttonClass={buttonClass || '!bg-slate-50 !border-slate-200 !rounded-l-xl'}
      containerClass={containerClass || '!w-full'}
      {...rest}
    />
  );
}
