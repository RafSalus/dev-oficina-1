// Estilo padrão do react-select alinhado às Diretrizes do Sistema (Regras 4, 6 e 7)
// Paleta: Branco (#ffffff), Preto/Navy (#101828), Azul Oficial (#0284c7), sem verde

export const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    height: '40px',
    backgroundColor: state.isDisabled ? '#f2f4f7' : state.isFocused ? '#ffffff' : '#f8fafc',
    borderColor: state.isFocused ? '#0284c7' : '#d0d5dd',
    borderWidth: '1px',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(2, 132, 199, 0.15)' : 'none',
    fontSize: '13px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    ':hover': {
      borderColor: state.isFocused ? '#0284c7' : '#98a2b3',
      backgroundColor: state.isDisabled ? '#f2f4f7' : '#ffffff',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: '40px',
    padding: '0 12px',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    color: '#101828',
    fontSize: '13px',
    fontWeight: '600',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#98a2b3',
    fontSize: '13px',
    fontWeight: '500',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontSize: '13px',
    fontWeight: '600',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '40px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '4px 8px',
    color: '#667085',
    ':hover': { color: '#0284c7' },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '4px 6px',
    color: '#667085',
    ':hover': { color: '#101828' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '14px',
    border: '1px solid #e4e7ec',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    zIndex: 9999,
    backgroundColor: '#ffffff',
    marginTop: '4px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
    maxHeight: '220px',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '12.5px',
    fontWeight: state.isSelected ? '700' : '500',
    backgroundColor: state.isSelected
      ? '#0284c7'
      : state.isFocused
      ? '#e0f2fe'
      : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#101828',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
    ':active': {
      backgroundColor: state.isSelected ? '#0284c7' : '#bae6fd',
    },
  }),
}
