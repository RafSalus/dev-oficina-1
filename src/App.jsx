import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NoticeProvider } from './context/NoticeContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { PwaStandaloneRedirect } from './components/PwaStandaloneRedirect'
import { PwaManifestSwitcher } from './components/PwaManifestSwitcher'

import { Toaster } from 'sonner'
import { CheckCircle, Info, WarningCircle, XCircle } from '@phosphor-icons/react'

import { LandingPage } from './pages/LandingPage'
import { ClienteEntrarPage } from './pages/ClienteEntrarPage'
import { GestaoEntrarPage } from './pages/GestaoEntrarPage'
import { GestaoRecuperarSenhaPage } from './pages/GestaoRecuperarSenhaPage'
import { GestaoAcessoNegadoPage } from './pages/GestaoAcessoNegadoPage'

import { DashboardLayout } from './layouts/DashboardLayout'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { NovaOrdemDeServicoPage } from './pages/dashboard/NovaOrdemDeServicoPage'
import { OrcamentoOSListPage } from './pages/dashboard/orcamento/OrcamentoOSListPage'
import { CotacaoAutoPecaPage } from './pages/CotacaoAutoPecaPage'
import { AprovacaoOrcamentoClientePage } from './pages/AprovacaoOrcamentoClientePage'
import { MecanicoLayout } from './layouts/MecanicoLayout'
import { MecanicoModulePlaceholder } from './components/mecanico/MecanicoModulePlaceholder'
import { ClienteLayout } from './layouts/ClienteLayout'
import { ClienteModulePlaceholder } from './components/cliente/ClienteModulePlaceholder'
import { ClienteServicosPage } from './pages/cliente/ClienteServicosPage'
import { SecretariaLayout } from './layouts/SecretariaLayout'
import { ServicosPage } from './pages/dashboard/suprimentos/ServicosPage'
import { PecasPage } from './pages/dashboard/suprimentos/PecasPage'
import { EstoquePage } from './pages/dashboard/suprimentos/EstoquePage'
import { ComprasPage } from './pages/dashboard/suprimentos/ComprasPage'
import { CotacaoPage } from './pages/dashboard/suprimentos/CotacaoPage'
import { TerceirosPage } from './pages/dashboard/suprimentos/TerceirosPage'
import { ClientesPage } from './pages/dashboard/clientes/ClientesPage'
import { VeiculosPage } from './pages/dashboard/veiculos/VeiculosPage'
import { EstacionadosPage } from './pages/dashboard/estacionados/EstacionadosPage'
import { LevaETrazPage } from './pages/dashboard/leva-e-traz/LevaETrazPage'
import { ManutencaoPreventivaPage } from './pages/dashboard/manutencao-preventiva/ManutencaoPreventivaPage'
import AgendaPage from './pages/dashboard/agenda/AgendaPage'
import { PDVPage } from './pages/dashboard/pdv/PDVPage'

