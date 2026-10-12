# HortLink

**A rede profissional que conecta quem produz e compra no setor hortifruti.**

Protótipo acadêmico de demonstração. O objetivo é mostrar a ideia e o fluxo principal da plataforma de forma clara e navegável. Não é um produto pronto para uso real.

Equipe: Fabricio Devenz, João Gabriel Zarque, Luis F. Martelli, Luiz Henrique, Valdinei Masutti e Vinicius Bega.

## Como abrir

Não precisa instalar nada.

1. Baixe a pasta do projeto.
2. Dê dois cliques em `index.html`. O site abre direto no navegador (Chrome, Edge ou Firefox).

Se preferir abrir por um servidor local, use uma das opções:

```
npx serve
```

ou a extensão Live Server do VS Code.

O site funciona sem internet. Com internet, ele carrega as fontes do Google Fonts e as fotos da landing page. Sem internet, usa as fontes do computador e as ilustrações da pasta `img`.

## Estrutura dos arquivos

```
index.html        Landing page
app.html          Aplicação (todas as telas)
css/style.css     Estilos da landing e da aplicação
js/dados.js       Dados fictícios iniciais
js/app.js         Lógica, telas e gravação no localStorage
img/              Logotipo e ilustrações
README.md         Este arquivo
```

O `app.js` é dividido em dez partes numeradas (configurações, dados, funções de apoio, navegação, cabeçalho, cartões, telas, ações, formulários e eventos). Cada parte tem um comentário explicando o que faz.

## O que o protótipo demonstra

- **Landing page** com problema, solução, como funciona, diferenciais, impacto e público.
- **Cadastro e entrada simulados** com três tipos de perfil: Produtor, Comprador e Transportador.
- **Perfis** com descrição, produtos, ofertas ativas, nota média em estrelas e avaliações recebidas.
- **Lista de profissionais** com filtro por tipo e por cidade ou UF.
- **Ofertas e demandas** publicadas em cartões, com opção de encerrar.
- **Busca por região** com filtros de produto, tipo, estado, cidade e preço máximo, e ordenação por mais recente, menor preço e melhor avaliação. Os anúncios do mesmo estado do usuário aparecem primeiro, com o selo "Na sua região".
- **Sugestões no painel** que combinam os produtos do perfil com os anúncios publicados.
- **Conversa com proposta**: mensagens, proposta de quantidade e preço, aceite ou recusa.
- **Negócios** com as etapas Em negociação, Aceito, Entregue e Concluído.
- **Frete simplificado**: pedido de frete, orçamentos dos transportadores e aceite com um clique.
- **Avaliações** de 1 a 5 estrelas ao concluir o negócio, com atualização da nota do perfil.
- **Notificações** no sino do cabeçalho.

## Roteiro da demonstração

1. Abra `index.html` e clique em **Entrar na demonstração**.
2. Em "Entrar como usuário de exemplo", escolha **Sítio Boa Esperança** (produtor). Abra **Minhas ofertas** e publique: produto `tomate`, quantidade `500`, unidade `caixa`, preço `80`.
3. No menu do usuário (canto superior direito), clique em **Trocar de perfil** e escolha **Supermercados Coxipó** (comprador). Abra **Mercado** e digite `tomate` no filtro. A oferta aparece no grupo "Na sua região".
4. Clique em **Negociar**, depois em **Fazer proposta**, e envie quantidade e preço. Na proposta, clique em **Entrar como Sítio Boa Esperança para responder** e depois em **Aceitar**.
5. Abra **Negócios**. O negócio está na etapa "Aceito" e a oferta passou de 500 para 300 caixas. Clique em **Solicitar frete** e envie. Em instantes chega um orçamento. Clique em **Aceitar orçamento**.
   - Opcional: troque para **TransVerde Logística**, abra **Fretes** e envie outro orçamento antes de aceitar.
6. Clique em **Marcar como entregue** e depois em **Concluir negócio**. Clique em **Avaliar** e dê a nota. Troque para o outro perfil, abra **Negócios** e avalie também.
7. Abra o perfil do **Sítio Boa Esperança** (em Profissionais ou clicando no nome). A nota média e a lista de avaliações já estão atualizadas.

Para repetir a apresentação do zero, clique em **Restaurar dados de demonstração** no rodapé da aplicação.

## O que é simulado

| Item | Como funciona no protótipo |
| --- | --- |
| Servidor e banco de dados | Não existem. Tudo fica no `localStorage` do navegador. Cada navegador tem seus próprios dados. |
| Login | Não há senha nem verificação. O cadastro só guarda o perfil e marca o usuário como logado. |
| Troca de perfil | O botão "Trocar de perfil" permite ver a plataforma como qualquer usuário, para mostrar os dois lados da negociação em um só computador. |
| Chat | As mensagens ficam salvas no navegador. Não há troca de mensagens em tempo real entre pessoas diferentes. |
| Respostas automáticas | Depois de cada mensagem, o outro lado envia uma resposta pronta, marcada como "resposta automática". |
| Orçamento de frete automático | Depois de um pedido de frete, um transportador fictício envia um orçamento com um valor calculado por uma fórmula simples. |
| Proximidade | Não há mapa, GPS nem cálculo de distância. O sistema compara apenas cidade e UF do anúncio com as do usuário. |
| Pagamento | Não existe. O negócio avança de etapa quando o usuário clica no botão. |
| Notificações | Aparecem só no sino dentro do site. Não há e-mail nem aviso no celular. |
| Dados | Todos os usuários, anúncios, conversas, valores e avaliações são fictícios. Qualquer semelhança com empresas reais é coincidência. |

Para desligar as respostas e os orçamentos automáticos, troque `RESPOSTAS_AUTOMATICAS` para `false` no início do `js/app.js`.

## Dados iniciais

O arquivo `js/dados.js` traz 14 usuários (6 produtores, 5 compradores e 3 transportadores), 15 ofertas, 8 demandas, 7 conversas, 5 negócios (4 concluídos e 1 em andamento), 4 fretes e 11 avaliações. A maior parte das cidades fica em Mato Grosso (Cuiabá, Várzea Grande, Chapada dos Guimarães, Campo Verde, Primavera do Leste, Nobres, Rosário Oeste, Rondonópolis e Sinop), com alguns perfis em Goiás e Mato Grosso do Sul.

## Fora do escopo

Servidor, banco de dados, login seguro, pagamento, mapas, geolocalização real, notificações por e-mail, testes automatizados e publicação na internet.

## Imagens

- Logotipo e ilustrações da pasta `img`: feitos para este projeto.
- Fotos da landing page: Unsplash, sob a licença gratuita do site (https://unsplash.com/license). São carregadas por URL e só aparecem com internet. Endereços das fotos usadas:
  - https://images.unsplash.com/photo-1598871569630-f00343aad008 (campo cultivado)
  - https://images.unsplash.com/photo-1629398781739-9caec1eb9409 (tomates)
  - https://images.unsplash.com/photo-1707736175510-96048f3374de (banca de feira)
  - https://images.unsplash.com/photo-1669154777196-aca4d45b581a (caixas com hortaliças)
