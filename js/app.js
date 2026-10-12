/* ==========================================================
   HortLink: lógica do protótipo (sem servidor)
   Tudo fica salvo no localStorage do navegador.

   Organização do arquivo:
    1. Configurações
    2. Dados e localStorage
    3. Funções de apoio (formatação, buscas, notas)
    4. Navegação (rotas pelo # do endereço)
    5. Cabeçalho, avisos e janela (modal)
    6. Pedaços de tela reaproveitados (cartões)
    7. Telas
    8. Ações (cliques em botões)
    9. Formulários (envios)
   10. Eventos e início
   ========================================================== */

// ---------- 1. Configurações ----------

const CHAVE_DADOS = 'hortlink_dados_mt';
const CHAVE_USUARIO = 'hortlink_usuario';

// Quando true, o "outro lado" responde sozinho no chat e um transportador
// fictício envia um orçamento de frete. Ajuda a demonstração a fluir.
const RESPOSTAS_AUTOMATICAS = true;

const ETAPAS = ['Em negociação', 'Aceito', 'Entregue', 'Concluído'];

const TIPOS = { produtor: 'Produtor', comprador: 'Comprador', transportador: 'Transportador' };

// Unidade: [singular, plural]
const UNIDADES = {
  'caixa': ['caixa', 'caixas'],
  'kg': ['kg', 'kg'],
  'saco': ['saco', 'sacos'],
  'maço': ['maço', 'maços']
};

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const PRODUTOS = ['tomate', 'alface', 'banana', 'laranja', 'batata', 'cenoura', 'cebola', 'morango', 'limão', 'mamão', 'couve'];

// Etiqueta de cada produto: sigla de 3 letras e a cor usada no cartão.
const ETIQUETAS = {
  tomate: 'tom', alface: 'alf', banana: 'ban', laranja: 'lar', batata: 'bat', cenoura: 'cen',
  cebola: 'ceb', morango: 'mor', limao: 'lim', mamao: 'mam', couve: 'cou'
};

const RESPOSTAS_PRONTAS = [
  'Olá! Recebi sua mensagem. Pode me enviar uma proposta com quantidade e preço?',
  'Combinado. Consigo atender esse volume.',
  'Perfeito. Fico no aguardo da proposta para fecharmos.',
  'Obrigado pelo contato! Qualquer dúvida, é só chamar.'
];

const ROTAS_PUBLICAS = ['entrar', 'mercado', 'profissionais', 'perfil'];


// ---------- 2. Dados e localStorage ----------

let dados = null;       // tudo o que o app guarda (usuários, anúncios, conversas...)
let usuarioId = null;   // id de quem está "logado"

// Filtros das telas de busca (ficam na memória enquanto a página está aberta)
const filtrosMercado = { produto: '', tipo: '', uf: '', cidade: '', precoMax: '', ordem: 'recente' };
const filtrosProfissionais = { tipo: '', local: '' };

let editandoPerfil = false;
let propostaAberta = false;