export default function App() {
  return (
    <NoticeProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <PwaStandaloneRedirect />
          <PwaManifestSwitcher />
          <Toaster
            position="top-right"
            richColors={false}
            duration={3200}
            icons={{
              success: <CheckCircle size={18} weight="fill" className="text-[#0284c7]" />,
              info: <Info size={18} weight="fill" className="text-[#0284c7]" />,
              warning: <WarningCircle size={18} weight="fill" className="text-amber-400" />,
              error: <XCircle size={18} weight="fill" className="text-rose-400" />,
            }}
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#ffffff',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                fontSize: '12.5px',
                fontWeight: '600',
                padding: '12px 14px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
              },
            }}
          />
          <Routes>
            {/* Public landing, client, quotation and budget approval routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/cliente/entrar" element={<ClienteEntrarPage />} />
            <Route path="/cliente/recuperar-senha" element={<Navigate to="/cliente/entrar" replace />} />
            <Route path="/cotacao/:id" element={<CotacaoAutoPecaPage />} />
            <Route path="/cotacao" element={<CotacaoAutoPecaPage />} />
            <Route path="/aprovacao/:id" element={<AprovacaoOrcamentoClientePage />} />
            <Route path="/aprovacao" element={<AprovacaoOrcamentoClientePage />} />
            <Route path="/orcamento/:id" element={<AprovacaoOrcamentoClientePage />} />
            <Route path="/orcamento" element={<AprovacaoOrcamentoClientePage />} />

            {/* Management Auth routes */}
            <Route path="/gestao/entrar" element={<GestaoEntrarPage />} />
            <Route path="/gestao/recuperar-senha" element={<GestaoRecuperarSenhaPage />} />
            <Route path="/gestao/acesso-negado" element={<GestaoAcessoNegadoPage />} />

            {/* Post-login Management Workspace with Shell (Header + Sidebar + Center + Footer) */}
            <Route path="/gestao" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/gestao/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="ordem-de-servico" element={<OrcamentoOSListPage />} />
              <Route path="ordem-de-servico/nova" element={<NovaOrdemDeServicoPage />} />
              <Route path="orcamento" element={<Navigate to="/gestao/ordem-de-servico" replace />} />
              <Route path="orcamentos" element={<Navigate to="/gestao/ordem-de-servico" replace />} />
              <Route path="pdv" element={<PDVPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="veiculos" element={<VeiculosPage />} />
              <Route path="estacionados" element={<EstacionadosPage />} />
              <Route path="leva-e-traz" element={<LevaETrazPage />} />
              <Route path="manutencao-preventiva" element={<ManutencaoPreventivaPage />} />
              <Route path="garantias" element={<DashboardPage />} />
              <Route path="ferramentas" element={<DashboardPage />} />
              <Route path="pecas-danificadas" element={<DashboardPage />} />
              <Route path="estoque" element={<EstoquePage />} />
              <Route path="compras" element={<ComprasPage />} />
              <Route path="compras/cotacao/:id" element={<CotacaoPage />} />
              <Route path="compras/cotacao" element={<CotacaoPage />} />
              <Route path="servicos" element={<ServicosPage />} />
              <Route path="pecas" element={<PecasPage />} />
              <Route path="fornecedores" element={<TerceirosPage />} />
              <Route path="terceiros" element={<Navigate to="/gestao/fornecedores" replace />} />
              <Route path="despesas" element={<DashboardPage />} />
              <Route path="nota-fiscal" element={<DashboardPage />} />
              <Route path="relatorios" element={<DashboardPage />} />
              <Route path="funcionarios" element={<DashboardPage />} />
              <Route path="configuracoes" element={<DashboardPage />} />
            </Route>

            {/* Post-login Mechanic Workspace with Dedicated Menus and Layout */}
            <Route path="/mecanico" element={<MecanicoLayout />}>
              <Route index element={<Navigate to="/mecanico/dashboard" replace />} />
              <Route path="dashboard" element={<MecanicoModulePlaceholder />} />
              <Route path="agenda" element={<MecanicoModulePlaceholder />} />
              <Route path="ordens-servico" element={<MecanicoModulePlaceholder />} />
              <Route path="diagnostico" element={<MecanicoModulePlaceholder />} />
              <Route path="checklist" element={<MecanicoModulePlaceholder />} />
              <Route path="servicos" element={<MecanicoModulePlaceholder />} />
              <Route path="pedir-pecas" element={<MecanicoModulePlaceholder />} />
              <Route path="estoque" element={<MecanicoModulePlaceholder />} />
              <Route path="pecas-danificadas" element={<MecanicoModulePlaceholder />} />
              <Route path="ferramentas" element={<MecanicoModulePlaceholder />} />
              <Route path="clientes" element={<MecanicoModulePlaceholder />} />
              <Route path="leva-e-traz" element={<MecanicoModulePlaceholder />} />
              <Route path="comissoes" element={<MecanicoModulePlaceholder />} />
            </Route>

            {/* Post-login Customer Portal with Dedicated Menus and Layout */}
            <Route path="/cliente" element={<ClienteLayout />}>
              <Route index element={<Navigate to="/cliente/resumo" replace />} />
              <Route path="inicio" element={<Navigate to="/cliente/resumo" replace />} />
              <Route path="resumo" element={<ClienteModulePlaceholder />} />
              <Route path="veiculos" element={<ClienteModulePlaceholder />} />
              <Route path="servicos" element={<ClienteServicosPage />} />
              <Route path="manutencoes" element={<ClienteModulePlaceholder />} />
              <Route path="garantias" element={<ClienteModulePlaceholder />} />
              <Route path="historico" element={<ClienteModulePlaceholder />} />
              <Route path="posto" element={<ClienteModulePlaceholder />} />
              <Route path="agenda" element={<ClienteModulePlaceholder />} />
            </Route>

            {/* Post-login Secretaria Workspace (compartilha todas as telas da gestão, exceto relatórios, funcionários e configurações - Regra 14) */}
            <Route path="/secretaria" element={<SecretariaLayout />}>
              <Route index element={<Navigate to="/secretaria/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="ordem-de-servico" element={<OrcamentoOSListPage />} />
              <Route path="ordem-de-servico/nova" element={<NovaOrdemDeServicoPage />} />
              <Route path="orcamento" element={<Navigate to="/secretaria/ordem-de-servico" replace />} />
              <Route path="orcamentos" element={<Navigate to="/secretaria/ordem-de-servico" replace />} />
              <Route path="pdv" element={<PDVPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="veiculos" element={<VeiculosPage />} />
              <Route path="estacionados" element={<EstacionadosPage />} />
              <Route path="leva-e-traz" element={<LevaETrazPage />} />
              <Route path="manutencao-preventiva" element={<ManutencaoPreventivaPage />} />
              <Route path="garantias" element={<DashboardPage />} />
              <Route path="ferramentas" element={<DashboardPage />} />
              <Route path="pecas-danificadas" element={<DashboardPage />} />
              <Route path="estoque" element={<EstoquePage />} />
              <Route path="compras" element={<ComprasPage />} />
              <Route path="compras/cotacao/:id" element={<CotacaoPage />} />
              <Route path="compras/cotacao" element={<CotacaoPage />} />
              <Route path="servicos" element={<ServicosPage />} />
              <Route path="pecas" element={<PecasPage />} />
              <Route path="fornecedores" element={<TerceirosPage />} />
              <Route path="terceiros" element={<Navigate to="/secretaria/fornecedores" replace />} />
              <Route path="despesas" element={<DashboardPage />} />
              <Route path="nota-fiscal" element={<DashboardPage />} />
              {/* Telas restritas da Secretaria: Relatórios, Funcionários e Configurações (Regra 14) */}
              <Route path="relatorios" element={<Navigate to="/secretaria/dashboard" replace />} />
              <Route path="funcionarios" element={<Navigate to="/secretaria/dashboard" replace />} />
              <Route path="configuracoes" element={<Navigate to="/secretaria/dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </NoticeProvider>
  )
}
