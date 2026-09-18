// Estilo padrão do react-select reutilizado por todas as etapas mobile da Nova OS.
// Mantém a mesma identidade visual (branco/preto/azul) usada na versão desktop,
// com alvos de toque maiores (48px) adequados para o dedo.
export const mobileSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '48px',
    backgroundColor: state.isDisabled ? '#f2f4f7' : '#f8fafc',
    borderColor: state.isFocused ? '#101828' : '#d0d5dd',
    borderWidth: '1px',
    borderRadius: '14px',
    boxShadow: state.isFocused ? '0 0 0 1px #101828' : 'none',
    fontSize: '14px',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 14px',
  }),
  input: (base) => ({
    ...base,
    margin: '0px',
    color: '#101828',
    fontSize: '16px',
    fontWeight: '600',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '46px',
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '16px',
    border: '1px solid #e4e7ec',
    boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.12)',
    zIndex: 60,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: '6px',
  }),
  menuList: (base) => ({
    ...base,
    padding: '2px',
    maxHeight: '260px',
  }),
  option: (base, state) => ({
    ...base,
    borderRadius: '10px',
    fontSize: '13.5px',
    fontWeight: state.isSelected ? 700 : 500,
    backgroundColor: state.isSelected ? '#101828' : state.isFocused ? '#f2f4f7' : 'transparent',
    color: state.isSelected ? '#ffffff' : '#101828',
    padding: '11px 14px',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#101828',
    fontWeight: 700,
    fontSize: '14px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#98a2b3',
    fontSize: '13.5px',
    fontWeight: 500,
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#e0f2fe',
    borderRadius: '8px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#0369a1',
    fontWeight: 700,
    fontSize: '12px',
  }),
}

export const inputBaseClass =
  'w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] rounded-xl px-3.5 h-12 text-sm font-semibold text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all'

export const textareaBaseClass =
  'w-full bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-white border border-[#d0d5dd] focus:border-[#101828] rounded-xl p-3.5 text-sm font-medium text-[#101828] placeholder-[#98a2b3] focus:outline-none transition-all resize-none leading-relaxed'

export const labelBaseClass = 'block text-xs font-bold uppercase tracking-wider text-[#344054] mb-1.5'
