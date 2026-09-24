// Edge Function: criar-login-funcionario
//
// Provisiona a conta real de login (Supabase Auth) de um colaborador já cadastrado na tabela
// `funcionarios`. É a ÚNICA peça do sistema autorizada a usar a service_role key — ela nunca é
// exposta ao navegador (client-side usa apenas a anon key, ver src/lib/supabase.js).
//
// Fluxo: o admin cadastra o funcionário (dados de RH, sem senha) e clica em "Criar acesso".
// O frontend chama esta function via supabase.functions.invoke(), que:
//   1. Verifica que quem está chamando é um usuário autenticado com role 'admin'.
//   2. Busca o funcionário pelo id (bypassando RLS, via service role).
//   3. Mapeia o cargo de RH para o papel (role) do portal (ver PAPEL_POR_CARGO).
//   4. Convida o funcionário por e-mail (auth.admin.inviteUserByEmail) — ele define a própria
//      senha ao clicar no link, sem que o admin fique sabendo a senha de ninguém.
//   5. Grava o auth_user_id de volta na tabela `funcionarios`.
//
// Deploy: npx supabase functions deploy criar-login-funcionario
// (SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são injetadas automaticamente pelo runtime da
// Edge Function — não precisam ser configuradas manualmente como secret.)

import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Espelha PAPEL_POR_CARGO de src/repositories/funcionariosRepository.js — Deno Edge Functions
// rodam isoladas do bundle do Vite, não podem importar do frontend, por isso duplicado aqui.
const PAPEL_POR_CARGO: Record<string, string> = {
  analista: 'admin',
  gerente: 'mecanico',
  mecanico: 'mecanico',
  aux_mecanico: 'mecanico',
  secretaria: 'secretaria',
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, message: 'Método não permitido.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, message: 'Configuração do servidor incompleta.' }, 500)
  }

  const authHeader = req.headers.get('Authorization') || ''
  const callerToken = authHeader.replace(/^Bearer\s+/i, '')
  if (!callerToken) {
    return jsonResponse({ ok: false, message: 'Não autenticado.' }, 401)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Autorização: só admin pode provisionar login de funcionário.
  const { data: callerData, error: callerError } = await supabaseAdmin.auth.getUser(callerToken)
  if (callerError || !callerData?.user) {
    return jsonResponse({ ok: false, message: 'Sessão inválida ou expirada.' }, 401)
  }
  const callerRole = callerData.user.user_metadata?.role || callerData.user.role
  if (callerRole !== 'admin') {
    return jsonResponse({ ok: false, message: 'Apenas o administrador pode criar acessos de login.' }, 403)
  }

  let body: { funcionarioId?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ ok: false, message: 'Corpo da requisição inválido.' }, 400)
  }

  const funcionarioId = body.funcionarioId
  if (!funcionarioId) {
    return jsonResponse({ ok: false, message: 'funcionarioId é obrigatório.' }, 400)
  }

  const { data: funcionario, error: funcionarioError } = await supabaseAdmin
    .from('funcionarios')
    .select('id, nome, email, cargo, cargo_label, auth_user_id')
    .eq('id', funcionarioId)
    .single()

  if (funcionarioError || !funcionario) {
    return jsonResponse({ ok: false, message: 'Funcionário não encontrado.' }, 404)
  }
  if (funcionario.auth_user_id) {
    return jsonResponse({ ok: false, message: 'Este funcionário já possui um acesso de login.' }, 409)
  }
  if (!funcionario.email) {
    return jsonResponse({ ok: false, message: 'Cadastre um e-mail para este funcionário antes de criar o acesso.' }, 400)
  }

  const papel = PAPEL_POR_CARGO[funcionario.cargo]
  if (!papel) {
    return jsonResponse({ ok: false, message: `Cargo "${funcionario.cargo}" não mapeado para um papel de portal.` }, 400)
  }

  const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || ''
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    funcionario.email,
    {
      data: {
        role: papel,
        nome: funcionario.nome,
        cargoLabel: funcionario.cargo_label,
      },
      redirectTo: origin ? `${origin}/gestao/redefinir-senha` : undefined,
    }
  )

  if (inviteError || !inviteData?.user) {
    return jsonResponse({ ok: false, message: inviteError?.message || 'Erro ao enviar convite por e-mail.' }, 500)
  }

  const { error: updateError } = await supabaseAdmin
    .from('funcionarios')
    .update({ auth_user_id: inviteData.user.id })
    .eq('id', funcionarioId)

  if (updateError) {
    return jsonResponse(
      { ok: false, message: 'Conta criada, mas houve erro ao vincular ao cadastro. Contate o suporte.' },
      500
    )
  }

  return jsonResponse({ ok: true, authUserId: inviteData.user.id })
})