function copiar(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

function carregar() {
  try {
    const texto = localStorage.getItem(CHAVE_DADOS);
    if (texto) dados = JSON.parse(texto);
    usuarioId = localStorage.getItem(CHAVE_USUARIO);
  } catch (erro) {
    // Sem acesso ao localStorage: o app funciona, mas não guarda nada ao fechar.
  }
  if (!dados) {
    dados = copiar(DADOS_INICIAIS);
    salvar();
  }
  if (usuarioId && !buscarUsuario(usuarioId)) usuarioId = null;
}

function salvar() {
  try {
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
    if (usuarioId) localStorage.setItem(CHAVE_USUARIO, usuarioId);
    else localStorage.removeItem(CHAVE_USUARIO);
  } catch (erro) {
    // Ignora: ver comentário em carregar().
  }
}

function restaurar() {
  dados = copiar(DADOS_INICIAIS);
  usuarioId = null;
  salvar();
}


// ---------- 3. Funções de apoio ----------

function agora() {
  return new Date().toISOString();
}

function novoId(prefixo) {
  return prefixo + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
}

// Evita que um texto digitado pelo usuário seja lido como HTML.
function esc(texto) {
  return String(texto == null ? '' : texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Texto sem acentos e em minúsculas, para comparar "Limão" com "limao".
function simples(texto) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function dinheiro(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function quantidadeTexto(quantidade, unidade) {
  const nomes = UNIDADES[unidade] || [unidade, unidade];
  return Number(quantidade).toLocaleString('pt-BR') + ' ' + (Number(quantidade) === 1 ? nomes[0] : nomes[1]);
}

function unidadeSingular(unidade) {
  return (UNIDADES[unidade] || [unidade])[0];
}

// Exemplo: "500 caixas de tomate"
function tituloCarga(item) {
  return quantidadeTexto(item.quantidade, item.unidade) + ' de ' + item.produto;
}

function tempo(iso) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return 'há ' + dias + ' dias';
  return new Date(iso).toLocaleDateString('pt-BR');
}

// Etiqueta colorida com a sigla do produto (ex.: TOM para tomate).
function htmlEtiqueta(produto, extra) {
  const chave = simples(produto).split(' ')[0];
  const sigla = ETIQUETAS[chave] || chave.slice(0, 3) || 'hf';
  const cor = ETIQUETAS[chave] ? 'cor-' + sigla : 'cor-outro';
  return `<span class="produto-icone ${cor} ${extra || ''}" aria-hidden="true">${esc(sigla.toUpperCase())}</span>`;
}

function iniciais(nome) {
  const partes = String(nome).trim().split(/\s+/).filter(function (p) { return p.length > 2; });
  const letras = (partes[0] || nome).charAt(0) + (partes[1] ? partes[1].charAt(0) : '');
  return letras.toUpperCase();
}

function local(item) {
  return item.cidade + '/' + item.uf;
}

// Buscas por id
function atual() { return usuarioId ? buscarUsuario(usuarioId) : null; }
function buscarUsuario(id) { return dados.usuarios.find(function (u) { return u.id === id; }); }
function buscarAnuncio(id) { return dados.anuncios.find(function (a) { return a.id === id; }); }
function buscarConversa(id) { return dados.conversas.find(function (c) { return c.id === id; }); }
function buscarNegocio(id) { return dados.negocios.find(function (n) { return n.id === id; }); }
function buscarFrete(id) { return dados.fretes.find(function (f) { return f.id === id; }); }
function freteDoNegocio(negocioId) { return dados.fretes.find(function (f) { return f.negocioId === negocioId; }); }

function outroParticipante(conversa) {
  const id = conversa.participantes.find(function (p) { return p !== usuarioId; });
  return buscarUsuario(id);
}

// Nota média de um usuário, calculada a partir das avaliações recebidas.
function media(id) {
  const lista = dados.avaliacoes.filter(function (v) { return v.avaliadoId === id; });
  if (lista.length === 0) return { nota: 0, total: 0 };
  const soma = lista.reduce(function (s, v) { return s + v.nota; }, 0);
  return { nota: soma / lista.length, total: lista.length };
}

// Proximidade de um anúncio em relação a quem está logado:
// 2 = mesma cidade, 1 = mesmo estado, 0 = outra região.
// Não há cálculo de distância: comparamos apenas cidade e UF.
function proximidade(item) {
  const eu = atual();
  if (!eu || item.uf !== eu.uf) return 0;
  return simples(item.cidade) === simples(eu.cidade) ? 2 : 1;
}

// Regra do protótipo: comprador negocia ofertas e produtor atende demandas.
function podeNegociar(usuario, anuncio) {
  if (anuncio.usuarioId === usuario.id) return false;
  return anuncio.tipo === 'oferta' ? usuario.tipo === 'comprador' : usuario.tipo === 'produtor';
}

function notificar(paraId, texto, destino) {
  dados.notificacoes.push({ id: novoId('x'), usuarioId: paraId, texto: texto, destino: destino, lida: false, criadoEm: agora() });
}

// Ofertas (para o comprador) ou demandas (para o produtor) que combinam
// com os produtos do perfil. As da mesma região aparecem primeiro.
function sugestoes(eu) {
  const tipoBuscado = eu.tipo === 'comprador' ? 'oferta' : 'demanda';
  const meusProdutos = eu.produtos.map(simples);
  return dados.anuncios
    .filter(function (a) {
      const nome = simples(a.produto);
      const combina = meusProdutos.some(function (p) { return nome.includes(p) || p.includes(nome); });
      return a.status === 'ativa' && a.tipo === tipoBuscado && a.usuarioId !== eu.id && combina;
    })
    .sort(function (a, b) { return proximidade(b) - proximidade(a) || (b.criadoEm > a.criadoEm ? 1 : -1); })
    .slice(0, 4);
}

// Quem o usuário pode avaliar em um negócio concluído.
function avaliaveis(negocio, eu) {
  const lista = [];
  if (eu.id === negocio.vendedorId) lista.push(negocio.compradorId);
  if (eu.id === negocio.compradorId) lista.push(negocio.vendedorId);
  const frete = freteDoNegocio(negocio.id);
  if (frete && frete.status === 'fechada') {
    if (frete.solicitanteId === eu.id) lista.push(frete.transportadorId);
    if (frete.transportadorId === eu.id) lista.push(frete.solicitanteId);
  }
  return lista;
}


// ---------- 4. Navegação ----------
// O endereço fica assim: app.html#mercado ou app.html#perfil-u1
// A parte antes do traço é a tela; a parte depois é o id.

function rota() {
  const texto = location.hash.replace('#', '');
  const corte = texto.indexOf('-');
  if (corte === -1) return { nome: texto, id: '' };
  return { nome: texto.slice(0, corte), id: texto.slice(corte + 1) };
}

function ir(destino) {
  if (location.hash === '#' + destino) desenhar();
  else location.hash = destino;
}

function desenhar() {
  const eu = atual();
  let r = rota();

  // Sem login, só as telas públicas ficam abertas.
  if (!eu && !ROTAS_PUBLICAS.includes(r.nome)) r = { nome: 'entrar', id: '' };
  if (eu && (r.nome === 'entrar' || !TELAS[r.nome])) r = { nome: 'painel', id: '' };

  desenharTopo(r.nome);
  document.getElementById('conteudo').innerHTML = TELAS[r.nome](r.id);

  // No chat, mostra sempre as mensagens mais recentes.
  const mensagens = document.getElementById('mensagens');
  if (mensagens) mensagens.scrollTop = mensagens.scrollHeight;
}


// ---------- 5. Cabeçalho, avisos e janela ----------

const ICONE_SINO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7 2.5 7h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>';

function htmlLogo() {
  return '<a class="logo" href="index.html" aria-label="HortLink, página inicial">' +
    '<img src="img/logo.svg" alt=""><span>Hort<span>Link</span></span></a>';
}

function desenharTopo(telaAtual) {
  const eu = atual();

  function link(destino, rotulo) {
    const ativo = telaAtual === destino;
    return `<a href="#${destino}" class="${ativo ? 'ativo' : ''}" ${ativo ? 'aria-current="page"' : ''}>${rotulo}</a>`;
  }

  let menu = '';
  let acoes = '';

  if (!eu) {
    menu = link('mercado', 'Mercado') + link('profissionais', 'Profissionais');
    acoes = '<a class="btn btn-verde btn-pequeno" href="#entrar">Entrar</a>';
  } else {
    menu = link('painel', 'Painel') + link('mercado', 'Mercado');
    if (eu.tipo === 'produtor') menu += link('anuncios', 'Minhas ofertas');
    if (eu.tipo === 'comprador') menu += link('anuncios', 'Minhas demandas');
    if (eu.tipo === 'transportador') menu += link('fretes', 'Fretes');
    menu += link('profissionais', 'Profissionais');
    if (eu.tipo !== 'transportador') menu += link('conversas', 'Conversas') + link('negocios', 'Negócios');

    const minhas = dados.notificacoes
      .filter(function (n) { return n.usuarioId === eu.id; })
      .sort(function (a, b) { return b.criadoEm > a.criadoEm ? 1 : -1; });
    const naoLidas = minhas.filter(function (n) { return !n.lida; }).length;

    const itens = minhas.slice(0, 8).map(function (n) {
      return `<button type="button" class="item-menu ${n.lida ? '' : 'nao-lida'}" data-acao="abrirNotificacao" data-id="${n.id}">
        ${esc(n.texto)}<small>${tempo(n.criadoEm)}</small></button>`;
    }).join('');

    acoes = `
      <details class="suspenso">
        <summary class="botao-sino" aria-label="Notificações${naoLidas ? ': ' + naoLidas + ' novas' : ''}">
          ${ICONE_SINO}${naoLidas ? `<span class="contador">${naoLidas}</span>` : ''}
        </summary>
        <div class="suspenso-caixa">
          <h4>Notificações</h4>
          ${itens || '<p class="item-menu">Nenhuma notificação por enquanto.</p>'}
          ${naoLidas ? '<button type="button" class="item-menu" data-acao="lerNotificacoes"><strong>Marcar todas como lidas</strong></button>' : ''}
        </div>
      </details>
      <details class="suspenso">
        <summary class="botao-usuario" aria-label="Menu do usuário">
          <span class="avatar pequeno ${eu.tipo}" aria-hidden="true">${esc(iniciais(eu.nome))}</span>
          <span>${esc(eu.nome)}</span>
        </summary>
        <div class="suspenso-caixa">
          <a class="item-menu" href="#perfil-${eu.id}">Meu perfil<small>${TIPOS[eu.tipo]} · ${esc(local(eu))}</small></a>
          <button type="button" class="item-menu" data-acao="abrirTroca">Trocar de perfil<small>Veja a plataforma como outro usuário</small></button>
          <button type="button" class="item-menu" data-acao="sair">Sair</button>
        </div>
      </details>`;
  }

  document.getElementById('topo').innerHTML = `
    <div class="container">
      ${htmlLogo()}
      <nav class="menu-app" aria-label="Menu principal">${menu}</nav>
      <div class="topo-acoes">${acoes}</div>
    </div>`;
}

function aviso(texto, erro) {
  const caixa = document.createElement('div');
  caixa.className = 'aviso' + (erro ? ' erro' : '');
  caixa.textContent = texto;
  // Mostra um aviso por vez para não cobrir a tela.
  document.getElementById('avisos').innerHTML = '';
  document.getElementById('avisos').appendChild(caixa);
  setTimeout(function () { caixa.remove(); }, 3500);
}

function abrirModal(html) {
  const modal = document.getElementById('modal');
  modal.innerHTML = `<div class="modal-caixa" role="dialog" aria-modal="true">${html}</div>`;
  modal.hidden = false;
  const primeiro = modal.querySelector('input, select, textarea, button');
  if (primeiro) primeiro.focus();
}

function fecharModal() {
  const modal = document.getElementById('modal');
  modal.hidden = true;
  modal.innerHTML = '';
}


// ---------- 6. Pedaços de tela reaproveitados ----------

function htmlAvatar(usuario, tamanho) {
  return `<span class="avatar ${usuario.tipo} ${tamanho || ''}" aria-hidden="true">${esc(iniciais(usuario.nome))}</span>`;
}

function htmlNota(id) {
  const m = media(id);
  if (m.total === 0) return '<span class="nota">Sem avaliações</span>';
  const valor = m.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `<span class="nota">
    <span class="estrelas" style="--nota:${m.nota.toFixed(2)}" role="img" aria-label="Nota ${valor} de 5"></span>
    <strong>${valor}</strong> (${m.total})
  </span>`;
}

function htmlEstrelasFixas(nota) {
  return `<span class="estrelas" style="--nota:${nota}" role="img" aria-label="${nota} de 5 estrelas"></span>`;
}

// Nome, avatar e nota de um usuário, com link para o perfil.
function htmlPessoa(usuario) {
  return `<a class="pessoa" href="#perfil-${usuario.id}">
    ${htmlAvatar(usuario)}
    <span><span class="pessoa-nome">${esc(usuario.nome)}</span><br>${htmlNota(usuario.id)}</span>
  </a>`;
}

function htmlSeloRegiao(item) {
  const p = proximidade(item);
  if (p === 2) return '<span class="selo selo-regiao">Na sua região · mesma cidade</span>';
  if (p === 1) return '<span class="selo selo-regiao">Na sua região</span>';
  return '';
}

// Cartão de uma oferta ou demanda.
function htmlAnuncio(a) {
  const eu = atual();
  const dono = buscarUsuario(a.usuarioId);
  const oferta = a.tipo === 'oferta';

  let acao = '';
  if (a.status !== 'ativa') {
    acao = '<span class="selo">Encerrada</span>';
  } else if (!eu) {
    acao = '<a class="btn btn-primario btn-pequeno" href="#entrar">Entrar para negociar</a>';
  } else if (eu.id === a.usuarioId) {
    acao = `<button type="button" class="btn btn-contorno btn-pequeno" data-acao="encerrarAnuncio" data-id="${a.id}">Encerrar</button>`;
  } else if (podeNegociar(eu, a)) {
    acao = `<button type="button" class="btn btn-primario btn-pequeno" data-acao="negociar" data-id="${a.id}">Negociar</button>`;
  } else {
    acao = `<span class="dica">${oferta ? 'Compradores negociam ofertas' : 'Produtores atendem demandas'}</span>`;
  }

  return `<article class="cartao anuncio ${a.status === 'ativa' && proximidade(a) ? 'na-regiao' : ''}">
    <div class="linha-selos">
      <span class="selo ${oferta ? 'selo-oferta' : 'selo-demanda'}">${oferta ? 'Oferta' : 'Demanda'}</span>
      ${a.status === 'ativa' ? htmlSeloRegiao(a) : ''}
    </div>
    <div class="anuncio-topo">
      ${htmlEtiqueta(a.produto)}
      <div>
        <h3>${esc(tituloCarga(a))}</h3>
        <span class="anuncio-preco">${oferta ? '' : '<small>paga até</small> '}${dinheiro(a.preco)} <small>por ${unidadeSingular(a.unidade)}</small></span>
      </div>
    </div>
    <div class="anuncio-detalhes">
      <span class="linha-icone"><svg class="icone-linha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>${esc(local(a))}</span>
      <span class="linha-icone"><svg class="icone-linha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>${esc(a.disponibilidade || 'A combinar')} · publicado ${tempo(a.criadoEm)}</span>
      ${a.observacao ? `<span>${esc(a.observacao)}</span>` : ''}
    </div>
    <div class="anuncio-rodape">
      ${htmlPessoa(dono)}
      ${acao}
    </div>
  </article>`;
}

function htmlOpcoesUF(selecionada, comTodos) {
  return (comTodos ? '<option value="">Todos</option>' : '') + UFS.map(function (uf) {
    return `<option value="${uf}" ${uf === selecionada ? 'selected' : ''}>${uf}</option>`;
  }).join('');
}

function htmlVazio(texto) {
  return `<p class="vazio">${texto}</p>`;
}

// Resumo de uma conversa (usado no painel e na lista de conversas).
function htmlResumoConversa(c, ativa) {
  const outro = outroParticipante(c);
  const ultima = c.mensagens[c.mensagens.length - 1];
  let previa = 'Conversa iniciada';
  if (ultima) {
    previa = ultima.tipo === 'proposta'
      ? 'Proposta: ' + quantidadeTexto(ultima.quantidade, buscarAnuncio(c.anuncioId).unidade) + ' a ' + dinheiro(ultima.preco)
      : ultima.texto;
  }
  return `<a class="resumo-conversa ${ativa ? 'ativo' : ''}" href="#conversas-${c.id}">
    ${htmlAvatar(outro)}
    <div>
      <span class="pessoa-nome">${esc(outro.nome)}</span>
      <p>${esc(previa)}</p>
    </div>
  </a>`;
}


// ---------- 7. Telas ----------
// Cada função devolve o HTML de uma tela. O nome é o mesmo usado no endereço (#nome).

const TELAS = {};

// 7.1 Entrada e cadastro (simulados)
TELAS.entrar = function () {
  const exemplos = dados.usuarios.filter(function (u) { return u.exemplo; }).map(function (u) {
    return `<button type="button" class="exemplo-usuario" data-acao="entrarComo" data-id="${u.id}">
      ${htmlAvatar(u)}
      <span><strong>${esc(u.nome)}</strong><small>${TIPOS[u.tipo]} · ${esc(local(u))}</small></span>
    </button>`;
  }).join('');

  return `
    <div class="cabecalho-tela">
      <div>
        <h1>Entrar na demonstração</h1>
        <p>Crie um perfil de teste ou use um dos perfis de exemplo. Não há senha.</p>
      </div>
    </div>
    <div class="entrada">
      <section class="cartao">
        <h2 class="subtitulo" style="margin-top:0">Cadastro</h2>
        <form data-form="cadastro" class="pilha">
          <div class="campo">
            <label for="cad-nome">Nome ou nome do negócio</label>
            <input id="cad-nome" name="nome" required maxlength="60" placeholder="Ex.: Sítio Boa Colheita">
          </div>
          <div class="campo">
            <span class="rotulo" id="cad-tipo-rotulo">Tipo de perfil</span>
            <div class="opcoes-tipo" role="radiogroup" aria-labelledby="cad-tipo-rotulo">
              <label><input type="radio" name="tipo" value="produtor" checked> Produtor</label>
              <label><input type="radio" name="tipo" value="comprador"> Comprador</label>
              <label><input type="radio" name="tipo" value="transportador"> Transportador</label>
            </div>
          </div>
          <div class="grade-formulario">
            <div class="campo">
              <label for="cad-cidade">Cidade</label>
              <input id="cad-cidade" name="cidade" required maxlength="40" placeholder="Ex.: Cuiabá">
            </div>
            <div class="campo">
              <label for="cad-uf">Estado (UF)</label>
              <select id="cad-uf" name="uf">${htmlOpcoesUF('MT')}</select>
            </div>
          </div>
          <div class="campo">
            <label for="cad-produtos">Produtos cultivados ou de interesse</label>
            <input id="cad-produtos" name="produtos" placeholder="Ex.: tomate, alface, couve">
            <small>Separe por vírgula. Transportadores podem deixar em branco.</small>
          </div>
          <div><button type="submit" class="btn btn-primario">Cadastrar e entrar</button></div>
        </form>
      </section>
      <section class="cartao">
        <h2 class="subtitulo" style="margin-top:0">Entrar como usuário de exemplo</h2>
        <div class="pilha" style="gap:10px">${exemplos}</div>
        <p class="dica" style="margin-top:14px">Depois de entrar, use "Trocar de perfil" no menu do usuário para ver o outro lado da negociação.</p>
      </section>
    </div>`;
};

// 7.2 Painel
TELAS.painel = function () {
  const eu = atual();
  return eu.tipo === 'transportador' ? painelTransportador(eu) : painelComercial(eu);
};

function painelComercial(eu) {
  const produtor = eu.tipo === 'produtor';
  const ativos = dados.anuncios.filter(function (a) { return a.usuarioId === eu.id && a.status === 'ativa'; });
  const negocios = dados.negocios.filter(function (n) { return n.vendedorId === eu.id || n.compradorId === eu.id; });
  const andamento = negocios.filter(function (n) { return ['Em negociação', 'Aceito', 'Entregue'].includes(n.status); });
  const conversas = dados.conversas
    .filter(function (c) { return c.participantes.includes(eu.id); })
    .sort(function (a, b) { return b.atualizadoEm > a.atualizadoEm ? 1 : -1; });
  const m = media(eu.id);
  const lista = sugestoes(eu);

  return `
    <div class="cabecalho-tela">
      <div>
        <h1>Olá, ${esc(eu.nome)}</h1>
        <p><span class="selo selo-${eu.tipo}">${TIPOS[eu.tipo]}</span> ${esc(local(eu))}</p>
      </div>
      <a class="btn btn-primario" href="#anuncios">${produtor ? 'Publicar oferta' : 'Publicar demanda'}</a>
    </div>

    <div class="numeros">
      <div class="numero"><strong>${ativos.length}</strong><span>${produtor ? 'Ofertas ativas' : 'Demandas ativas'}</span></div>
      <div class="numero"><strong>${andamento.length}</strong><span>Negócios em andamento</span></div>
      <div class="numero"><strong>${m.total ? m.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '·'}</strong><span>Nota média (${m.total} ${m.total === 1 ? 'avaliação' : 'avaliações'})</span></div>
      <div class="numero"><strong>${conversas.length}</strong><span>Conversas</span></div>
    </div>

    <div class="painel-colunas">
      <section>
        <h2 class="subtitulo">${produtor ? 'Demandas que combinam com seus produtos' : 'Ofertas que combinam com seu interesse'}</h2>
        ${lista.length
          ? `<div class="grade">${lista.map(htmlAnuncio).join('')}</div>`
          : htmlVazio('Nenhuma sugestão agora. Inclua mais produtos no seu perfil ou veja o <a href="#mercado">mercado</a>.')}
      </section>
      <div>
        <section>
          <h2 class="subtitulo">Negócios em andamento</h2>
          ${andamento.length
            ? `<div class="cartao lista-simples">${andamento.slice(0, 4).map(function (n) {
                const outro = buscarUsuario(n.vendedorId === eu.id ? n.compradorId : n.vendedorId);
                return `<a class="resumo-conversa" href="#negocios">
                  ${htmlEtiqueta(n.produto, 'pequeno')}
                  <div><span class="pessoa-nome">${esc(tituloCarga(n))}</span><p>${esc(outro.nome)} · ${n.status}</p></div>
                </a>`;
              }).join('')}</div>`
            : htmlVazio('Nenhum negócio em andamento.')}
        </section>
        <section>
          <h2 class="subtitulo">Últimas conversas</h2>
          ${conversas.length
            ? `<div class="cartao lista-simples">${conversas.slice(0, 4).map(function (c) { return htmlResumoConversa(c, false); }).join('')}</div>`
            : htmlVazio('Você ainda não tem conversas. Clique em "Negociar" em um anúncio do mercado.')}
        </section>
      </div>
    </div>`;
}

function painelTransportador(eu) {
  const abertas = dados.fretes.filter(function (f) { return f.status === 'aberta'; });
  const enviados = dados.fretes.filter(function (f) {
    return f.status === 'aberta' && f.orcamentos.some(function (o) { return o.transportadorId === eu.id; });
  });
  const fechados = dados.fretes.filter(function (f) { return f.status === 'fechada' && f.transportadorId === eu.id; });
  const m = media(eu.id);

  return `
    <div class="cabecalho-tela">
      <div>
        <h1>Olá, ${esc(eu.nome)}</h1>
        <p><span class="selo selo-transportador">Transportador</span> ${esc(local(eu))}</p>
      </div>
      <a class="btn btn-primario" href="#fretes">Ver solicitações de frete</a>
    </div>
    <div class="numeros">
      <div class="numero"><strong>${abertas.length}</strong><span>Solicitações abertas</span></div>
      <div class="numero"><strong>${enviados.length}</strong><span>Orçamentos aguardando resposta</span></div>
      <div class="numero"><strong>${fechados.length}</strong><span>Fretes fechados</span></div>
      <div class="numero"><strong>${m.total ? m.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '·'}</strong><span>Nota média (${m.total} ${m.total === 1 ? 'avaliação' : 'avaliações'})</span></div>
    </div>
    <h2 class="subtitulo">Solicitações abertas</h2>
    ${abertas.length ? `<div class="pilha">${abertas.map(htmlFreteTransportador).join('')}</div>` : htmlVazio('Nenhuma solicitação de frete aberta no momento.')}`;
}

// 7.3 Mercado: busca de ofertas e demandas por região
TELAS.mercado = function () {
  const eu = atual();
  const f = filtrosMercado;
  let botao = '';
  if (eu && eu.tipo !== 'transportador') {
    botao = `<a class="btn btn-primario" href="#anuncios">${eu.tipo === 'produtor' ? 'Publicar oferta' : 'Publicar demanda'}</a>`;
  }

  return `
    <div class="cabecalho-tela">
      <div>
        <h1>Mercado</h1>
        <p>Ofertas de produtores e demandas de compradores.${eu ? ' O que está em ' + esc(eu.uf) + ' aparece primeiro.' : ''}</p>
      </div>
      ${botao}
    </div>
    <form class="filtros" data-filtros="mercado" aria-label="Filtros de busca">
      <div class="campo">
        <label for="f-produto">Produto</label>
        <input id="f-produto" name="produto" type="search" value="${esc(f.produto)}" placeholder="Ex.: tomate">
      </div>
      <div class="campo">
        <label for="f-tipo">Tipo</label>
        <select id="f-tipo" name="tipo">
          <option value="" ${f.tipo === '' ? 'selected' : ''}>Ofertas e demandas</option>
          <option value="oferta" ${f.tipo === 'oferta' ? 'selected' : ''}>Só ofertas</option>
          <option value="demanda" ${f.tipo === 'demanda' ? 'selected' : ''}>Só demandas</option>
        </select>
      </div>
      <div class="campo">
        <label for="f-uf">Estado</label>
        <select id="f-uf" name="uf">${htmlOpcoesUF(f.uf, true)}</select>
      </div>
      <div class="campo">
        <label for="f-cidade">Cidade</label>
        <input id="f-cidade" name="cidade" type="search" value="${esc(f.cidade)}" placeholder="Ex.: Sinop">
      </div>
      <div class="campo">
        <label for="f-preco">Preço máximo (R$)</label>
        <input id="f-preco" name="precoMax" type="number" min="0" step="0.01" value="${esc(f.precoMax)}" placeholder="Sem limite">
      </div>
      <div class="campo">
        <label for="f-ordem">Ordenar por</label>
        <select id="f-ordem" name="ordem">
          <option value="recente" ${f.ordem === 'recente' ? 'selected' : ''}>Mais recente</option>
          <option value="preco" ${f.ordem === 'preco' ? 'selected' : ''}>Menor preço</option>
          <option value="avaliacao" ${f.ordem === 'avaliacao' ? 'selected' : ''}>Melhor avaliação</option>
        </select>
      </div>
    </form>
    <div id="lista-mercado">${listaMercado()}</div>`;
};

// Aplica os filtros e a ordenação e devolve o HTML dos resultados.
function listaMercado() {
  const f = filtrosMercado;
  // Os anúncios do próprio usuário ficam em "Minhas ofertas" ou "Minhas demandas".
  let itens = dados.anuncios.filter(function (a) { return a.status === 'ativa' && a.usuarioId !== usuarioId; });

  if (f.produto) itens = itens.filter(function (a) { return simples(a.produto).includes(simples(f.produto)); });
  if (f.tipo) itens = itens.filter(function (a) { return a.tipo === f.tipo; });
  if (f.uf) itens = itens.filter(function (a) { return a.uf === f.uf; });
  if (f.cidade) itens = itens.filter(function (a) { return simples(a.cidade).includes(simples(f.cidade)); });
  if (f.precoMax) itens = itens.filter(function (a) { return a.preco <= Number(f.precoMax); });

  const ordens = {
    recente: function (a, b) { return b.criadoEm > a.criadoEm ? 1 : -1; },
    preco: function (a, b) { return a.preco - b.preco; },
    avaliacao: function (a, b) { return media(b.usuarioId).nota - media(a.usuarioId).nota; }
  };
  itens.sort(ordens[f.ordem]);

  if (itens.length === 0) return htmlVazio('Nenhum anúncio encontrado com esses filtros.');

  // Anúncios da região de quem está logado vêm antes dos demais.
  const perto = itens.filter(function (a) { return proximidade(a) > 0; })
    .sort(function (a, b) { return proximidade(b) - proximidade(a); });
  const longe = itens.filter(function (a) { return proximidade(a) === 0; });

  if (perto.length === 0) {
    return `<p class="dica" style="margin-bottom:12px">${itens.length} ${itens.length === 1 ? 'anúncio encontrado' : 'anúncios encontrados'}</p>
      <div class="grade">${itens.map(htmlAnuncio).join('')}</div>`;
  }
  return `
    <h2 class="titulo-grupo"><span class="selo selo-regiao">Na sua região</span> ${perto.length} ${perto.length === 1 ? 'anúncio' : 'anúncios'}</h2>
    <div class="grade">${perto.map(htmlAnuncio).join('')}</div>
    ${longe.length ? `<h2 class="titulo-grupo">Outras regiões <span class="dica">${longe.length} ${longe.length === 1 ? 'anúncio' : 'anúncios'}</span></h2>
    <div class="grade">${longe.map(htmlAnuncio).join('')}</div>` : ''}`;
}

// 7.4 Minhas ofertas (produtor) ou minhas demandas (comprador)
TELAS.anuncios = function () {
  const eu = atual();
  if (eu.tipo === 'transportador') {
    return htmlVazio('Transportadores não publicam ofertas. Veja as <a href="#fretes">solicitações de frete</a>.');
  }
  const oferta = eu.tipo === 'produtor';
  const meus = dados.anuncios
    .filter(function (a) { return a.usuarioId === eu.id; })
    .sort(function (a, b) { return (a.status === 'ativa' ? 0 : 1) - (b.status === 'ativa' ? 0 : 1) || (b.criadoEm > a.criadoEm ? 1 : -1); });

  return `
    <div class="cabecalho-tela">
      <div>
        <h1>${oferta ? 'Minhas ofertas' : 'Minhas demandas'}</h1>
        <p>${oferta ? 'Publique o que você tem para vender.' : 'Publique o que você precisa comprar.'}</p>
      </div>
    </div>
    <section class="cartao">
      <h2 class="subtitulo" style="margin-top:0">${oferta ? 'Nova oferta' : 'Nova demanda'}</h2>
      <form data-form="anuncio" class="pilha">
        <div class="grade-formulario">
          <div class="campo">
            <label for="an-produto">Produto</label>
            <input id="an-produto" name="produto" list="lista-produtos" required maxlength="30" placeholder="Ex.: tomate">
            <datalist id="lista-produtos">${PRODUTOS.map(function (p) { return `<option value="${p}">`; }).join('')}</datalist>
          </div>
          <div class="campo">
            <label for="an-quantidade">Quantidade</label>
            <input id="an-quantidade" name="quantidade" type="number" min="1" step="1" required placeholder="Ex.: 500">
          </div>
          <div class="campo">
            <label for="an-unidade">Unidade</label>
            <select id="an-unidade" name="unidade">
              ${Object.keys(UNIDADES).map(function (u) { return `<option value="${u}">${u}</option>`; }).join('')}
            </select>
          </div>
          <div class="campo">
            <label for="an-preco">${oferta ? 'Preço por unidade (R$)' : 'Preço máximo por unidade (R$)'}</label>
            <input id="an-preco" name="preco" type="number" min="0.01" step="0.01" required placeholder="Ex.: 80">
          </div>
          <div class="campo">
            <label for="an-cidade">Cidade</label>
            <input id="an-cidade" name="cidade" required maxlength="40" value="${esc(eu.cidade)}">
          </div>
          <div class="campo">
            <label for="an-uf">Estado (UF)</label>
            <select id="an-uf" name="uf">${htmlOpcoesUF(eu.uf)}</select>
          </div>
          <div class="campo">
            <label for="an-disponibilidade">${oferta ? 'Disponibilidade' : 'Prazo desejado'}</label>
            <input id="an-disponibilidade" name="disponibilidade" maxlength="40" value="Imediata">
          </div>
          <div class="campo campo-largo">
            <label for="an-observacao">Observação (opcional)</label>
            <textarea id="an-observacao" name="observacao" maxlength="160" placeholder="Ex.: caixa de 20 kg, tomate italiano"></textarea>
          </div>
        </div>
        <div><button type="submit" class="btn btn-primario">${oferta ? 'Publicar oferta' : 'Publicar demanda'}</button></div>
      </form>
    </section>
    <h2 class="subtitulo">${oferta ? 'Ofertas publicadas' : 'Demandas publicadas'}</h2>
    ${meus.length ? `<div class="grade">${meus.map(htmlAnuncio).join('')}</div>` : htmlVazio('Você ainda não publicou nada.')}`;
};

// 7.5 Profissionais
TELAS.profissionais = function () {
  const f = filtrosProfissionais;
  return `
    <div class="cabecalho-tela">
      <div>
        <h1>Profissionais</h1>
        <p>Produtores, compradores e transportadores da rede.</p>
      </div>
    </div>
    <form class="filtros" data-filtros="profissionais" aria-label="Filtros de profissionais">
      <div class="campo">
        <label for="p-tipo">Tipo de perfil</label>
        <select id="p-tipo" name="tipo">
          <option value="">Todos</option>
          ${Object.keys(TIPOS).map(function (t) { return `<option value="${t}" ${f.tipo === t ? 'selected' : ''}>${TIPOS[t]}</option>`; }).join('')}
        </select>
      </div>
      <div class="campo">
        <label for="p-local">Cidade ou UF</label>
        <input id="p-local" name="local" type="search" value="${esc(f.local)}" placeholder="Ex.: Rondonópolis ou MT">
      </div>
    </form>
    <div id="lista-profissionais">${listaProfissionais()}</div>`;
};

function listaProfissionais() {
  const f = filtrosProfissionais;
  let lista = dados.usuarios.slice();
  if (f.tipo) lista = lista.filter(function (u) { return u.tipo === f.tipo; });
  if (f.local) {
    const busca = simples(f.local);
    lista = lista.filter(function (u) { return simples(u.cidade).includes(busca) || simples(u.uf) === busca; });
  }
  // Mesma região primeiro, depois a melhor nota.
  lista.sort(function (a, b) { return proximidade(b) - proximidade(a) || media(b.id).nota - media(a.id).nota; });

  if (lista.length === 0) return htmlVazio('Nenhum profissional encontrado.');

  return `<div class="grade">${lista.map(function (u) {
    return `<article class="cartao anuncio">
      <div class="anuncio-topo">
        ${htmlAvatar(u)}
        <div>
          <h3>${esc(u.nome)}</h3>
          <span class="dica">${esc(local(u))}${u.segmento ? ' · ' + esc(u.segmento) : ''}</span>
        </div>
      </div>
      <div class="linha-selos">
        <span class="selo selo-${u.tipo}">${TIPOS[u.tipo]}</span>
        ${u.id !== usuarioId ? htmlSeloRegiao(u) : '<span class="selo">Você</span>'}
      </div>
      ${u.produtos.length ? `<div class="linha-selos">${u.produtos.map(function (p) { return `<span class="selo">${esc(p)}</span>`; }).join('')}</div>` : ''}
      <div class="anuncio-rodape">
        ${htmlNota(u.id)}
        <a class="btn btn-contorno btn-pequeno" href="#perfil-${u.id}">Ver perfil</a>
      </div>
    </article>`;
  }).join('')}</div>`;
}

// 7.6 Perfil
TELAS.perfil = function (id) {
  const eu = atual();
  const u = buscarUsuario(id) || eu;
  if (!u) return htmlVazio('Perfil não encontrado. Veja a lista de <a href="#profissionais">profissionais</a>.');

  const meu = eu && eu.id === u.id;
  const ativos = dados.anuncios.filter(function (a) { return a.usuarioId === u.id && a.status === 'ativa'; });
  const recebidas = dados.avaliacoes
    .filter(function (v) { return v.avaliadoId === u.id; })
    .sort(function (a, b) { return b.criadoEm > a.criadoEm ? 1 : -1; });

  const formulario = !(meu && editandoPerfil) ? '' : `
    <form data-form="perfil" class="pilha" style="margin-top:20px">
      <div class="grade-formulario">
        <div class="campo">
          <label for="pf-nome">Nome</label>
          <input id="pf-nome" name="nome" required maxlength="60" value="${esc(u.nome)}">
        </div>
        <div class="campo">
          <label for="pf-cidade">Cidade</label>
          <input id="pf-cidade" name="cidade" required maxlength="40" value="${esc(u.cidade)}">
        </div>
        <div class="campo">
          <label for="pf-uf">Estado (UF)</label>
          <select id="pf-uf" name="uf">${htmlOpcoesUF(u.uf)}</select>
        </div>
        <div class="campo campo-largo">
          <label for="pf-produtos">Produtos (separados por vírgula)</label>
          <input id="pf-produtos" name="produtos" value="${esc(u.produtos.join(', '))}">
        </div>
        <div class="campo campo-largo">
          <label for="pf-descricao">Descrição</label>
          <textarea id="pf-descricao" name="descricao" maxlength="240">${esc(u.descricao)}</textarea>
        </div>
      </div>
      <div class="linha-botoes">
        <button type="submit" class="btn btn-primario">Salvar perfil</button>
        <button type="button" class="btn btn-contorno" data-acao="cancelarEdicao">Cancelar</button>
      </div>
    </form>`;

  return `
    <section class="cartao">
      <div class="perfil-topo">
        ${htmlAvatar(u, 'grande')}
        <div class="perfil-dados">
          <h1>${esc(u.nome)}</h1>
          <div class="linha-selos">
            <span class="selo selo-${u.tipo}">${TIPOS[u.tipo]}</span>
            ${u.segmento ? `<span class="selo">${esc(u.segmento)}</span>` : ''}
            <span class="selo linha-icone"><svg class="icone-linha" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>${esc(local(u))}</span>
          </div>
          ${htmlNota(u.id)}
          <p>${esc(u.descricao) || '<span class="dica">Sem descrição.</span>'}</p>
          ${u.produtos.length ? `<div class="linha-selos">${u.produtos.map(function (p) { return `<span class="selo">${esc(p)}</span>`; }).join('')}</div>` : ''}
        </div>
        ${meu && !editandoPerfil ? '<button type="button" class="btn btn-contorno btn-pequeno" data-acao="editarPerfil">Editar perfil</button>' : ''}
      </div>
      ${formulario}
    </section>

    ${u.tipo === 'transportador' ? '' : `
      <h2 class="subtitulo">${u.tipo === 'produtor' ? 'Ofertas ativas' : 'Demandas ativas'}</h2>
      ${ativos.length ? `<div class="grade">${ativos.map(htmlAnuncio).join('')}</div>` : htmlVazio('Nenhum anúncio ativo.')}`}

    <h2 class="subtitulo">Avaliações recebidas</h2>
    ${recebidas.length
      ? `<div class="cartao lista-simples">${recebidas.map(function (v) {
          const autor = buscarUsuario(v.autorId);
          return `<div class="avaliacao">
            ${htmlEstrelasFixas(v.nota)}
            <p>${esc(v.comentario) || '<span class="dica">Sem comentário.</span>'}</p>
            <small>${esc(autor ? autor.nome : 'Usuário')} · ${tempo(v.criadoEm)}</small>
          </div>`;
        }).join('')}</div>`
      : htmlVazio('Este perfil ainda não recebeu avaliações.')}`;
};

// 7.7 Conversas (chat simulado com propostas)
TELAS.conversas = function (id) {
  const eu = atual();
  const lista = dados.conversas
    .filter(function (c) { return c.participantes.includes(eu.id); })
    .sort(function (a, b) { return b.atualizadoEm > a.atualizadoEm ? 1 : -1; });

  if (lista.length === 0) {
    return `<div class="cabecalho-tela"><div><h1>Conversas</h1></div></div>
      ${htmlVazio('Você ainda não tem conversas. Abra o <a href="#mercado">mercado</a> e clique em "Negociar" em um anúncio.')}`;
  }

  // No computador, abre a conversa mais recente quando nenhuma foi escolhida.
  const aberta = lista.find(function (c) { return c.id === id; }) || lista[0];

  return `
    <div class="cabecalho-tela"><div><h1>Conversas</h1></div></div>
    <div class="conversas ${id ? 'com-conversa' : ''}">
      <nav class="cartao conversas-lista" aria-label="Lista de conversas">
        ${lista.map(function (c) { return htmlResumoConversa(c, c.id === aberta.id); }).join('')}
      </nav>
      ${htmlChat(aberta)}
    </div>`;
};

function htmlChat(c) {
  const eu = atual();
  const outro = outroParticipante(c);
  const a = buscarAnuncio(c.anuncioId);
  const pendente = c.mensagens.some(function (m) { return m.tipo === 'proposta' && m.status === 'pendente'; });
  const podePropor = a.status === 'ativa' && !pendente;

  const mensagens = c.mensagens.map(function (m) {
    if (m.tipo === 'sistema') return `<p class="mensagem-sistema">${esc(m.texto)}</p>`;
    if (m.tipo === 'proposta') return htmlProposta(c, m, a);
    const minha = m.autorId === eu.id;
    return `<div class="mensagem ${minha ? 'minha' : ''}">
      ${esc(m.texto)}
      <small>${minha ? 'Você' : esc(outro.nome)} · ${tempo(m.criadoEm)}${m.automatica ? ' · resposta automática' : ''}</small>
    </div>`;
  }).join('');

  let rodape = '';
  if (propostaAberta && podePropor) {
    rodape = `
      <form data-form="proposta" data-id="${c.id}" class="caixa-proposta pilha" style="gap:12px">
        <strong>Nova proposta para ${esc(a.produto)}</strong>
        <div class="grade-formulario">
          <div class="campo">
            <label for="pr-quantidade">Quantidade (${esc(UNIDADES[a.unidade] ? UNIDADES[a.unidade][1] : a.unidade)})</label>
            <input id="pr-quantidade" name="quantidade" type="number" min="1" max="${a.quantidade}" step="1" required value="${Math.min(a.quantidade, 200)}">
            <small>Disponível: ${quantidadeTexto(a.quantidade, a.unidade)}</small>
          </div>
          <div class="campo">
            <label for="pr-preco">Preço por ${unidadeSingular(a.unidade)} (R$)</label>
            <input id="pr-preco" name="preco" type="number" min="0.01" step="0.01" required value="${a.preco}">
          </div>
        </div>
        <div class="linha-botoes">
          <button type="submit" class="btn btn-primario btn-pequeno">Enviar proposta</button>
          <button type="button" class="btn btn-contorno btn-pequeno" data-acao="alternarProposta">Cancelar</button>
        </div>
      </form>`;
  } else if (podePropor) {
    rodape = '<div><button type="button" class="btn btn-contorno btn-pequeno" data-acao="alternarProposta">Fazer proposta</button></div>';
  } else if (a.status !== 'ativa') {
    rodape = '<p class="dica">Este anúncio foi encerrado. Não é possível enviar novas propostas.</p>';
  }

  return `
    <section class="cartao chat" aria-label="Conversa com ${esc(outro.nome)}">
      <div class="chat-topo">
        <a class="btn-texto so-celular" href="#conversas" aria-label="Voltar para a lista de conversas">←</a>
        ${htmlPessoa(outro)}
        <span class="selo selo-${outro.tipo}">${TIPOS[outro.tipo]}</span>
      </div>
      <p class="chat-anuncio">
        ${a.tipo === 'oferta' ? 'Oferta' : 'Demanda'}: <strong>${esc(tituloCarga(a))}</strong>
        · ${dinheiro(a.preco)} por ${unidadeSingular(a.unidade)} · ${esc(local(a))}
      </p>
      <div class="chat-mensagens" id="mensagens">
        ${mensagens || '<p class="mensagem-sistema">Envie uma mensagem ou faça uma proposta para começar.</p>'}
      </div>
      <div class="chat-rodape">
        ${rodape}
        <form data-form="mensagem" data-id="${c.id}" class="chat-envio">
          <label class="so-leitor" for="campo-mensagem">Mensagem</label>
          <input id="campo-mensagem" name="texto" autocomplete="off" maxlength="300" placeholder="Escreva uma mensagem">
          <button type="submit" class="btn btn-verde btn-pequeno">Enviar</button>
        </form>
      </div>
    </section>`;
}

function htmlProposta(c, m, a) {
  const eu = atual();
  const minha = m.autorId === eu.id;
  const outro = outroParticipante(c);

  let rodape = '';
  if (m.status === 'pendente' && !minha) {
    rodape = `<div class="linha-botoes">
      <button type="button" class="btn btn-verde btn-pequeno" data-acao="responderProposta" data-conversa="${c.id}" data-mensagem="${m.id}" data-resposta="aceita">Aceitar</button>
      <button type="button" class="btn btn-contorno btn-pequeno" data-acao="responderProposta" data-conversa="${c.id}" data-mensagem="${m.id}" data-resposta="recusada">Recusar</button>
    </div>`;
  } else if (m.status === 'pendente') {
    rodape = `<span class="selo selo-alerta">Aguardando resposta</span>
      <button type="button" class="btn-texto" data-acao="entrarComo" data-id="${outro.id}" data-destino="conversas-${c.id}">Entrar como ${esc(outro.nome)} para responder</button>`;
  } else if (m.status === 'aceita') {
    rodape = '<span class="linha-botoes"><span class="selo selo-sucesso">Aceita</span> <a href="#negocios">Ver negócio</a></span>';
  } else {
    rodape = '<span><span class="selo selo-erro">Recusada</span></span>';
  }

  return `<div class="proposta ${minha ? 'minha' : ''}">
    <h4>Proposta de ${minha ? 'você' : esc(buscarUsuario(m.autorId).nome)}</h4>
    <strong>${esc(quantidadeTexto(m.quantidade, a.unidade))} de ${esc(a.produto)} a ${dinheiro(m.preco)} por ${unidadeSingular(a.unidade)}</strong>
    <span class="dica">Total: ${dinheiro(m.quantidade * m.preco)}</span>
    ${rodape}
  </div>`;
}

// 7.8 Negócios
TELAS.negocios = function () {
  const eu = atual();
  const ordem = { 'Aceito': 0, 'Entregue': 1, 'Em negociação': 2, 'Concluído': 3, 'Recusado': 4 };
  const lista = dados.negocios
    .filter(function (n) { return n.vendedorId === eu.id || n.compradorId === eu.id; })
    .sort(function (a, b) { return ordem[a.status] - ordem[b.status] || (b.criadoEm > a.criadoEm ? 1 : -1); });

  return `
    <div class="cabecalho-tela">
      <div>
        <h1>Negócios</h1>
        <p>Acompanhe cada negócio do aceite da proposta até a avaliação.</p>
      </div>
    </div>
    ${lista.length
      ? `<div class="pilha">${lista.map(htmlNegocio).join('')}</div>`
      : htmlVazio('Nenhum negócio ainda. Envie uma proposta em uma <a href="#conversas">conversa</a>.')}`;
};

function htmlNegocio(n) {
  const eu = atual();
  const souVendedor = n.vendedorId === eu.id;
  const outro = buscarUsuario(souVendedor ? n.compradorId : n.vendedorId);
  const posicao = ETAPAS.indexOf(n.status);

  let etapas = '';
  if (n.status === 'Recusado') {
    etapas = '<div><span class="selo selo-erro">Proposta recusada</span></div>';
  } else {
    etapas = `<ol class="etapas" aria-label="Etapas do negócio">${ETAPAS.map(function (nome, i) {
      const classe = i < posicao || n.status === 'Concluído' ? 'feita' : (i === posicao ? 'atual' : '');
      return `<li class="etapa ${classe}" ${i === posicao ? 'aria-current="step"' : ''}>${nome}</li>`;
    }).join('')}</ol>`;
  }

  let acao = '';
  if (n.status === 'Em negociação') {
    acao = `<span class="dica">A proposta aguarda resposta.</span> <a class="btn btn-contorno btn-pequeno" href="#conversas-${n.conversaId}">Abrir conversa</a>`;
  } else if (n.status === 'Aceito') {
    acao = `<button type="button" class="btn btn-primario btn-pequeno" data-acao="avancarNegocio" data-id="${n.id}">Marcar como entregue</button>
      <a class="btn btn-contorno btn-pequeno" href="#conversas-${n.conversaId}">Abrir conversa</a>`;
  } else if (n.status === 'Entregue') {
    acao = `<button type="button" class="btn btn-primario btn-pequeno" data-acao="avancarNegocio" data-id="${n.id}">Concluir negócio</button>`;
  }

  return `<article class="cartao negocio" id="negocio-${n.id}">
    <div class="negocio-topo">
      <div class="negocio-titulo">
        ${htmlEtiqueta(n.produto)}
        <div>
          <h3>${esc(tituloCarga(n))}</h3>
          <p>${souVendedor ? 'Venda para' : 'Compra de'} <a href="#perfil-${outro.id}">${esc(outro.nome)}</a> · ${tempo(n.criadoEm)}</p>
        </div>
      </div>
      <div class="negocio-valor">${dinheiro(n.quantidade * n.preco)}<small>${dinheiro(n.preco)} por ${unidadeSingular(n.unidade)}</small></div>
    </div>
    ${etapas}
    ${acao ? `<div class="linha-botoes">${acao}</div>` : ''}
    ${htmlFreteDoNegocio(n)}
    ${htmlAvaliacoesDoNegocio(n)}
  </article>`;
}

// Bloco de frete dentro do cartão do negócio.
function htmlFreteDoNegocio(n) {
  const eu = atual();
  const frete = freteDoNegocio(n.id);

  if (!frete) {
    if (n.status !== 'Aceito') return '';
    return `<div class="bloco">
      <h4>Frete</h4>
      <p class="dica">Precisa de transporte? Os transportadores da rede recebem o pedido e enviam orçamentos.</p>
      <div><button type="button" class="btn btn-contorno btn-pequeno" data-acao="abrirFrete" data-id="${n.id}">Solicitar frete</button></div>
    </div>`;
  }

  const trajeto = `${esc(frete.origem)} → ${esc(frete.destino)}`;

  if (frete.status === 'fechada') {
    const t = buscarUsuario(frete.transportadorId);
    return `<div class="bloco">
      <h4>Frete combinado</h4>
      <p>${trajeto} com <a href="#perfil-${t.id}">${esc(t.nome)}</a> por <strong>${dinheiro(frete.valor)}</strong>.</p>
    </div>`;
  }

  const souSolicitante = frete.solicitanteId === eu.id;
  const orcamentos = frete.orcamentos.map(function (o) {
    const t = buscarUsuario(o.transportadorId);
    return `<div class="orcamento">
      ${htmlPessoa(t)}
      <strong>${dinheiro(o.valor)}</strong>
      ${souSolicitante ? `<button type="button" class="btn btn-verde btn-pequeno" data-acao="aceitarOrcamento" data-frete="${frete.id}" data-orcamento="${o.id}">Aceitar orçamento</button>` : ''}
    </div>`;
  }).join('');

  return `<div class="bloco">
    <h4>Frete solicitado: ${trajeto}</h4>
    ${orcamentos || '<p class="dica">Aguardando orçamentos dos transportadores.</p>'}
    ${!souSolicitante ? '<p class="dica">Quem solicitou o frete escolhe o orçamento.</p>' : ''}
  </div>`;
}

// Bloco de avaliações dentro do cartão do negócio concluído.
function htmlAvaliacoesDoNegocio(n) {
  if (n.status !== 'Concluído') return '';
  const eu = atual();

  const linhas = avaliaveis(n, eu).map(function (id) {
    const pessoa = buscarUsuario(id);
    const feita = dados.avaliacoes.find(function (v) { return v.negocioId === n.id && v.autorId === eu.id && v.avaliadoId === id; });
    if (feita) {
      return `<div class="orcamento"><span>Você avaliou <strong>${esc(pessoa.nome)}</strong></span>${htmlEstrelasFixas(feita.nota)}</div>`;
    }
    return `<div class="orcamento"><span>Como foi com <strong>${esc(pessoa.nome)}</strong>?</span>
      <button type="button" class="btn btn-primario btn-pequeno" data-acao="abrirAvaliacao" data-negocio="${n.id}" data-avaliado="${id}">Avaliar</button></div>`;
  }).join('');

  return `<div class="bloco"><h4>Avaliações</h4>${linhas}</div>`;
}

// 7.9 Fretes (tela do transportador)
TELAS.fretes = function () {
  const eu = atual();
  if (eu.tipo !== 'transportador') {
    return htmlVazio('Esta tela é dos transportadores. Para pedir um frete, abra um negócio aceito em <a href="#negocios">Negócios</a>.');
  }
  // Solicitações com origem ou destino no estado do transportador vêm primeiro.
  const abertas = dados.fretes
    .filter(function (f) { return f.status === 'aberta'; })
    .sort(function (a, b) { return freteNaRegiao(b, eu) - freteNaRegiao(a, eu) || (b.criadoEm > a.criadoEm ? 1 : -1); });
  const meus = dados.fretes
    .filter(function (f) { return f.status === 'fechada' && f.transportadorId === eu.id; })
    .sort(function (a, b) { return b.criadoEm > a.criadoEm ? 1 : -1; });

  return `
    <div class="cabecalho-tela">
      <div>
        <h1>Fretes</h1>
        <p>Responda às solicitações com um valor. Quem pediu o frete escolhe o orçamento.</p>
      </div>
    </div>
    <h2 class="subtitulo" style="margin-top:0">Solicitações abertas</h2>
    ${abertas.length ? `<div class="pilha">${abertas.map(htmlFreteTransportador).join('')}</div>` : htmlVazio('Nenhuma solicitação aberta no momento.')}
    <h2 class="subtitulo">Meus fretes fechados</h2>
    ${meus.length ? `<div class="pilha">${meus.map(htmlFreteTransportador).join('')}</div>` : htmlVazio('Nenhum frete fechado ainda.')}`;
};

function freteNaRegiao(frete, eu) {
  return frete.origem.endsWith('/' + eu.uf) || frete.destino.endsWith('/' + eu.uf) ? 1 : 0;
}

function htmlFreteTransportador(frete) {
  const eu = atual();
  const solicitante = buscarUsuario(frete.solicitanteId);
  const negocio = buscarNegocio(frete.negocioId);
  const meuOrcamento = frete.orcamentos.find(function (o) { return o.transportadorId === eu.id; });

  let acao = '';
  if (frete.status === 'fechada') {
    acao = `<div class="orcamento"><span>Fechado por <strong>${dinheiro(frete.valor)}</strong> · negócio ${negocio ? negocio.status.toLowerCase() : ''}</span></div>`;
    if (negocio) acao += htmlAvaliacoesDoNegocio(negocio);
  } else if (meuOrcamento) {
    acao = `<div class="orcamento"><span>Seu orçamento: <strong>${dinheiro(meuOrcamento.valor)}</strong></span><span class="selo selo-alerta">Aguardando resposta</span></div>`;
  } else {
    acao = `<div class="orcamento">
      <form data-form="orcamento" data-id="${frete.id}">
        <label for="orc-${frete.id}">Valor do frete (R$)</label>
        <input id="orc-${frete.id}" name="valor" type="number" min="1" step="0.01" required placeholder="Ex.: 850">
        <button type="submit" class="btn btn-primario btn-pequeno">Enviar orçamento</button>
      </form>
    </div>`;
  }

  return `<article class="cartao negocio">
    <div class="negocio-topo">
      <div class="negocio-titulo">
        <span class="produto-icone cor-frete" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h11v9H2z"/><path d="M13 10h4l4 3v3h-8z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></span>
        <div>
          <h3>${esc(frete.origem)} → ${esc(frete.destino)}</h3>
          <p>${esc(frete.carga)} · solicitado ${tempo(frete.criadoEm)}</p>
        </div>
      </div>
      ${freteNaRegiao(frete, eu) ? '<span class="selo selo-regiao">Na sua região</span>' : ''}
    </div>
    ${htmlPessoa(solicitante)}
    ${acao}
  </article>`;
}


// ---------- 8. Ações ----------
// Cada botão com data-acao="nome" chama a função de mesmo nome.
// O parâmetro "d" traz os outros atributos data- do botão (ex.: d.id).

const ACOES = {};

ACOES.entrarComo = function (d) {
  usuarioId = d.id;
  editandoPerfil = false;
  propostaAberta = false;
  salvar();
  fecharModal();
  aviso('Você está como ' + atual().nome + '.');
  ir(d.destino || 'painel');
};

ACOES.sair = function () {
  usuarioId = null;
  salvar();
  ir('entrar');
};

// Lista todos os perfis para trocar rapidamente durante a demonstração.
ACOES.abrirTroca = function () {
  function grupo(titulo, lista) {
    if (lista.length === 0) return '';
    return `<h3>${titulo}</h3>` + lista.map(function (u) {
      return `<button type="button" class="exemplo-usuario" data-acao="entrarComo" data-id="${u.id}">
        ${htmlAvatar(u, 'pequeno')}
        <span><strong>${esc(u.nome)}</strong><small>${TIPOS[u.tipo]} · ${esc(local(u))}</small></span>
      </button>`;
    }).join('');
  }
  const outros = dados.usuarios.filter(function (u) { return u.id !== usuarioId; });
  abrirModal(`
    <h2>Trocar de perfil</h2>
    <div class="lista-perfis">
      ${grupo('Cadastrados neste navegador', outros.filter(function (u) { return u.criadoAqui; }))}
      ${grupo('Perfis de exemplo', outros.filter(function (u) { return u.exemplo; }))}
      ${grupo('Outros perfis', outros.filter(function (u) { return !u.exemplo && !u.criadoAqui; }))}
    </div>
    <div><button type="button" class="btn btn-contorno" data-acao="fecharModal">Fechar</button></div>`);
};

ACOES.fecharModal = fecharModal;

ACOES.pedirRestauracao = function () {
  abrirModal(`
    <h2>Restaurar dados de demonstração?</h2>
    <p>Os cadastros, anúncios, conversas e negócios criados neste navegador serão apagados e os dados iniciais voltarão.</p>
    <div class="linha-botoes">
      <button type="button" class="btn btn-primario" data-acao="restaurar">Restaurar</button>
      <button type="button" class="btn btn-contorno" data-acao="fecharModal">Cancelar</button>
    </div>`);
};

ACOES.restaurar = function () {
  restaurar();
  fecharModal();
  aviso('Dados de demonstração restaurados.');
  ir('entrar');
};

ACOES.abrirNotificacao = function (d) {
  const n = dados.notificacoes.find(function (x) { return x.id === d.id; });
  if (!n) return;
  n.lida = true;
  salvar();
  ir(n.destino || 'painel');
};

ACOES.lerNotificacoes = function () {
  dados.notificacoes.forEach(function (n) { if (n.usuarioId === usuarioId) n.lida = true; });
  salvar();
  desenhar();
};

ACOES.editarPerfil = function () { editandoPerfil = true; desenhar(); };
ACOES.cancelarEdicao = function () { editandoPerfil = false; desenhar(); };

ACOES.encerrarAnuncio = function (d) {
  const a = buscarAnuncio(d.id);
  if (!a || a.usuarioId !== usuarioId) return;
  a.status = 'encerrada';
  salvar();
  aviso(a.tipo === 'oferta' ? 'Oferta encerrada.' : 'Demanda encerrada.');
  desenhar();
};

// Abre a conversa sobre um anúncio. Se já existir, reaproveita.
ACOES.negociar = function (d) {
  const eu = atual();
  const a = buscarAnuncio(d.id);
  if (!eu) return ir('entrar');
  if (!a || !podeNegociar(eu, a)) return;

  let c = dados.conversas.find(function (x) {
    return x.anuncioId === a.id && x.participantes.includes(eu.id) && x.participantes.includes(a.usuarioId);
  });
  if (!c) {
    c = { id: novoId('k'), anuncioId: a.id, participantes: [eu.id, a.usuarioId], mensagens: [], atualizadoEm: agora() };
    dados.conversas.push(c);
    salvar();
  }
  propostaAberta = false;
  ir('conversas-' + c.id);
};

ACOES.alternarProposta = function () {
  propostaAberta = !propostaAberta;
  desenhar();
};

// Aceitar ou recusar uma proposta recebida.
ACOES.responderProposta = function (d) {
  const eu = atual();
  const c = buscarConversa(d.conversa);
  const m = c.mensagens.find(function (x) { return x.id === d.mensagem; });
  const n = buscarNegocio(m.negocioId);
  const a = buscarAnuncio(c.anuncioId);
  if (m.status !== 'pendente' || m.autorId === eu.id) return;

  if (d.resposta === 'aceita') {
    if (m.quantidade > a.quantidade) {
      return aviso('Só restam ' + quantidadeTexto(a.quantidade, a.unidade) + ' neste anúncio. Recuse e peça uma nova proposta.', true);
    }
    m.status = 'aceita';
    n.status = 'Aceito';
    // Abate a quantidade do anúncio. Se zerar, o anúncio é encerrado.
    a.quantidade -= m.quantidade;
    if (a.quantidade <= 0) { a.quantidade = 0; a.status = 'encerrada'; }
    c.mensagens.push({ id: novoId('m'), tipo: 'sistema', texto: 'Proposta aceita. Negócio criado.', criadoEm: agora() });
    notificar(m.autorId, eu.nome + ' aceitou sua proposta de ' + tituloCarga(n) + '.', 'negocios');
    aviso('Proposta aceita. O negócio foi criado.');
  } else {
    m.status = 'recusada';
    n.status = 'Recusado';
    c.mensagens.push({ id: novoId('m'), tipo: 'sistema', texto: 'Proposta recusada.', criadoEm: agora() });
    notificar(m.autorId, eu.nome + ' recusou sua proposta de ' + tituloCarga(n) + '.', 'conversas-' + c.id);
    aviso('Proposta recusada.');
  }
  c.atualizadoEm = agora();
  salvar();
  desenhar();
};

// Avança o negócio: Aceito → Entregue → Concluído.
ACOES.avancarNegocio = function (d) {
  const eu = atual();
  const n = buscarNegocio(d.id);
  if (!n) return;
  const outroId = n.vendedorId === eu.id ? n.compradorId : n.vendedorId;

  if (n.status === 'Aceito') {
    n.status = 'Entregue';
    notificar(outroId, 'Entrega registrada: ' + tituloCarga(n) + '.', 'negocios');
    aviso('Entrega registrada.');
  } else if (n.status === 'Entregue') {
    n.status = 'Concluído';
    notificar(outroId, 'Negócio concluído: ' + tituloCarga(n) + '. Avalie ' + eu.nome + '.', 'negocios');
    aviso('Negócio concluído. Agora vocês podem se avaliar.');
  }
  salvar();
  desenhar();
};

ACOES.abrirFrete = function (d) {
  const n = buscarNegocio(d.id);
  const a = buscarAnuncio(n.anuncioId);
  const vendedor = buscarUsuario(n.vendedorId);
  const comprador = buscarUsuario(n.compradorId);
  // A carga sai do local da oferta (ou do vendedor) e vai para o comprador.
  const origem = a && a.tipo === 'oferta' ? local(a) : local(vendedor);
  const destino = a && a.tipo === 'demanda' ? local(a) : local(comprador);

  abrirModal(`
    <h2>Solicitar frete</h2>
    <form data-form="frete" data-id="${n.id}" class="pilha">
      <div class="campo">
        <label for="fr-origem">Origem</label>
        <input id="fr-origem" name="origem" required value="${esc(origem)}">
      </div>
      <div class="campo">
        <label for="fr-destino">Destino</label>
        <input id="fr-destino" name="destino" required value="${esc(destino)}">
      </div>
      <div class="campo">
        <label for="fr-carga">Produto</label>
        <input id="fr-carga" name="carga" required value="${esc(tituloCarga(n))}">
      </div>
      <div class="linha-botoes">
        <button type="submit" class="btn btn-primario">Enviar solicitação</button>
        <button type="button" class="btn btn-contorno" data-acao="fecharModal">Cancelar</button>
      </div>
    </form>`);
};

ACOES.aceitarOrcamento = function (d) {
  const eu = atual();
  const frete = buscarFrete(d.frete);
  const o = frete.orcamentos.find(function (x) { return x.id === d.orcamento; });
  if (!o || frete.status !== 'aberta' || frete.solicitanteId !== eu.id) return;

  frete.status = 'fechada';
  frete.transportadorId = o.transportadorId;
  frete.valor = o.valor;
  notificar(o.transportadorId, eu.nome + ' aceitou seu orçamento de ' + dinheiro(o.valor) + '.', 'fretes');
  salvar();
  aviso('Frete combinado com ' + buscarUsuario(o.transportadorId).nome + '.');
  desenhar();
};

ACOES.abrirAvaliacao = function (d) {
  const pessoa = buscarUsuario(d.avaliado);
  const estrelas = [5, 4, 3, 2, 1].map(function (n) {
    return `<input type="radio" name="nota" id="nota-${n}" value="${n}" ${n === 5 ? 'checked' : ''}>
      <label for="nota-${n}" aria-label="${n} ${n === 1 ? 'estrela' : 'estrelas'}">★</label>`;
  }).join('');

  abrirModal(`
    <h2>Avaliar ${esc(pessoa.nome)}</h2>
    <form data-form="avaliacao" data-negocio="${d.negocio}" data-avaliado="${d.avaliado}" class="pilha">
      <div class="campo">
        <span class="rotulo" id="av-rotulo">Nota</span>
        <div class="escolha-estrelas" role="radiogroup" aria-labelledby="av-rotulo">${estrelas}</div>
      </div>
      <div class="campo">
        <label for="av-comentario">Comentário curto</label>
        <textarea id="av-comentario" name="comentario" maxlength="160" placeholder="Ex.: Produto de qualidade e entrega no prazo."></textarea>
      </div>
      <div class="linha-botoes">
        <button type="submit" class="btn btn-primario">Enviar avaliação</button>
        <button type="button" class="btn btn-contorno" data-acao="fecharModal">Cancelar</button>
      </div>
    </form>`);
};


// ---------- 9. Formulários ----------
// Cada <form data-form="nome"> chama a função de mesmo nome ao ser enviado.
// "v" traz os valores dos campos e "form" é o próprio formulário.

const FORMULARIOS = {};

function lerProdutos(texto) {
  return String(texto || '').split(',')
    .map(function (p) { return p.trim().toLowerCase(); })
    .filter(function (p) { return p !== ''; });
}

FORMULARIOS.cadastro = function (v) {
  const novo = {
    id: novoId('u'),
    tipo: v.tipo,
    nome: v.nome.trim(),
    cidade: v.cidade.trim(),
    uf: v.uf,
    descricao: '',
    produtos: lerProdutos(v.produtos),
    criadoAqui: true
  };
  dados.usuarios.push(novo);
  usuarioId = novo.id;
  salvar();
  aviso('Cadastro feito. Boas-vindas à HortLink!');
  ir('painel');
};

FORMULARIOS.perfil = function (v) {
  const eu = atual();
  eu.nome = v.nome.trim();
  eu.cidade = v.cidade.trim();
  eu.uf = v.uf;
  eu.descricao = v.descricao.trim();
  eu.produtos = lerProdutos(v.produtos);
  editandoPerfil = false;
  salvar();
  aviso('Perfil atualizado.');
  desenhar();
};

FORMULARIOS.anuncio = function (v) {
  const eu = atual();
  const a = {
    id: novoId('a'),
    tipo: eu.tipo === 'produtor' ? 'oferta' : 'demanda',
    usuarioId: eu.id,
    produto: v.produto.trim().toLowerCase(),
    quantidade: Number(v.quantidade),
    unidade: v.unidade,
    preco: Number(v.preco),
    cidade: v.cidade.trim(),
    uf: v.uf,
    disponibilidade: v.disponibilidade.trim(),
    observacao: v.observacao.trim(),
    status: 'ativa',
    criadoEm: agora()
  };
  dados.anuncios.push(a);

  // Avisa quem tem esse produto no perfil e está no mesmo estado.
  const interessado = a.tipo === 'oferta' ? 'comprador' : 'produtor';
  dados.usuarios.forEach(function (u) {
    const combina = u.produtos.some(function (p) { return simples(p) === simples(a.produto); });
    if (u.tipo === interessado && u.uf === a.uf && combina) {
      notificar(u.id, eu.nome + (a.tipo === 'oferta' ? ' oferece ' : ' procura ') + tituloCarga(a) + ' na sua região.', 'mercado');
    }
  });

  salvar();
  aviso(a.tipo === 'oferta' ? 'Oferta publicada.' : 'Demanda publicada.');
  desenhar();
};

FORMULARIOS.mensagem = function (v, form) {
  const texto = v.texto.trim();
  if (!texto) return;
  const c = buscarConversa(form.dataset.id);
  const outro = outroParticipante(c);
  c.mensagens.push({ id: novoId('m'), autorId: usuarioId, tipo: 'texto', texto: texto, criadoEm: agora() });
  c.atualizadoEm = agora();
  salvar();
  desenhar();
  document.getElementById('campo-mensagem').focus();
  responderSozinho(c.id, outro.id);
};

// Resposta automática do outro lado, só para a demonstração fluir.
function responderSozinho(conversaId, autorId) {
  if (!RESPOSTAS_AUTOMATICAS) return;
  setTimeout(function () {
    const c = buscarConversa(conversaId);
    // Não responde se a conversa sumiu ou se o usuário já trocou para o outro perfil.
    if (!c || usuarioId === autorId || !buscarUsuario(autorId)) return;
    const jaEnviadas = c.mensagens.filter(function (m) { return m.automatica; }).length;
    c.mensagens.push({
      id: novoId('m'), autorId: autorId, tipo: 'texto', automatica: true,
      texto: RESPOSTAS_PRONTAS[jaEnviadas % RESPOSTAS_PRONTAS.length], criadoEm: agora()
    });
    c.atualizadoEm = agora();
    salvar();
    redesenharSemPerderTexto('conversas');
  }, 1400);
}

// Redesenha a tela (se o usuário ainda estiver nela) mantendo o que foi digitado.
function redesenharSemPerderTexto(tela) {
  if (rota().nome !== tela || !document.getElementById('modal').hidden) return;
  const campo = document.getElementById('campo-mensagem');
  const digitado = campo ? campo.value : '';
  const comFoco = campo && document.activeElement === campo;
  desenhar();
  const novoCampo = document.getElementById('campo-mensagem');
  if (novoCampo) {
    novoCampo.value = digitado;
    if (comFoco) novoCampo.focus();
  }
}

// Enviar uma proposta cria um negócio na etapa "Em negociação".
FORMULARIOS.proposta = function (v, form) {
  const eu = atual();
  const c = buscarConversa(form.dataset.id);
  const a = buscarAnuncio(c.anuncioId);
  const outro = outroParticipante(c);
  const quantidade = Number(v.quantidade);
  const preco = Number(v.preco);

  if (!(quantidade > 0) || !(preco > 0)) return aviso('Informe quantidade e preço maiores que zero.', true);
  if (quantidade > a.quantidade) return aviso('Este anúncio tem só ' + quantidadeTexto(a.quantidade, a.unidade) + '.', true);

  // Na oferta, o dono do anúncio vende. Na demanda, o dono do anúncio compra.
  const vendedorId = a.tipo === 'oferta' ? a.usuarioId : c.participantes.find(function (p) { return p !== a.usuarioId; });
  const compradorId = c.participantes.find(function (p) { return p !== vendedorId; });

  const n = {
    id: novoId('n'), conversaId: c.id, anuncioId: a.id, vendedorId: vendedorId, compradorId: compradorId,
    produto: a.produto, quantidade: quantidade, unidade: a.unidade, preco: preco,
    status: 'Em negociação', criadoEm: agora()
  };
  dados.negocios.push(n);
  c.mensagens.push({ id: novoId('m'), autorId: eu.id, tipo: 'proposta', negocioId: n.id, quantidade: quantidade, preco: preco, status: 'pendente', criadoEm: agora() });
  c.atualizadoEm = agora();
  notificar(outro.id, 'Nova proposta de ' + eu.nome + ': ' + tituloCarga(n) + ' a ' + dinheiro(preco) + '.', 'conversas-' + c.id);

  propostaAberta = false;
  salvar();
  aviso('Proposta enviada.');
  desenhar();
};

FORMULARIOS.frete = function (v, form) {
  const eu = atual();
  const n = buscarNegocio(form.dataset.id);
  if (!n || freteDoNegocio(n.id)) return fecharModal();

  const frete = {
    id: novoId('f'), negocioId: n.id, solicitanteId: eu.id,
    origem: v.origem.trim(), destino: v.destino.trim(), carga: v.carga.trim(),
    status: 'aberta', transportadorId: null, valor: null, orcamentos: [], criadoEm: agora()
  };
  dados.fretes.push(frete);
  dados.usuarios.forEach(function (u) {
    if (u.tipo === 'transportador') notificar(u.id, 'Nova solicitação de frete: ' + frete.origem + ' para ' + frete.destino + '.', 'fretes');
  });
  salvar();
  fecharModal();
  aviso('Frete solicitado. Os transportadores foram avisados.');
  desenhar();
  orcarSozinho(frete.id, n.quantidade);
};

// Orçamento automático de um transportador fictício, só para a demonstração fluir.
function orcarSozinho(freteId, quantidade) {
  if (!RESPOSTAS_AUTOMATICAS) return;
  setTimeout(function () {
    const frete = buscarFrete(freteId);
    const t = dados.usuarios.find(function (u) { return u.tipo === 'transportador' && !u.exemplo && u.id !== usuarioId; });
    if (!frete || frete.status !== 'aberta' || !t) return;
    // Valor fictício: uma taxa fixa mais um valor por unidade transportada.
    const valor = Math.round((280 + quantidade * 1.1) / 10) * 10;
    frete.orcamentos.push({ id: novoId('o'), transportadorId: t.id, valor: valor, criadoEm: agora() });
    notificar(frete.solicitanteId, t.nome + ' enviou um orçamento de frete: ' + dinheiro(valor) + '.', 'negocios');
    salvar();
    redesenharSemPerderTexto('negocios');
    if (frete.solicitanteId === usuarioId) aviso('Novo orçamento de frete recebido.');
  }, 1800);
}

FORMULARIOS.orcamento = function (v, form) {
  const eu = atual();
  const frete = buscarFrete(form.dataset.id);
  const valor = Number(v.valor);
  if (!frete || frete.status !== 'aberta' || !(valor > 0)) return;

  frete.orcamentos.push({ id: novoId('o'), transportadorId: eu.id, valor: valor, criadoEm: agora() });
  notificar(frete.solicitanteId, eu.nome + ' enviou um orçamento de frete: ' + dinheiro(valor) + '.', 'negocios');
  salvar();
  aviso('Orçamento enviado.');
  desenhar();
};

FORMULARIOS.avaliacao = function (v, form) {
  const eu = atual();
  const negocioId = form.dataset.negocio;
  const avaliadoId = form.dataset.avaliado;
  const jaFeita = dados.avaliacoes.some(function (a) { return a.negocioId === negocioId && a.autorId === eu.id && a.avaliadoId === avaliadoId; });
  if (jaFeita) return fecharModal();

  const nota = Number(v.nota);
  dados.avaliacoes.push({ id: novoId('v'), negocioId: negocioId, autorId: eu.id, avaliadoId: avaliadoId, nota: nota, comentario: v.comentario.trim(), criadoEm: agora() });
  notificar(avaliadoId, eu.nome + ' avaliou você com ' + nota + (nota === 1 ? ' estrela.' : ' estrelas.'), 'perfil-' + avaliadoId);
  salvar();
  fecharModal();
  aviso('Avaliação enviada. A nota do perfil foi atualizada.');
  desenhar();
};


// ---------- 10. Eventos e início ----------

// Cliques: procura o elemento com data-acao mais próximo e chama a ação.
document.addEventListener('click', function (evento) {
  const alvo = evento.target.closest('[data-acao]');
  if (alvo && ACOES[alvo.dataset.acao]) {
    evento.preventDefault();
    ACOES[alvo.dataset.acao](alvo.dataset, alvo);
    return;
  }
  // Clique no fundo escuro fecha a janela.
  if (evento.target.id === 'modal') fecharModal();
  // Clique fora de um menu suspenso fecha o menu.
  document.querySelectorAll('details.suspenso[open]').forEach(function (menu) {
    if (!menu.contains(evento.target)) menu.removeAttribute('open');
  });
});

// Envio de formulários.
document.addEventListener('submit', function (evento) {
  const form = evento.target.closest('[data-form]');
  evento.preventDefault();
  if (!form || !FORMULARIOS[form.dataset.form]) return;
  const valores = Object.fromEntries(new FormData(form));
  FORMULARIOS[form.dataset.form](valores, form);
});

// Filtros: a lista é atualizada enquanto o usuário digita.
document.addEventListener('input', function (evento) {
  const form = evento.target.closest('[data-filtros]');
  if (!form) return;
  const valores = Object.fromEntries(new FormData(form));
  if (form.dataset.filtros === 'mercado') {
    Object.assign(filtrosMercado, valores);
    document.getElementById('lista-mercado').innerHTML = listaMercado();
  } else {
    Object.assign(filtrosProfissionais, valores);
    document.getElementById('lista-profissionais').innerHTML = listaProfissionais();
  }
});

document.addEventListener('keydown', function (evento) {
  if (evento.key === 'Escape') fecharModal();
});

// Ao trocar de tela, fecha formulários abertos e volta ao topo.
window.addEventListener('hashchange', function () {
  editandoPerfil = false;
  propostaAberta = false;
  desenhar();
  window.scrollTo(0, 0);
});

carregar();
desenhar();
