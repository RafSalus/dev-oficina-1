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
//
// Secrets obrigatórios (npx supabase secrets set ...):
//   SITE_URL         URL pública do app, usada no link do convite (ex.: https://app.oficina.com.br)
//   ALLOWED_ORIGINS  Origens autorizadas a chamar a function, separadas por vírgula
//
// Segurança: o papel é gravado em app_metadata (só o servidor altera). user_metadata é
// editável pelo próprio usuário e nunca é usado para autorização.

import { createClient } from 'npm:@supabase/supabase-js@2'

const ORIGENS_PERMITIDAS = (Deno.env.get('ALLOWED_ORIGINS') || '')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean)

function corsHeaders(req: Request): Record<string, string> {
  const origem = req.headers.get('origin') || ''
  return {
    'Access-Control-Allow-Origin': ORIGENS_PERMITIDAS.includes(origem) ? origem : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
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

Deno.serve(async (req) => {
  const jsonResponse = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, message: 'Método não permitido.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const siteUrl = Deno.env.get('SITE_URL')
  if (!supabaseUrl || !serviceRoleKey || !siteUrl) {
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
  const callerRole = callerData.user.app_metadata?.role
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

  // O link do convite usa somente SITE_URL, nunca o header Origin da requisição.
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    funcionario.email,
    {
      data: {
        nome: funcionario.nome,
        cargoLabel: funcionario.cargo_label,
      },
      redirectTo: `${siteUrl.replace(/\/$/, '')}/gestao/redefinir-senha`,
    }
  )

  if (inviteError || !inviteData?.user) {
    console.error('Erro ao convidar funcionário:', inviteError)
    return jsonResponse({ ok: false, message: 'Erro ao enviar convite por e-mail.' }, 500)
  }

  const { error: papelError } = await supabaseAdmin.auth.admin.updateUserById(inviteData.user.id, {
    app_metadata: { role: papel },
  })
  if (papelError) {
    console.error('Erro ao definir papel do funcionário:', papelError)
    return jsonResponse({ ok: false, message: 'Conta criada, mas houve erro ao definir o papel de acesso.' }, 500)
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
