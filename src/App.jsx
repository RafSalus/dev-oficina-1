import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NoticeProvider } from './context/NoticeContext'
import { AdminAuthProvider } from './context/AdminAuthContext'

import { LandingPage } from './pages/LandingPage'
import { ClienteEntrarPage } from './pages/ClienteEntrarPage'
import { GestaoEntrarPage } from './pages/GestaoEntrarPage'
import { GestaoRecuperarSenhaPage } from './pages/GestaoRecuperarSenhaPage'
import { GestaoAcessoNegadoPage } from './pages/GestaoAcessoNegadoPage'

export default function App() {
  return (
    <NoticeProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cliente/entrar" element={<ClienteEntrarPage />} />
            <Route path="/cliente/recuperar-senha" element={<Navigate to="/cliente/entrar" replace />} />

            <Route path="/gestao" element={<Navigate to="/gestao/entrar" replace />} />
            <Route path="/gestao/entrar" element={<GestaoEntrarPage />} />
            <Route path="/gestao/recuperar-senha" element={<GestaoRecuperarSenhaPage />} />
            <Route path="/gestao/acesso-negado" element={<GestaoAcessoNegadoPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </NoticeProvider>
  )
}
