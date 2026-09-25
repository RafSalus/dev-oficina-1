import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MobileNovaOrdemDeServicoPage } from '../../src/pages/dashboard/nova-os/mobile/MobileNovaOrdemDeServicoPage'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}))

describe('MobileNovaOrdemDeServicoPage Decomposta (Story 2.0b / ADR-003)', () => {
  it('renderiza cabeçalho, seções e permite navegação entre abas', () => {
    const updateFormData = vi.fn()
    const onFechar = vi.fn()
    const onSalvarFila = vi.fn()

    const formData = {
      numeroOS: '000199',
      clienteId: '',
      cliente: '',
      telefone: '',
      relatoCliente: '',
      checklistEntrada: {},
    }

    render(
      <MobileNovaOrdemDeServicoPage
        formData={formData}
        updateFormData={updateFormData}
        onFechar={onFechar}
        onSalvarFila={onSalvarFila}
      />
    )

    // Cabeçalho
    expect(screen.getByText('#000199')).toBeTruthy()
    expect(screen.getByText('1. Cliente e Veiculo')).toBeTruthy()
    expect(screen.getByText('2. Relato e Queixa')).toBeTruthy()
    expect(screen.getByText('3. Vistoria')).toBeTruthy()

    // Seção Inicial: Cliente
    expect(screen.getByText('Cliente do Atendimento')).toBeTruthy()

    // Navega para Relato
    fireEvent.click(screen.getByText('2. Relato e Queixa'))
    expect(screen.getByPlaceholderText(/descreva detalhadamente o defeito/i)).toBeTruthy()

    // Navega para Vistoria
    fireEvent.click(screen.getByText('3. Vistoria'))
    expect(screen.getByRole('button', { name: /todos ok/i })).toBeTruthy()

    // Clica em Todos OK
    fireEvent.click(screen.getByRole('button', { name: /todos ok/i }))
    expect(updateFormData).toHaveBeenCalledWith(
      expect.objectContaining({
        checklistEntrada: expect.any(Object),
      })
    )
  })
})
