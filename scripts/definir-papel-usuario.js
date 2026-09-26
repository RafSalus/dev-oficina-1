#!/usr/bin/env node
/**
 * Script de conveniência para gerenciar o papel (role) de usuários no Supabase Auth.
 * 
 * Uso:
 *   node scripts/definir-papel-usuario.js <email> [admin|secretaria|mecanico]
 *   node scripts/definir-papel-usuario.js --list
 * 
 * Exemplo:
 *   npm run auth:role admin@mecanicagabriel.com.br admin
 */

import fs from 'node:fs'
import path from 'node:path'

const PAPEIS_PERMITIDOS = ['admin', 'secretaria', 'mecanico']

function carregarEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return {}
  const conteudo = fs.readFileSync(envPath, 'utf8')
  const env = {}
  for (const linha of conteudo.split('\n')) {
    const trimmed = linha.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx !== -1) {
      const chave = trimmed.substring(0, idx).trim()
      let valor = trimmed.substring(idx + 1).trim()
      if (
        (valor.startsWith('"') && valor.endsWith('"')) ||
        (valor.startsWith("'") && valor.endsWith("'"))
      ) {
        valor = valor.slice(1, -1)
      }
      env[chave] = valor
    }
  }
  return env
}

const env = { ...carregarEnv(), ...process.env }
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL || ''
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || ''

const args = process.argv.slice(2)

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
Uso do utilitário de papéis Supabase Auth:
  node scripts/definir-papel-usuario.js <email> [admin|secretaria|mecanico]
  node scripts/definir-papel-usuario.js --list

Exemplos:
  node scripts/definir-papel-usuario.js usuario@oficina.com admin
  node scripts/definir-papel-usuario.js recepcionista@oficina.com secretaria
  node scripts/definir-papel-usuario.js --list
`)
  process.exit(0)
}

const targetEmail = args[0] !== '--list' ? args[0].trim().toLowerCase() : null
const targetRole = (args[1] || 'admin').trim().toLowerCase()

if (targetEmail && !PAPEIS_PERMITIDOS.includes(targetRole)) {
  console.error(`❌ Papel inválido: "${targetRole}". Papéis permitidos: ${PAPEIS_PERMITIDOS.join(', ')}`)
  process.exit(1)
}

function temCaracteresMascarados(str) {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 127) return true
  }
  return str.includes('sua_chave') || str.includes('••••')
}

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL não configurada no .env.')
  process.exit(1)
}

if (!serviceRoleKey || temCaracteresMascarados(serviceRoleKey)) {
  console.warn(`
⚠️  A SUPABASE_SERVICE_ROLE_KEY no seu arquivo .env está ausente ou contém máscara/pontos (•).
Isso acontece com frequência ao copiar o campo com senha oculta no painel do Supabase.

Como resolver:
  1. No painel do Supabase: acesse Project Settings > API > service_role (secret) e clique no ícone de COPIAR.
  2. Cole o valor real em SUPABASE_SERVICE_ROLE_KEY no seu .env.

Alternativamente, execute o SQL diretamente no SQL Editor do Supabase Cloud:
--------------------------------------------------------------------------------
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', '${targetRole}')
WHERE email = '${targetEmail || 'SEU_EMAIL_AQUI'}';
--------------------------------------------------------------------------------
`)
  process.exit(1)
}

async function chamarAdminApi(endpoint, options = {}) {
  const url = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/admin${endpoint}`
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Supabase (${response.status}): ${errorText}`)
  }
  return response.json()
}

async function main() {
  try {
    console.log(`Conectando ao Supabase (${supabaseUrl})...`)
    const data = await chamarAdminApi('/users?per_page=100')
    const users = data.users || []

    if (args.includes('--list')) {
      console.log(`\n📋 Usuários cadastrados (${users.length}):`)
      if (users.length === 0) {
        console.log('  Nenhum usuário encontrado.')
      } else {
        for (const u of users) {
          const role = u.app_metadata?.role || '(nenhum papel)'
          console.log(`  - ${u.email} [ID: ${u.id}] -> Role: ${role}`)
        }
      }
      return
    }

    const user = users.find((u) => u.email?.toLowerCase() === targetEmail)
    if (!user) {
      console.error(`❌ Usuário com e-mail "${targetEmail}" não encontrado no Supabase Auth.`)
      console.log('\nUsuários disponíveis:')
      for (const u of users) {
        console.log(`  - ${u.email}`)
      }
      process.exit(1)
    }

    console.log(`Atualizando permissões de "${targetEmail}" para role "${targetRole}"...`)
    const updatedMetadata = {
      ...(user.app_metadata || {}),
      role: targetRole,
    }

    await chamarAdminApi(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        app_metadata: updatedMetadata,
      }),
    })

    console.log(`\n✅ Sucesso! O papel "${targetRole}" foi atribuído a "${targetEmail}".`)
    console.log(`
👉 ATENÇÃO:
   Se você já estiver logado no navegador, clique em "Encerrar sessão" e faça o login novamente com seu token MFA.
   Isso atualizará o JWT da sessão no navegador com as novas permissões de acesso ao painel de gestão.
`)
  } catch (err) {
    console.error(`❌ Erro ao atualizar usuário: ${err.message}`)
    process.exit(1)
  }
}

main()
