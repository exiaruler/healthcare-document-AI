'use client'

import { Autocomplete, FormLabel, TextField } from "@mui/material";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface SearchableDropdownProps {
  value: DropdownOption | null;
  onChange: (value: DropdownOption | null) => void;
  options: Record<string,unknown>[];
  allowSearch?: boolean;
  label?: string;
  disabled?: boolean;
  displayKey:string;
  valueKey:string;
}

export default function DropDown({
  value,
  onChange,
  options,
  allowSearch = true,
  label = 'Select',
  disabled = false,
  displayKey,
  valueKey
}: SearchableDropdownProps){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toDropdown=(data:Array<Record<string,any>>)=>{
  return data.map(item => ({
    label: String(item[displayKey]),
    value: item[valueKey],
  }));


}
    return(
    <div className="Component">
    <FormLabel>{label}</FormLabel>
    <Autocomplete
      value={value}
      options={toDropdown(options)}
      getOptionLabel={(option) => option.label}
      onChange={(_, newValue) => onChange(newValue)}
      disableClearable={false}
      disabled={disabled}
      // If allowSearch = false, disable typing by making input readOnly
      renderInput={(params) => (
        <TextField
          {...params}
         
          inputProps={{
            ...params.inputProps,
            readOnly: !allowSearch,
          }}
        />
      )}
    />

        </div>
    )
}