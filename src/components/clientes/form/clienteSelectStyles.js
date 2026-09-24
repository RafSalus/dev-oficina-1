/**
 * Variações compactas do `customSelectStyles` usadas no formulário de cliente:
 * 36px para os campos de veículo (FIPE) e 38px para a UF do endereço.
 */
import { customSelectStyles } from '../../suprimentos/customSelectStyles'

function estiloComAltura(altura, fontSize) {
  return {
    ...customSelectStyles,
    control: (base, state) => ({
      ...customSelectStyles.control(base, state),
      minHeight: altura,
      height: altura,
      borderRadius: '6px',
      fontSize,
      backgroundColor: '#ffffff',
    }),
    valueContainer: (base) => ({
      ...customSelectStyles.valueContainer(base),
      height: altura,
      padding: '0 8px',
    }),
    indicatorsContainer: (base) => ({
      ...customSelectStyles.indicatorsContainer(base),
      height: altura,
    }),
    dropdownIndicator: (base) => ({
      ...customSelectStyles.dropdownIndicator(base),
      padding: '2px 4px',
    }),
  }
}

export const selectStylesCompacto = estiloComAltura('36px', '12px')
export const selectStylesUF = estiloComAltura('38px', '13px')
