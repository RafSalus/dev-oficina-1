import React from 'react'
import { Route, Navigate } from 'react-router-dom'

import { DashboardPage } from '../pages/dashboard/DashboardPage'
import AgendaPage from '../pages/dashboard/agenda/AgendaPage'
import { OrcamentoOSListPage } from '../pages/dashboard/orcamento/OrcamentoOSListPage'
import { PDVPage } from '../pages/dashboard/pdv/PDVPage'
import { ClientesPage } from '../pages/dashboard/clientes/ClientesPage'
import { VeiculosPage } from '../pages/dashboard/veiculos/VeiculosPage'
import { EstacionadosPage } from '../pages/dashboard/estacionados/EstacionadosPage'
import { LevaETrazPage } from '../pages/dashboard/leva-e-traz/LevaETrazPage'
import { ManutencaoPreventivaPage } from '../pages/dashboard/manutencao-preventiva/ManutencaoPreventivaPage'
import { EstoquePage } from '../pages/dashboard/suprimentos/EstoquePage'
import { ComprasPage } from '../pages/dashboard/suprimentos/ComprasPage'
import { CotacaoPage } from '../pages/dashboard/suprimentos/CotacaoPage'
import { ServicosPage } from '../pages/dashboard/suprimentos/ServicosPage'
import { PecasPage } from '../pages/dashboard/suprimentos/PecasPage'
import { TerceirosPage } from '../pages/dashboard/suprimentos/TerceirosPage'
import { FuncionariosPage } from '../pages/dashboard/funcionarios/FuncionariosPage'
import { GarantiasPage } from '../pages/dashboard/garantias/GarantiasPage'

/**
 * Renderiza o conjunto unificado de rotas operacionais compartilhadas
 * entre Gestão e Secretaria (Story 1.7).
 *
 * @param {'gestao'|'secretaria'} portal
 */
export function renderRotasOperacionais(portal = 'gestao') {
  const isGestao = portal === 'gestao'
  const basePath = isGestao ? '/gestao' : '/secretaria'

  return (
    <>
      <Route index element={<Navigate to={`${basePath}/dashboard`} replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="agenda" element={<AgendaPage />} />
      <Route path="ordem-de-servico" element={<OrcamentoOSListPage />} />
      <Route path="orcamento" element={<Navigate to={`${basePath}/ordem-de-servico`} replace />} />
      <Route path="orcamentos" element={<Navigate to={`${basePath}/ordem-de-servico`} replace />} />
      <Route path="pdv" element={<PDVPage />} />
      <Route path="clientes" element={<ClientesPage />} />
      <Route path="veiculos" element={<VeiculosPage />} />
      <Route path="estacionados" element={<EstacionadosPage />} />
      <Route path="leva-e-traz" element={<LevaETrazPage />} />
      <Route path="manutencao-preventiva" element={<ManutencaoPreventivaPage />} />
      <Route path="garantias" element={<GarantiasPage />} />
      <Route path="ferramentas" element={<DashboardPage />} />
      <Route path="pecas-danificadas" element={<DashboardPage />} />
      <Route path="estoque" element={<EstoquePage />} />
      <Route path="compras" element={<ComprasPage />} />
      <Route path="compras/cotacao/:id" element={<CotacaoPage />} />
      <Route path="compras/cotacao" element={<CotacaoPage />} />
      <Route path="servicos" element={<ServicosPage />} />
      <Route path="pecas" element={<PecasPage />} />
      <Route path="fornecedores" element={<TerceirosPage />} />
      <Route path="terceiros" element={<Navigate to={`${basePath}/fornecedores`} replace />} />
      <Route path="despesas" element={<DashboardPage />} />
      <Route path="nota-fiscal" element={<DashboardPage />} />

      {/* Regra 14: Telas restritas da Secretaria (Relatórios, Funcionários e Configurações) */}
      {isGestao ? (
        <>
          <Route path="relatorios" element={<DashboardPage />} />
          <Route path="funcionarios" element={<FuncionariosPage />} />
          <Route path="configuracoes" element={<DashboardPage />} />
        </>
      ) : (
        <>
          <Route path="relatorios" element={<Navigate to="/secretaria/dashboard" replace />} />
          <Route path="funcionarios" element={<Navigate to="/secretaria/dashboard" replace />} />
          <Route path="configuracoes" element={<Navigate to="/secretaria/dashboard" replace />} />
        </>
      )}
    </>
  )
}
