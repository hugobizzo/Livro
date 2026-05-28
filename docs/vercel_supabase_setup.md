# Setup Vercel e Supabase

## Estado atual

O app local esta em `livro-magico-app`.

O repositorio GitHub informado e `hugobizzo/Livro`. Se ele estiver vazio, primeiro precisamos enviar o conteudo desta pasta para esse repositorio.

## Vercel

Na tela de importacao:

- Project name: `livro-app` ou `livro-magico`
- Framework/Application Preset: `Next.js`
- Root Directory:
  - use `./` se o repositorio GitHub tiver o conteudo de `livro-magico-app` na raiz;
  - use `livro-magico-app` se o repositorio GitHub tiver essa pasta dentro dele.
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: deixar em branco/automatico.

Se o Vercel mostrar `Application Preset: Other`, normalmente significa que ele nao encontrou `package.json`/Next.js no root selecionado.

## Variaveis no Vercel

Adicionar em Production e Preview:

```env
NEXT_PUBLIC_APP_NAME=Livro Magico
NEXT_PUBLIC_SUPABASE_URL=<url do projeto Supabase>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key do projeto Supabase>
SUPABASE_SERVICE_ROLE_KEY=<service role key do projeto Supabase>
UPLOAD_RETENTION_DAYS=30
```

Quando tivermos dominio final:

```env
NEXT_PUBLIC_APP_URL=https://seu-dominio
```

Enquanto nao tiver dominio:

```env
NEXT_PUBLIC_APP_URL=https://livro-app.vercel.app
```

Nunca colocar `SUPABASE_SERVICE_ROLE_KEY` em variavel com prefixo `NEXT_PUBLIC_`.

## Supabase

No projeto novo:

1. Abrir SQL Editor.
2. Rodar `supabase/migrations/0001_initial_schema.sql`.
3. Conferir que as tabelas foram criadas.
4. Conferir que os buckets privados existem:
   - `original-uploads`
   - `generated-assets`
   - `print-packages`

## Auth

Para MVP, comecar com email/senha ou magic link. Google login pode entrar logo depois.

Antes de producao:

- configurar Site URL no Supabase Auth;
- adicionar Redirect URLs do Vercel;
- configurar template de email;
- criar o primeiro usuario admin e marcar `profiles.role = 'admin'`.

## Chave service role

A chave de `service_role` deve ser tratada como segredo administrativo. Se ela for exposta fora do ambiente seguro, rotacionar no Supabase antes de producao.
