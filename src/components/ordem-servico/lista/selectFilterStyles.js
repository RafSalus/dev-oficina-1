/**
 * Estilos sóbrios do react-select dos filtros da lista de OS (SYSTEM_RULES.md).
 */
export const selectFilterStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '38px',
    height: '38px',
    backgroundColor: '#ffffff',
    borderColor: state.isFocused ? '#0284c7' : '#d0d5dd',
    borderRadius: '0.75rem',
    boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#0284c7' : '#98a2b3',
    },
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: '180px',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 10px',
    height: '38px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    border: '1px solid #d0d5dd',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    zIndex: 9999,
    overflow: 'hidden',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '220px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#101828' : state.isFocused ? '#f2f4f7' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#101828',
    fontSize: '0.8125rem',
    fontWeight: state.isSelected ? '700' : '500',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '0.375rem',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: '600',
  }),
}
