# Isolamento do Projeto

Este app e 100% novo e separado de qualquer outro app ja publicado.

Regras:

- Nao reutilizar projeto Supabase de outro produto.
- Nao reutilizar projeto Vercel de outro produto.
- Nao reutilizar variaveis de ambiente de outro produto.
- Nao importar codigo, schemas, buckets, tabelas, webhooks ou secrets de outro app.
- Criar um banco Supabase proprio para Livro Magico quando a fase de persistencia comecar.
- Criar um projeto Vercel proprio para Livro Magico quando a fase de deploy comecar.

Nome tecnico local:

```text
livro-magico-app
```

Nome placeholder de marca:

```text
Livro Magico
```

Stack planejada:

- Next.js + TypeScript;
- Supabase novo e isolado;
- Vercel novo e isolado;
- Mercado Pago como primeiro provider real de pagamento;
- camada generica para IA e pagamentos.
