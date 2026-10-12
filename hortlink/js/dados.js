/* ==========================================================
   HortLink: dados fictícios iniciais
   Este arquivo é carregado antes do app.js. Na primeira visita
   (ou ao clicar em "Restaurar dados de demonstração"), o app
   copia estes dados para o localStorage do navegador.
   Todos os nomes, valores e avaliações são inventados.
   ========================================================== */

// Devolve uma data no formato ISO, "n" dias antes de hoje.
// Assim os dados parecem recentes em qualquer dia da apresentação.
function diasAtras(n) {
  var data = new Date();
  data.setDate(data.getDate() - n);
  return data.toISOString();
}

var DADOS_INICIAIS = {

  // ---------- Usuários: 6 produtores, 5 compradores, 3 transportadores ----------
  // "exemplo: true" marca os perfis que aparecem no atalho da tela de entrada.
  usuarios: [
    { id: 'u1', tipo: 'produtor', exemplo: true, nome: 'Sítio Boa Esperança', cidade: 'Chapada dos Guimarães', uf: 'MT',
      descricao: 'Propriedade familiar com 12 hectares de hortaliças. Colheita diária e entrega em Cuiabá, Várzea Grande e região.',
      produtos: ['tomate', 'alface', 'couve'] },
    { id: 'u2', tipo: 'produtor', nome: 'Chácara Recanto do Buriti', cidade: 'Campo Verde', uf: 'MT',
      descricao: 'Morango de mesa cultivado em estufa e folhas colhidas no dia do envio.',
      produtos: ['morango', 'alface'] },
    { id: 'u3', tipo: 'produtor', nome: 'Cooperativa Vale do São Lourenço', cidade: 'Primavera do Leste', uf: 'MT',
      descricao: 'Cooperativa de 40 famílias produtoras de raízes e bulbos. Produto lavado, classificado e embalado.',
      produtos: ['cenoura', 'batata', 'cebola'] },
    { id: 'u4', tipo: 'produtor', nome: 'Fazenda Águas do Jardim', cidade: 'Nobres', uf: 'MT',
      descricao: 'Mamão formosa e banana prata com colheita programada o ano todo.',
      produtos: ['mamão', 'banana'] },
    { id: 'u5', tipo: 'produtor', nome: 'Hortas do Planalto', cidade: 'Cristalina', uf: 'GO',
      descricao: 'Produção irrigada de tomate, cebola e batata para atacado e distribuidores.',
      produtos: ['tomate', 'cebola', 'batata'] },
    { id: 'u6', tipo: 'produtor', nome: 'Pomar Serra Azul', cidade: 'Rosário Oeste', uf: 'MT',
      descricao: 'Citros de mesa: laranja pera e limão taiti selecionados no próprio pomar.',
      produtos: ['laranja', 'limão'] },

    { id: 'u7', tipo: 'comprador', exemplo: true, nome: 'Supermercados Coxipó', segmento: 'Supermercado', cidade: 'Cuiabá', uf: 'MT',
      descricao: 'Rede de bairro com três lojas na capital. Compra frutas, verduras e legumes toda semana.',
      produtos: ['tomate', 'banana', 'laranja', 'batata'] },
    { id: 'u8', tipo: 'comprador', nome: 'Banca da Dona Benedita', segmento: 'Feira livre', cidade: 'Várzea Grande', uf: 'MT',
      descricao: 'Banca em quatro feiras livres de Várzea Grande e Cuiabá. Prefere comprar direto de pequenos produtores.',
      produtos: ['alface', 'couve', 'cenoura', 'tomate'] },
    { id: 'u9', tipo: 'comprador', nome: 'Restaurante Sabores do Nortão', segmento: 'Restaurante', cidade: 'Sinop', uf: 'MT',
      descricao: 'Cozinha brasileira com ingredientes frescos. Compras semanais em pequenas quantidades.',
      produtos: ['morango', 'limão', 'tomate', 'cebola'] },
    { id: 'u10', tipo: 'comprador', nome: 'Distribuidora Hortimais', segmento: 'Distribuidor', cidade: 'Rondonópolis', uf: 'MT',
      descricao: 'Distribui legumes para mercados e cozinhas industriais do sul de Mato Grosso.',
      produtos: ['batata', 'cebola', 'tomate'] },
    { id: 'u11', tipo: 'comprador', nome: 'Supermercados Ipê', segmento: 'Supermercado', cidade: 'Campo Grande', uf: 'MS',
      descricao: 'Rede com cinco lojas em Campo Grande.',
      produtos: ['mamão', 'banana', 'laranja'] },

    { id: 'u12', tipo: 'transportador', exemplo: true, nome: 'TransVerde Logística', cidade: 'Várzea Grande', uf: 'MT',
      descricao: 'Caminhões refrigerados para cargas de hortifruti. Rotas em Mato Grosso, Mato Grosso do Sul e Goiás.',
      produtos: [] },
    { id: 'u13', tipo: 'transportador', nome: 'Rota Fresca Transportes', cidade: 'Rondonópolis', uf: 'MT',
      descricao: 'Fretes de curta e média distância no sul de Mato Grosso e em Goiás.',
      produtos: [] },
    { id: 'u14', tipo: 'transportador', nome: 'Frio Norte Cargas', cidade: 'Sinop', uf: 'MT',
      descricao: 'Transporte refrigerado pela BR-163, de Cuiabá a Sinop, Sorriso e Lucas do Rio Verde.',
      produtos: [] }
  ],

  // ---------- Anúncios: 15 ofertas (produtores) e 8 demandas (compradores) ----------
  // Na oferta, "preco" é o preço pedido. Na demanda, é o máximo que o comprador paga.
  anuncios: [
    { id: 'a1', tipo: 'oferta', usuarioId: 'u1', produto: 'alface', quantidade: 300, unidade: 'maço', preco: 2.5, cidade: 'Chapada dos Guimarães', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Alface crespa colhida no dia.', status: 'ativa', criadoEm: diasAtras(2) },
    { id: 'a2', tipo: 'oferta', usuarioId: 'u1', produto: 'couve', quantidade: 200, unidade: 'maço', preco: 2.2, cidade: 'Chapada dos Guimarães', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Couve manteiga, maços de 400 g.', status: 'ativa', criadoEm: diasAtras(5) },
    { id: 'a3', tipo: 'oferta', usuarioId: 'u2', produto: 'morango', quantidade: 150, unidade: 'caixa', preco: 18, cidade: 'Campo Verde', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Caixa com 4 bandejas de 250 g.', status: 'ativa', criadoEm: diasAtras(1) },
    { id: 'a4', tipo: 'oferta', usuarioId: 'u2', produto: 'alface', quantidade: 180, unidade: 'maço', preco: 2.8, cidade: 'Campo Verde', uf: 'MT', disponibilidade: 'Em 3 dias', observacao: 'Alface americana.', status: 'ativa', criadoEm: diasAtras(6) },
    { id: 'a5', tipo: 'oferta', usuarioId: 'u3', produto: 'cenoura', quantidade: 400, unidade: 'caixa', preco: 45, cidade: 'Primavera do Leste', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Caixa de 20 kg, lavada e classificada.', status: 'ativa', criadoEm: diasAtras(3) },
    { id: 'a6', tipo: 'oferta', usuarioId: 'u3', produto: 'batata', quantidade: 600, unidade: 'saco', preco: 120, cidade: 'Primavera do Leste', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Saco de 25 kg, batata lavada.', status: 'ativa', criadoEm: diasAtras(4) },
    { id: 'a7', tipo: 'oferta', usuarioId: 'u3', produto: 'cebola', quantidade: 350, unidade: 'saco', preco: 70, cidade: 'Primavera do Leste', uf: 'MT', disponibilidade: 'Em 7 dias', observacao: 'Saco de 20 kg.', status: 'ativa', criadoEm: diasAtras(8) },
    { id: 'a8', tipo: 'oferta', usuarioId: 'u4', produto: 'mamão', quantidade: 150, unidade: 'caixa', preco: 38, cidade: 'Nobres', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Mamão formosa, caixa de 13 kg.', status: 'ativa', criadoEm: diasAtras(2) },
    { id: 'a9', tipo: 'oferta', usuarioId: 'u4', produto: 'banana', quantidade: 500, unidade: 'caixa', preco: 42, cidade: 'Nobres', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Banana prata climatizada, caixa de 20 kg.', status: 'ativa', criadoEm: diasAtras(7) },
    { id: 'a10', tipo: 'oferta', usuarioId: 'u5', produto: 'tomate', quantidade: 800, unidade: 'caixa', preco: 85, cidade: 'Cristalina', uf: 'GO', disponibilidade: 'Imediata', observacao: 'Tomate italiano, caixa de 20 kg.', status: 'ativa', criadoEm: diasAtras(1) },
    { id: 'a11', tipo: 'oferta', usuarioId: 'u5', produto: 'cebola', quantidade: 300, unidade: 'saco', preco: 65, cidade: 'Cristalina', uf: 'GO', disponibilidade: 'Imediata', observacao: 'Saco de 20 kg.', status: 'ativa', criadoEm: diasAtras(9) },
    { id: 'a12', tipo: 'oferta', usuarioId: 'u5', produto: 'batata', quantidade: 250, unidade: 'saco', preco: 115, cidade: 'Cristalina', uf: 'GO', disponibilidade: 'Em 5 dias', observacao: 'Saco de 25 kg.', status: 'ativa', criadoEm: diasAtras(10) },
    { id: 'a13', tipo: 'oferta', usuarioId: 'u6', produto: 'laranja', quantidade: 700, unidade: 'caixa', preco: 40, cidade: 'Rosário Oeste', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Laranja pera, caixa de 27 kg.', status: 'ativa', criadoEm: diasAtras(3) },
    { id: 'a14', tipo: 'oferta', usuarioId: 'u6', produto: 'limão', quantidade: 300, unidade: 'caixa', preco: 55, cidade: 'Rosário Oeste', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Limão taiti, caixa de 20 kg.', status: 'ativa', criadoEm: diasAtras(4) },
    { id: 'a15', tipo: 'oferta', usuarioId: 'u6', produto: 'laranja', quantidade: 2000, unidade: 'kg', preco: 1.9, cidade: 'Rosário Oeste', uf: 'MT', disponibilidade: 'Em 10 dias', observacao: 'Laranja para suco, venda a granel.', status: 'ativa', criadoEm: diasAtras(12) },

    { id: 'a16', tipo: 'demanda', usuarioId: 'u7', produto: 'tomate', quantidade: 400, unidade: 'caixa', preco: 90, cidade: 'Cuiabá', uf: 'MT', disponibilidade: 'Entrega semanal', observacao: 'Preferência por tomate italiano ou salada.', status: 'ativa', criadoEm: diasAtras(1) },
    { id: 'a17', tipo: 'demanda', usuarioId: 'u7', produto: 'banana', quantidade: 200, unidade: 'caixa', preco: 45, cidade: 'Cuiabá', uf: 'MT', disponibilidade: 'Até o fim do mês', observacao: 'Banana prata ou nanica.', status: 'ativa', criadoEm: diasAtras(6) },
    { id: 'a18', tipo: 'demanda', usuarioId: 'u8', produto: 'alface', quantidade: 250, unidade: 'maço', preco: 3, cidade: 'Várzea Grande', uf: 'MT', disponibilidade: 'Toda semana', observacao: 'Entrega às quintas-feiras.', status: 'ativa', criadoEm: diasAtras(2) },
    { id: 'a19', tipo: 'demanda', usuarioId: 'u8', produto: 'couve', quantidade: 150, unidade: 'maço', preco: 2.5, cidade: 'Várzea Grande', uf: 'MT', disponibilidade: 'Toda semana', observacao: '', status: 'ativa', criadoEm: diasAtras(5) },
    { id: 'a20', tipo: 'demanda', usuarioId: 'u9', produto: 'morango', quantidade: 40, unidade: 'caixa', preco: 20, cidade: 'Sinop', uf: 'MT', disponibilidade: 'Em 7 dias', observacao: 'Para sobremesas, fruta firme.', status: 'ativa', criadoEm: diasAtras(3) },
    { id: 'a21', tipo: 'demanda', usuarioId: 'u9', produto: 'limão', quantidade: 30, unidade: 'caixa', preco: 60, cidade: 'Sinop', uf: 'MT', disponibilidade: 'Imediata', observacao: '', status: 'ativa', criadoEm: diasAtras(7) },
    { id: 'a22', tipo: 'demanda', usuarioId: 'u10', produto: 'batata', quantidade: 500, unidade: 'saco', preco: 125, cidade: 'Rondonópolis', uf: 'MT', disponibilidade: 'Imediata', observacao: 'Batata lavada, padrão especial.', status: 'ativa', criadoEm: diasAtras(2) },
    { id: 'a23', tipo: 'demanda', usuarioId: 'u11', produto: 'mamão', quantidade: 200, unidade: 'caixa', preco: 40, cidade: 'Campo Grande', uf: 'MS', disponibilidade: 'Toda semana', observacao: 'Mamão formosa ou papaia.', status: 'ativa', criadoEm: diasAtras(4) }
  ],

  // ---------- Conversas ----------
  // Tipos de mensagem: "texto", "proposta" (ligada a um negócio) e "sistema".
  conversas: [
    { id: 'k1', anuncioId: 'a5', participantes: ['u8', 'u3'], atualizadoEm: diasAtras(20), mensagens: [
      { id: 'm1', autorId: 'u8', tipo: 'texto', texto: 'Bom dia! Preciso de cenoura para as feiras da semana que vem. Vocês entregam em Várzea Grande?', criadoEm: diasAtras(22) },
      { id: 'm2', autorId: 'u3', tipo: 'texto', texto: 'Bom dia, Dona Benedita! Entregamos sim, com frete por conta do comprador.', criadoEm: diasAtras(22) },
      { id: 'm3', autorId: 'u8', tipo: 'proposta', negocioId: 'n1', quantidade: 100, preco: 44, status: 'aceita', criadoEm: diasAtras(21) },
      { id: 'm4', tipo: 'sistema', texto: 'Proposta aceita. Negócio criado.', criadoEm: diasAtras(21) }
    ] },
    { id: 'k2', anuncioId: 'a13', participantes: ['u7', 'u6'], atualizadoEm: diasAtras(14), mensagens: [
      { id: 'm5', autorId: 'u7', tipo: 'texto', texto: 'Olá! Tenho interesse na laranja pera. Consegue fazer um preço melhor para 200 caixas?', criadoEm: diasAtras(16) },
      { id: 'm6', autorId: 'u6', tipo: 'texto', texto: 'Olá! Para esse volume consigo chegar em R$ 39 a caixa.', criadoEm: diasAtras(16) },
      { id: 'm7', autorId: 'u7', tipo: 'proposta', negocioId: 'n2', quantidade: 200, preco: 39, status: 'aceita', criadoEm: diasAtras(15) },
      { id: 'm8', tipo: 'sistema', texto: 'Proposta aceita. Negócio criado.', criadoEm: diasAtras(15) }
    ] },
    { id: 'k3', anuncioId: 'a1', participantes: ['u9', 'u1'], atualizadoEm: diasAtras(9), mensagens: [
      { id: 'm9', autorId: 'u9', tipo: 'texto', texto: 'Boa tarde! Quero testar a alface de vocês no restaurante. Posso começar com 80 maços?', criadoEm: diasAtras(11) },
      { id: 'm10', autorId: 'u1', tipo: 'texto', texto: 'Boa tarde! Pode sim. Colhemos na véspera do envio.', criadoEm: diasAtras(11) },
      { id: 'm11', autorId: 'u9', tipo: 'proposta', negocioId: 'n3', quantidade: 80, preco: 2.4, status: 'aceita', criadoEm: diasAtras(10) },
      { id: 'm12', tipo: 'sistema', texto: 'Proposta aceita. Negócio criado.', criadoEm: diasAtras(10) }
    ] },
    { id: 'k4', anuncioId: 'a12', participantes: ['u10', 'u5'], atualizadoEm: diasAtras(17), mensagens: [
      { id: 'm13', autorId: 'u10', tipo: 'texto', texto: 'Bom dia! Consigo retirar 150 sacos de batata na sexta-feira. Fecha em R$ 112?', criadoEm: diasAtras(18) },
      { id: 'm14', autorId: 'u10', tipo: 'proposta', negocioId: 'n4', quantidade: 150, preco: 112, status: 'aceita', criadoEm: diasAtras(18) },
      { id: 'm15', tipo: 'sistema', texto: 'Proposta aceita. Negócio criado.', criadoEm: diasAtras(17) }
    ] },
    { id: 'k5', anuncioId: 'a8', participantes: ['u11', 'u4'], atualizadoEm: diasAtras(1), mensagens: [
      { id: 'm16', autorId: 'u11', tipo: 'texto', texto: 'Olá! Precisamos de mamão formosa para as lojas de Campo Grande.', criadoEm: diasAtras(2) },
      { id: 'm17', autorId: 'u4', tipo: 'texto', texto: 'Olá! Temos colheita nesta semana. Qual quantidade?', criadoEm: diasAtras(2) },
      { id: 'm18', autorId: 'u11', tipo: 'proposta', negocioId: 'n5', quantidade: 100, preco: 37, status: 'aceita', criadoEm: diasAtras(1) },
      { id: 'm19', tipo: 'sistema', texto: 'Proposta aceita. Negócio criado.', criadoEm: diasAtras(1) }
    ] },
    { id: 'k6', anuncioId: 'a10', participantes: ['u7', 'u5'], atualizadoEm: diasAtras(1), mensagens: [
      { id: 'm20', autorId: 'u7', tipo: 'texto', texto: 'Olá! Vocês entregam tomate em Cuiabá?', criadoEm: diasAtras(1) },
      { id: 'm21', autorId: 'u5', tipo: 'texto', texto: 'Olá! Entregamos com frete combinado à parte. Para Cuiabá são cerca de dois dias de viagem.', criadoEm: diasAtras(1) }
    ] },
    { id: 'k7', anuncioId: 'a22', participantes: ['u3', 'u10'], atualizadoEm: diasAtras(2), mensagens: [
      { id: 'm22', autorId: 'u3', tipo: 'texto', texto: 'Bom dia! Vimos que vocês procuram batata lavada. Temos 600 sacos disponíveis em Primavera do Leste.', criadoEm: diasAtras(2) },
      { id: 'm23', autorId: 'u10', tipo: 'texto', texto: 'Bom dia! Tenho interesse. Me envie uma proposta para 300 sacos, por favor.', criadoEm: diasAtras(2) }
    ] }
  ],

  // ---------- Negócios ----------
  // Etapas: Em negociação, Aceito, Entregue e Concluído.
  negocios: [
    { id: 'n1', conversaId: 'k1', anuncioId: 'a5', vendedorId: 'u3', compradorId: 'u8', produto: 'cenoura', quantidade: 100, unidade: 'caixa', preco: 44, status: 'Concluído', criadoEm: diasAtras(21) },
    { id: 'n2', conversaId: 'k2', anuncioId: 'a13', vendedorId: 'u6', compradorId: 'u7', produto: 'laranja', quantidade: 200, unidade: 'caixa', preco: 39, status: 'Concluído', criadoEm: diasAtras(15) },
    { id: 'n3', conversaId: 'k3', anuncioId: 'a1', vendedorId: 'u1', compradorId: 'u9', produto: 'alface', quantidade: 80, unidade: 'maço', preco: 2.4, status: 'Concluído', criadoEm: diasAtras(10) },
    { id: 'n4', conversaId: 'k4', anuncioId: 'a12', vendedorId: 'u5', compradorId: 'u10', produto: 'batata', quantidade: 150, unidade: 'saco', preco: 112, status: 'Concluído', criadoEm: diasAtras(17) },
    { id: 'n5', conversaId: 'k5', anuncioId: 'a8', vendedorId: 'u4', compradorId: 'u11', produto: 'mamão', quantidade: 100, unidade: 'caixa', preco: 37, status: 'Aceito', criadoEm: diasAtras(1) }
  ],

  // ---------- Fretes ----------
  // Uma solicitação fica "aberta" até o solicitante aceitar um orçamento.
  fretes: [
    { id: 'f1', negocioId: 'n1', solicitanteId: 'u8', origem: 'Primavera do Leste/MT', destino: 'Várzea Grande/MT', carga: '100 caixas de cenoura', status: 'fechada', transportadorId: 'u13', valor: 620, criadoEm: diasAtras(21),
      orcamentos: [{ id: 'o1', transportadorId: 'u13', valor: 620, criadoEm: diasAtras(21) }] },
    { id: 'f2', negocioId: 'n2', solicitanteId: 'u7', origem: 'Rosário Oeste/MT', destino: 'Cuiabá/MT', carga: '200 caixas de laranja', status: 'fechada', transportadorId: 'u12', valor: 540, criadoEm: diasAtras(15),
      orcamentos: [{ id: 'o2', transportadorId: 'u12', valor: 540, criadoEm: diasAtras(15) }, { id: 'o3', transportadorId: 'u13', valor: 610, criadoEm: diasAtras(15) }] },
    { id: 'f3', negocioId: 'n3', solicitanteId: 'u9', origem: 'Chapada dos Guimarães/MT', destino: 'Sinop/MT', carga: '80 maços de alface', status: 'fechada', transportadorId: 'u14', valor: 690, criadoEm: diasAtras(10),
      orcamentos: [{ id: 'o4', transportadorId: 'u14', valor: 690, criadoEm: diasAtras(10) }] },
    { id: 'f4', negocioId: 'n5', solicitanteId: 'u11', origem: 'Nobres/MT', destino: 'Campo Grande/MS', carga: '100 caixas de mamão', status: 'aberta', transportadorId: null, valor: null, criadoEm: diasAtras(1),
      orcamentos: [] }
  ],

  // ---------- Avaliações (nota de 1 a 5) ----------
  avaliacoes: [
    { id: 'v1', negocioId: 'n1', autorId: 'u8', avaliadoId: 'u3', nota: 5, comentario: 'Cenouras muito frescas e entrega no prazo combinado.', criadoEm: diasAtras(19) },
    { id: 'v2', negocioId: 'n1', autorId: 'u3', avaliadoId: 'u8', nota: 5, comentario: 'Pagamento em dia e comunicação clara.', criadoEm: diasAtras(19) },
    { id: 'v3', negocioId: 'n1', autorId: 'u8', avaliadoId: 'u13', nota: 5, comentario: 'Motorista pontual e carga bem acomodada.', criadoEm: diasAtras(19) },
    { id: 'v4', negocioId: 'n2', autorId: 'u7', avaliadoId: 'u6', nota: 4, comentario: 'Laranjas de boa qualidade. Parte das caixas chegou um dia depois.', criadoEm: diasAtras(13) },
    { id: 'v5', negocioId: 'n2', autorId: 'u6', avaliadoId: 'u7', nota: 5, comentario: 'Comprador sério, fechou rápido.', criadoEm: diasAtras(13) },
    { id: 'v6', negocioId: 'n2', autorId: 'u7', avaliadoId: 'u12', nota: 4, comentario: 'Entrega dentro do prazo.', criadoEm: diasAtras(13) },
    { id: 'v7', negocioId: 'n3', autorId: 'u9', avaliadoId: 'u1', nota: 4, comentario: 'Alface bonita e bem embalada. Voltaremos a comprar.', criadoEm: diasAtras(8) },
    { id: 'v8', negocioId: 'n3', autorId: 'u1', avaliadoId: 'u9', nota: 5, comentario: 'Negociação tranquila.', criadoEm: diasAtras(8) },
    { id: 'v9', negocioId: 'n3', autorId: 'u9', avaliadoId: 'u14', nota: 5, comentario: 'A carga refrigerada chegou em ótimo estado.', criadoEm: diasAtras(8) },
    { id: 'v10', negocioId: 'n4', autorId: 'u10', avaliadoId: 'u5', nota: 5, comentario: 'Batata padrão especial, exatamente como anunciado.', criadoEm: diasAtras(15) },
    { id: 'v11', negocioId: 'n4', autorId: 'u5', avaliadoId: 'u10', nota: 4, comentario: 'Bom comprador. Só demorou um pouco para confirmar a retirada.', criadoEm: diasAtras(15) }
  ],

  // ---------- Notificações (sino) ----------
  notificacoes: [
    { id: 'x1', usuarioId: 'u1', texto: 'Supermercados Coxipó procura 400 caixas de tomate na sua região.', destino: 'mercado', lida: false, criadoEm: diasAtras(1) },
    { id: 'x2', usuarioId: 'u7', texto: 'Pomar Serra Azul avaliou você com 5 estrelas.', destino: 'perfil-u7', lida: false, criadoEm: diasAtras(13) },
    { id: 'x3', usuarioId: 'u12', texto: 'Nova solicitação de frete: Nobres/MT para Campo Grande/MS.', destino: 'fretes', lida: false, criadoEm: diasAtras(1) }
  ]
};
