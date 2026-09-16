import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NoticeProvider } from './context/NoticeContext'
import { AdminAuthProvider } from './context/AdminAuthContext'

import { LandingPage } from './pages/LandingPage'
import { ClienteEntrarPage } from './pages/ClienteEntrarPage'
import { GestaoEntrarPage } from './pages/GestaoEntrarPage'
import { GestaoRecuperarSenhaPage } from './pages/GestaoRecuperarSenhaPage'
import { GestaoAcessoNegadoPage } from './pages/GestaoAcessoNegadoPage'

import { DashboardLayout } from './layouts/DashboardLayout'
import { DashboardPage } from './pages/dashboard/DashboardPage'

export default function App() {
  return (
    <NoticeProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public landing and client routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/cliente/entrar" element={<ClienteEntrarPage />} />
            <Route path="/cliente/recuperar-senha" element={<Navigate to="/cliente/entrar" replace />} />

            {/* Management Auth routes */}
            <Route path="/gestao/entrar" element={<GestaoEntrarPage />} />
            <Route path="/gestao/recuperar-senha" element={<GestaoRecuperarSenhaPage />} />
            <Route path="/gestao/acesso-negado" element={<GestaoAcessoNegadoPage />} />

            {/* Post-login Management Workspace with Shell (Header + Sidebar + Center + Footer) */}
            <Route path="/gestao" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/gestao/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="agenda" element={<DashboardPage />} />
              <Route path="ordem-de-servico" element={<DashboardPage />} />
              <Route path="pdv" element={<DashboardPage />} />
              <Route path="clientes" element={<DashboardPage />} />
              <Route path="veiculos" element={<DashboardPage />} />
              <Route path="estacionados" element={<DashboardPage />} />
              <Route path="leva-e-traz" element={<DashboardPage />} />
              <Route path="manutencao-preventiva" element={<DashboardPage />} />
              <Route path="garantias" element={<DashboardPage />} />
              <Route path="ferramentas" element={<DashboardPage />} />
              <Route path="pecas-danificadas" element={<DashboardPage />} />
              <Route path="estoque" element={<DashboardPage />} />
              <Route path="compras" element={<DashboardPage />} />
              <Route path="despesas" element={<DashboardPage />} />
              <Route path="nota-fiscal" element={<DashboardPage />} />
              <Route path="relatorios" element={<DashboardPage />} />
              <Route path="funcionarios" element={<DashboardPage />} />
              <Route path="configuracoes" element={<DashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </NoticeProvider>
  )
}
