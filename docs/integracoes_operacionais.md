# Integracoes operacionais do Livro Magico

Este app foi estruturado para rodar como uma operacao enxuta, com o dono controlando pedidos, pagamentos, geracao de conteudo, custos e envio para grafica.

## Variaveis necessarias no Vercel

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI

- `OPENAI_API_KEY`
- `OPENAI_TEXT_MODEL`
- `OPENAI_IMAGE_MODEL`
- `AI_COST_APPROVAL_THRESHOLD_BRL`

Padrao atual sugerido:

- `OPENAI_TEXT_MODEL=gpt-5.5`
- `OPENAI_IMAGE_MODEL=gpt-image-1.5`

### Mercado Pago

- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_PUBLIC_KEY`
- `MERCADO_PAGO_WEBHOOK_SECRET`

O checkout usa Checkout Pro por redirecionamento. O webhook atualiza `payments` e `orders.financial_status`.

## Fluxo implementado agora

1. Cliente cria briefing.
2. App cria previa de historia no navegador.
3. Cliente pode pedir preparacao completa da historia.
4. Se OpenAI estiver configurada, o app chama `/api/ai/story`.
5. Se nao estiver configurada, o app mantem a previa atual e informa que a preparacao completa esta pendente.
6. Ao enviar, o pedido fica com pagamento pendente.
7. Se Mercado Pago estiver configurado, o app cria uma preferencia e redireciona para pagamento.
8. Se Mercado Pago nao estiver configurado, o pedido fica salvo e o app informa a pendencia.
9. Acoes de aprovacao, revisao e edicao da historia sincronizam via `/api/orders/[id]`.
10. Webhook do Mercado Pago confirma pagamento e atualiza o pedido.

## Decisoes de produto

- O cliente nao deve ver a palavra IA como argumento de venda ou explicacao de processo.
- Texto final e numeracao devem ser aplicados fora da imagem, em etapa futura de diagramacao.
- A geracao de imagem ja foi preparada via endpoint, mas ainda falta UI de aprovacao visual por personagem/pagina.
- O envio para grafica ainda esta como acao operacional pendente: proximo passo e gerar PDF fechado + ZIP com QR, serial e instrucoes da grafica.

## Pendencias que dependem do dono

- Criar/confirmar conta Mercado Pago de vendedor.
- Pegar credenciais de teste do Mercado Pago.
- Criar chave da OpenAI API com billing ativo.
- Definir teto de custo por pedido para exigir aprovacao manual.
- Cadastrar pelo menos uma grafica parceira com formato, SLA, preco, e-mail/API e regra de envio.
- Confirmar textos juridicos: termos de uso, politica de privacidade, consentimento para fotos de criancas e retencao de 30 dias.
