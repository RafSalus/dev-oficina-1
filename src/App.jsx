import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NoticeProvider } from './context/NoticeContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { ClienteProvider } from './context/ClienteContext'
import { PwaStandaloneRedirect } from './components/PwaStandaloneRedirect'
import { PwaManifestSwitcher } from './components/PwaManifestSwitcher'

import { Toaster } from 'sonner'
import { CheckCircle, Info, WarningCircle, XCircle } from '@phosphor-icons/react'

import { LandingPage } from './pages/LandingPage'
import { ClienteEntrarPage } from './pages/ClienteEntrarPage'
import { GestaoEntrarPage } from './pages/GestaoEntrarPage'
import { GestaoRecuperarSenhaPage } from './pages/GestaoRecuperarSenhaPage'
import { GestaoAcessoNegadoPage } from './pages/GestaoAcessoNegadoPage'
import { GestaoMfaConfigurarPage } from './pages/GestaoMfaConfigurarPage'
import { GestaoMfaVerificarPage } from './pages/GestaoMfaVerificarPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

import { DashboardLayout } from './layouts/DashboardLayout'
import { CotacaoAutoPecaPage } from './pages/CotacaoAutoPecaPage'
import { AprovacaoOrcamentoClientePage } from './pages/AprovacaoOrcamentoClientePage'
import { VistoriaEntradaClientePage } from './pages/VistoriaEntradaClientePage'
import { MecanicoLayout } from './layouts/MecanicoLayout'
import { MecanicoDashboardPage } from './pages/mecanico/MecanicoDashboardPage'
import { ClienteLayout } from './layouts/ClienteLayout'
import { ClienteModulePlaceholder } from './components/cliente/ClienteModulePlaceholder'
import { ClienteServicosRedirect } from './pages/cliente/ClienteServicosRedirect'
import { SecretariaLayout } from './layouts/SecretariaLayout'
import { renderRotasOperacionais } from './routes/rotasCompartilhadas'

export default function App() {
  return (
    <NoticeProvider>
      <AdminAuthProvider>
        <ClienteProvider>
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
            <Route path="/vistoria/:id" element={<VistoriaEntradaClientePage />} />

            {/* Management Auth routes */}
            <Route path="/gestao/entrar" element={<GestaoEntrarPage />} />
            <Route path="/gestao/recuperar-senha" element={<GestaoRecuperarSenhaPage />} />
            <Route path="/gestao/acesso-negado" element={<GestaoAcessoNegadoPage />} />
            <Route path="/gestao/mfa/configurar" element={<GestaoMfaConfigurarPage />} />
            <Route path="/gestao/mfa/verificar" element={<GestaoMfaVerificarPage />} />

            {/* Post-login Management Workspace with Shell (Header + Sidebar + Center + Footer) */}
            <Route
              path="/gestao"
              element={
                <ProtectedRoute portal="gestao">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {renderRotasOperacionais('gestao')}
            </Route>

            {/* Post-login Mechanic Workspace with Dedicated Menus and Layout */}
            <Route
              path="/mecanico"
              element={
                <ProtectedRoute portal="mecanico">
                  <MecanicoLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/mecanico/dashboard" replace />} />
              <Route path="dashboard" element={<MecanicoDashboardPage />} />
              <Route path="agenda" element={<MecanicoDashboardPage />} />
              <Route path="ordens-servico" element={<MecanicoDashboardPage />} />
              <Route path="diagnostico" element={<MecanicoDashboardPage />} />
              <Route path="checklist" element={<MecanicoDashboardPage />} />
              <Route path="servicos" element={<MecanicoDashboardPage />} />
              <Route path="pedir-pecas" element={<MecanicoDashboardPage />} />
              <Route path="estoque" element={<MecanicoDashboardPage />} />
              <Route path="pecas-danificadas" element={<MecanicoDashboardPage />} />
              <Route path="ferramentas" element={<MecanicoDashboardPage />} />
              <Route path="clientes" element={<MecanicoDashboardPage />} />
              <Route path="leva-e-traz" element={<MecanicoDashboardPage />} />
              <Route path="comissoes" element={<MecanicoDashboardPage />} />
            </Route>

            {/* Post-login Customer Portal with Dedicated Menus and Layout */}
            <Route
              path="/cliente"
              element={
                <ProtectedRoute portal="cliente">
                  <ClienteLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/cliente/resumo" replace />} />
              <Route path="inicio" element={<Navigate to="/cliente/resumo" replace />} />
              <Route path="resumo" element={<ClienteModulePlaceholder />} />
              <Route path="veiculos" element={<ClienteModulePlaceholder />} />
              <Route path="servicos" element={<ClienteServicosRedirect />} />
              <Route path="manutencoes" element={<ClienteModulePlaceholder />} />
              <Route path="garantias" element={<ClienteModulePlaceholder />} />
              <Route path="historico" element={<ClienteModulePlaceholder />} />
              <Route path="posto" element={<ClienteModulePlaceholder />} />
              <Route path="agenda" element={<ClienteModulePlaceholder />} />
            </Route>

            {/* Post-login Secretaria Workspace (compartilha rotas da gestão, com restrições da Regra 14) */}
            <Route
              path="/secretaria"
              element={
                <ProtectedRoute portal="secretaria">
                  <SecretariaLayout />
                </ProtectedRoute>
              }
            >
              {renderRotasOperacionais('secretaria')}
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </ClienteProvider>
      </AdminAuthProvider>
    </NoticeProvider>
  )
}
