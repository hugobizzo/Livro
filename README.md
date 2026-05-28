# Livro Magico App

App novo e isolado para criar, aprovar, produzir e rastrear livros infantis personalizados.

## Regra de isolamento

Este projeto nao deve compartilhar Supabase, Vercel, banco, storage, variaveis de ambiente ou webhooks com qualquer outro app existente.

Veja `docs/isolamento.md`.

## Stack inicial

- Next.js + TypeScript
- Tailwind CSS
- Prototipo local com pedidos salvos no navegador
- Supabase futuro, em projeto proprio
- Mercado Pago futuro, via camada de provider

## Rodar localmente

```bash
npm.cmd run dev
```

Abra `http://localhost:3000`.

## Rotas principais

- `/`: landing page
- `/login`: entrada visual cliente/admin
- `/novo-livro`: wizard de briefing
- `/cliente`: area do cliente
- `/admin`: painel do dono
- `/admin/pedidos/LM-000124`: detalhe de pedido
- `/q/magico-7K4Q2`: pagina publica de QR

## Proximas fases

1. Fechar UX do cliente e aprovacao de historia.
2. Criar projeto Vercel proprio.
3. Criar projeto Supabase proprio.
4. Conectar autenticacao, banco e storage.
5. Implementar geracao de historia com o motor de producao.
6. Implementar Mercado Pago em sandbox.
7. Gerar PDF de prova e pacote para grafica.

Veja `docs/arquitetura_producao.md`.

## Scripts

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
```

## Observacao

O primeiro corte usa dados locais e exemplos para validar fluxo, UI e estrutura operacional antes de conectar banco, pagamento e motor de producao.
