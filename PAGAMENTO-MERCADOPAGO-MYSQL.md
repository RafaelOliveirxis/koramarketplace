# Pagamento real — FlashMarket

A integração usa a Orders API do Mercado Pago + MySQL.

## Fluxo

1. `FlashMarket/checkout.html` coleta cliente, endereço, frete e preferência de pagamento.
2. `POST /api/payments/create` valida os itens e recalcula os preços no servidor.
3. O pedido é gravado em `fm_orders` e seus itens em `fm_order_items`.
4. A API cria uma Order no Mercado Pago e devolve `checkout_url`.
5. O navegador é redirecionado ao Mercado Pago.
6. O Mercado Pago chama `POST /api/payments/webhook` quando a Order muda.
7. O webhook valida `x-signature`, consulta a Order e atualiza o MySQL.
8. `FlashMarket/pagamento-retorno.html` consulta `GET /api/payments/status` e mostra o estado ao cliente.

## MySQL

Execute no banco definido por `DB_NAME`:

```sql
SOURCE api/payments/setup.sql;
```

Esse script cria o catálogo inicial (`fm_catalog`), pedidos (`fm_orders`) e itens (`fm_order_items`).

## Variáveis de ambiente

Configure no Vercel/servidor:

```text
DB_HOST
DB_PORT=3306
DB_USER
DB_PASSWORD
DB_NAME=flashmarket
DB_SSL=true
JWT_SECRET
MP_ACCESS_TOKEN
MP_WEBHOOK_SECRET
FRONTEND_URL=https://seu-dominio.com
```

Nunca faça commit de valores reais.

## Mercado Pago

Crie a aplicação no painel de desenvolvedores e use o Access Token no backend. Configure o Webhook para:

```text
https://SEU-DOMINIO/api/payments/webhook
```

Ative notificações de Orders. A integração valida o header `x-signature` usando HMAC-SHA256 antes de atualizar o pedido.

## Retornos

O backend configura, quando `FRONTEND_URL` está definido:

```text
/pagamento-retorno.html?order=FM...&result=success
/pagamento-retorno.html?order=FM...&result=failure
/pagamento-retorno.html?order=FM...&result=pending
```

## Teste

Use primeiro as credenciais/usuários de teste do Mercado Pago. O Checkout Pro gera uma `checkout_url`; o servidor nunca recebe número de cartão ou CVV.

Depois de configurar as variáveis e o banco, faça um novo deploy da Vercel.
