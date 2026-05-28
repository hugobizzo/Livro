# Arquitetura de producao - Livro Magico

Este documento registra a direcao tecnica do app para sair do prototipo local e virar um produto publicado, mantendo isolamento total de outros aplicativos.

## Decisao principal

Usar a mesma conta pessoal/empresa em Vercel, Supabase ou OpenAI pode ser aceitavel no inicio, mas o Livro Magico deve ter projetos, variaveis, bancos, buckets, webhooks e chaves proprias.

Se a empresa for formalizada depois, o ideal e mover tudo para uma organizacao/workspace da empresa.

## Ordem recomendada

1. Fechar o fluxo do cliente no prototipo local.
2. Criar um projeto Vercel novo para o Livro Magico.
3. Criar um projeto Supabase novo para o Livro Magico.
4. Conectar autenticacao e banco.
5. Conectar storage privado para fotos, imagens geradas e PDFs.
6. Conectar geracao de historia/imagens em rotas de servidor.
7. Conectar Mercado Pago em sandbox.
8. Criar geracao de pacote grafico: PDF, ZIP, QR e serial.
9. Publicar beta fechado.

## Vercel

Criar um projeto novo, apontando para este repositorio/app. As variaveis devem ser configuradas por ambiente: Development, Preview e Production.

Variaveis sensiveis ficam no servidor. Variaveis com prefixo `NEXT_PUBLIC_` podem ir para o navegador e, por isso, devem ser tratadas como publicas.

## Supabase

Criar um projeto novo, com Postgres, Auth e Storage proprios.

Tabelas iniciais sugeridas:

- `profiles`: dados basicos do usuario logado.
- `orders`: pedido, status, financeiro, endereco, serial e QR.
- `order_characters`: personagens por pedido.
- `order_assets`: fotos originais, referencias, imagens geradas e PDFs.
- `story_pages`: texto, cena, emocao e status por pagina.
- `approvals`: aprovacoes por etapa.
- `revision_requests`: pedidos de revisao e limite gratuito.
- `payments`: provider, status, valor e webhook.
- `printers`: graficas parceiras.
- `print_jobs`: pacote enviado, SLA, rastreio e status.
- `quality_events`: erros, retrabalho, aprendizados e causa raiz.
- `prompt_versions`: versoes aprovadas dos prompts/processos.

Storage inicial:

- `original-uploads`: fotos originais, privado, retencao curta.
- `generated-assets`: imagens e provas intermediarias.
- `print-packages`: PDFs e ZIPs para grafica.

Regras obrigatorias:

- RLS habilitado em tabelas expostas.
- Fotos de criancas privadas por padrao.
- URLs publicas nunca podem expor nome, foto, endereco ou briefing completo.
- Fotos originais devem ter politica de retencao, inicialmente 30 dias apos entrega.
- Acesso administrativo deve ser separado do acesso de cliente.

## OpenAI/API de geracao

A chave deve ficar apenas no servidor, como `OPENAI_API_KEY`. O navegador nunca deve receber essa chave.

O app deve chamar uma rota interna, por exemplo:

- `POST /api/generation/story`
- `POST /api/generation/character-guide`
- `POST /api/generation/page`
- `POST /api/generation/cover`
- `POST /api/quality/review`

Cada chamada deve registrar:

- pedido;
- etapa;
- prompt/template usado;
- entrada;
- saida;
- custo estimado;
- tempo de resposta;
- decisao do cliente ou do admin;
- erro ou aprendizado, se houver.

## Mercado Pago

Comecar por sandbox. O fluxo alvo e:

1. Cliente preenche pedido.
2. Cliente paga.
3. Webhook confirma pagamento.
4. Pedido muda para producao.
5. Cliente aprova historia, personagens, paginas, capa e prova final.

## Melhor proximo passo tecnico

Antes de ligar servicos reais, o app ainda precisa de uma camada persistente abstrata:

- `OrderRepository`
- `AssetRepository`
- `GenerationRepository`
- `PaymentProvider`
- `PrintProvider`

No prototipo, esses repositorios usam `localStorage`. Na fase seguinte, eles passam para Supabase sem reescrever a UI inteira.

## Referencias verificadas

- Supabase Next.js SSR/Auth: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase Storage Access Control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase changelog de database: https://supabase.com/changelog?tags=database
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- OpenAI API key safety: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
