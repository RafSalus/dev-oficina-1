import { customSelectStyles } from '../../suprimentos/customSelectStyles'

export const customSelectStylesCompact = {
  ...customSelectStyles,
  control: (base, state) => ({
    ...base,
    minHeight: '36px',
    height: '36px',
    fontSize: '12px',
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#0284c7' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#0284c7' : '#94a3b8',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '36px',
    padding: '0 8px',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '36px',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '12px',
    backgroundColor: state.isSelected
      ? '#0284c7'
      : state.isFocused
      ? '#f0f9ff'
      : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#1e293b',
    cursor: 'pointer',
  }),
}
