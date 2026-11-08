/* =========================================================
   PRATO RÁPIDO — Etapa 3 (JavaScript, Dados e Interatividade)
   ========================================================= */


/* ---------- PARTE 1: Dados e persistência com localStorage ---------- */

// Chave usada para guardar as receitas no localStorage
const CHAVE_STORAGE = "pratoRapido.receitas";
const IMAGEM_PADRAO = "assets/img/sem-imagem.svg";

// Objetos que traduzem os valores salvos para textos da interface
const NOMES_CATEGORIAS = {
    "cafe-da-manha": "Café da manhã",
    almoco: "Almoço",
    jantar: "Jantar",
    lanche: "Lanche",
    sobremesa: "Sobremesa"
};

const NOMES_DIFICULDADES = {
    facil: "Fácil",
    media: "Média",
    dificil: "Difícil"
};

// Receitas de exemplo usadas apenas no primeiro acesso
const RECEITAS_INICIAIS = [
    {
        id: "exemplo-1",
        nome: "Omelete de queijo",
        categoria: "cafe-da-manha",
        tempo: 10,
        porcoes: 1,
        dificuldade: "facil",
        ingredientes: ["2 ovos", "50 g de queijo muçarela ralado", "1 colher (chá) de manteiga", "Sal e pimenta a gosto"],
        preparo: [
            "Bata os ovos com sal e pimenta.",
            "Derreta a manteiga em uma frigideira em fogo médio.",
            "Despeje os ovos e espere firmar as bordas.",
            "Coloque o queijo, dobre a omelete ao meio e sirva."
        ],
        imagem: "",
        favorita: true,
        origem: "manual",
        criadaEm: 1759320000000
    },
    {
        id: "exemplo-2",
        nome: "Macarrão alho e óleo",
        categoria: "almoco",
        tempo: 20,
        porcoes: 2,
        dificuldade: "facil",
        ingredientes: ["200 g de espaguete", "4 dentes de alho fatiados", "4 colheres (sopa) de azeite", "Sal a gosto", "Salsinha picada"],
        preparo: [
            "Cozinhe o macarrão em água fervente com sal.",
            "Doure o alho no azeite em fogo baixo.",
            "Misture o macarrão escorrido ao alho e óleo.",
            "Finalize com salsinha e sirva."
        ],
        imagem: "",
        favorita: false,
        origem: "manual",
        criadaEm: 1759320060000
    },
    {
        id: "exemplo-3",
        nome: "Bolo de caneca de chocolate",
        categoria: "sobremesa",
        tempo: 5,
        porcoes: 1,
        dificuldade: "facil",
        ingredientes: ["1 ovo", "4 colheres (sopa) de leite", "3 colheres (sopa) de açúcar", "2 colheres (sopa) de chocolate em pó", "4 colheres (sopa) de farinha de trigo"],
        preparo: [
            "Misture todos os ingredientes na caneca.",
            "Leve ao micro-ondas por cerca de 2 minutos.",
            "Espere amornar antes de comer."
        ],
        imagem: "",
        favorita: false,
        origem: "manual",
        criadaEm: 1759320120000
    }
];

// Array principal com todas as receitas do sistema
let receitas = carregarReceitas();

// Lê as receitas do localStorage (ou usa os exemplos no primeiro acesso)
function carregarReceitas() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos === null) {
        gravarNoStorage(RECEITAS_INICIAIS);
        return [...RECEITAS_INICIAIS];
    }

    try {
        const lista = JSON.parse(dadosSalvos);
        if (Array.isArray(lista)) {
            return lista;
        }
    } catch (erro) {
        console.error("Dados do localStorage inválidos:", erro);
    }

    return [];
}

// Converte a lista para texto (JSON) e guarda no localStorage
function gravarNoStorage(lista) {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
    } catch (erro) {
        console.error("Não foi possível salvar no localStorage:", erro);
    }
}

// Deve ser chamada sempre depois de cadastrar, editar ou excluir
function salvarReceitas() {
    gravarNoStorage(receitas);
}

// Cria um identificador único para cada receita
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function nomeCategoria(valor) {
    return NOMES_CATEGORIAS[valor] || "Sem categoria";
}

function nomeDificuldade(valor) {
    return NOMES_DIFICULDADES[valor] || "Não informada";
}

// Escolhe entre singular e plural de acordo com a quantidade
function plural(quantidade, singular, pluralTexto) {
    return quantidade === 1 ? `${quantidade} ${singular}` : `${quantidade} ${pluralTexto}`;
}



/* ---------- PARTE 2: Listagem dinâmica das receitas ---------- */

const listaReceitas = document.getElementById("lista-receitas");
const contador = document.getElementById("contador");
const campoPesquisa = document.getElementById("pesquisa");
const filtroCategoria = document.getElementById("filtro-categoria");
const seletorOrdenacao = document.getElementById("ordenacao");

// Deixa o texto em minúsculas e sem acentos para comparar
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// Pesquisa pelo nome ou pelos ingredientes
function filtrarPorPesquisa(lista, termo) {
    const termoNormalizado = normalizarTexto(termo);

    if (termoNormalizado === "") {
        return lista;
    }

    return lista.filter(function (receita) {
        const noNome = normalizarTexto(receita.nome).includes(termoNormalizado);
        const nosIngredientes = receita.ingredientes.some(function (ingrediente) {
            return normalizarTexto(ingrediente).includes(termoNormalizado);
        });
        return noNome || nosIngredientes;
    });
}

// Filtra pela categoria escolhida (ou só as favoritas)
function filtrarPorCategoria(lista, categoria) {
    if (categoria === "todas") {
        return lista;
    }
    if (categoria === "favoritas") {
        return lista.filter((receita) => receita.favorita);
    }
    return lista.filter((receita) => receita.categoria === categoria);
}

// Ordena uma cópia da lista sem alterar o array original
function ordenarReceitas(lista, criterio) {
    const copia = [...lista];

    switch (criterio) {
        case "nome-az":
            copia.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
            break;
        case "nome-za":
            copia.sort((a, b) => b.nome.localeCompare(a.nome, "pt-BR"));
            break;
        case "tempo-menor":
            copia.sort((a, b) => a.tempo - b.tempo);
            break;
        case "tempo-maior":
            copia.sort((a, b) => b.tempo - a.tempo);
            break;
        default:
            copia.sort((a, b) => b.criadaEm - a.criadaEm);
    }

    return copia;
}

// Aplica pesquisa, filtro e ordenação de acordo com os controles da tela
function obterReceitasVisiveis() {
    let lista = filtrarPorPesquisa(receitas, campoPesquisa.value);
    lista = filtrarPorCategoria(lista, filtroCategoria.value);
    return ordenarReceitas(lista, seletorOrdenacao.value);
}

// Atalho para criar um elemento já com classe e texto
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) {
        elemento.className = classe;
    }
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

// Cria a imagem e troca pela imagem padrão se o link não funcionar
function criarImagem(endereco, textoAlternativo) {
    const imagem = document.createElement("img");
    imagem.src = endereco || IMAGEM_PADRAO;
    imagem.alt = textoAlternativo;
    imagem.width = 400;
    imagem.height = 260;
    imagem.loading = "lazy";

    imagem.addEventListener("error", function () {
        if (!imagem.src.endsWith(IMAGEM_PADRAO)) {
            imagem.src = IMAGEM_PADRAO;
        }
    });

    return imagem;
}

function criarBotao(texto, classe, acao, id) {
    const botao = criarElemento("button", `botao ${classe}`, texto);
    botao.type = "button";
    botao.dataset.acao = acao;
    botao.dataset.id = id;
    return botao;
}

// Monta o card de uma receita
function criarCardReceita(receita) {
    const item = document.createElement("li");
    const artigo = criarElemento("article", "receita");
    const corpo = criarElemento("div", "receita-corpo");

    artigo.appendChild(criarImagem(receita.imagem, `Foto da receita ${receita.nome}`));
    corpo.appendChild(criarElemento("h3", "", receita.nome));

    const informacoes = criarElemento("ul", "receita-info");
    informacoes.appendChild(criarElemento("li", "etiqueta etiqueta-categoria", nomeCategoria(receita.categoria)));
    informacoes.appendChild(criarElemento("li", "etiqueta", `${receita.tempo} min`));
    informacoes.appendChild(criarElemento("li", "etiqueta", plural(receita.porcoes, "porção", "porções")));
    informacoes.appendChild(criarElemento("li", "etiqueta", nomeDificuldade(receita.dificuldade)));

    if (receita.favorita) {
        informacoes.appendChild(criarElemento("li", "etiqueta", "★ Favorita"));
    }
    if (receita.origem === "api") {
        informacoes.appendChild(criarElemento("li", "etiqueta etiqueta-api", "Da internet"));
    }
    corpo.appendChild(informacoes);

    const primeiros = receita.ingredientes.slice(0, 3).join(", ");
    const restantes = receita.ingredientes.length - 3;
    const resumo = restantes > 0
        ? `Ingredientes: ${primeiros} e mais ${restantes}.`
        : `Ingredientes: ${primeiros}.`;
    corpo.appendChild(criarElemento("p", "", resumo));

    const acoes = criarElemento("div", "acoes");
    acoes.appendChild(criarBotao("Ver detalhes", "botao-primario", "detalhes", receita.id));
    acoes.appendChild(criarBotao("Editar", "botao-secundario", "editar", receita.id));
    acoes.appendChild(criarBotao("Excluir", "botao-perigo", "excluir", receita.id));
    corpo.appendChild(acoes);

    artigo.appendChild(corpo);
    item.appendChild(artigo);
    return item;
}

// Redesenha a listagem a partir do array de receitas
function renderizarLista() {
    const lista = obterReceitasVisiveis();
    listaReceitas.replaceChildren();

    if (receitas.length === 0) {
        listaReceitas.appendChild(criarElemento("li", "lista-mensagem",
            "Nenhuma receita cadastrada ainda. Cadastre a primeira no formulário ou importe da internet."));
    } else if (lista.length === 0) {
        listaReceitas.appendChild(criarElemento("li", "lista-mensagem",
            "Nenhuma receita encontrada com essa pesquisa ou filtro."));
    }

    for (const receita of lista) {
        listaReceitas.appendChild(criarCardReceita(receita));
    }

    if (lista.length === receitas.length) {
        contador.textContent = `${plural(receitas.length, "receita cadastrada", "receitas cadastradas")}.`;
    } else {
        contador.textContent = `Mostrando ${lista.length} de ${plural(receitas.length, "receita", "receitas")}.`;
    }
}

renderizarLista();



/* ---------- PARTE 3: Cadastro com validação e feedback ---------- */

const formReceita = document.getElementById("form-receita");
const campoId = document.getElementById("receita-id");
const mensagemForm = document.getElementById("mensagem-form");
let temporizadorMensagem = null;

// Mostra uma mensagem de sucesso, erro ou informação em um elemento
function mostrarMensagem(elemento, texto, tipo) {
    elemento.textContent = texto;
    elemento.className = `mensagem mensagem-${tipo}`;
    elemento.hidden = false;
}

// Mensagem do formulário, que some sozinha depois de alguns segundos
function mostrarMensagemForm(texto, tipo) {
    mostrarMensagem(mensagemForm, texto, tipo);
    clearTimeout(temporizadorMensagem);
    temporizadorMensagem = setTimeout(function () {
        mensagemForm.hidden = true;
    }, 6000);
}

// Transforma o texto de um textarea em uma lista (uma linha = um item)
function textoParaLista(texto) {
    return texto
        .split("\n")
        .map((linha) => linha.trim())
        .filter((linha) => linha !== "");
}

// Captura os dados digitados no formulário em um objeto
function lerFormulario() {
    return {
        nome: document.getElementById("nome").value.trim(),
        categoria: document.getElementById("categoria").value,
        tempo: Number(document.getElementById("tempo").value),
        porcoes: Number(document.getElementById("porcoes").value),
        dificuldade: formReceita.querySelector('input[name="dificuldade"]:checked').value,
        ingredientes: textoParaLista(document.getElementById("ingredientes").value),
        preparo: textoParaLista(document.getElementById("modo-preparo").value),
        imagem: document.getElementById("imagem").value.trim(),
        favorita: document.getElementById("favorita").checked
    };
}

function marcarErro(idCampo, idErro, mensagem) {
    const campo = document.getElementById(idCampo);
    campo.classList.add("campo-invalido");
    campo.setAttribute("aria-invalid", "true");
    document.getElementById(idErro).textContent = mensagem;
}

function limparErros() {
    formReceita.querySelectorAll(".campo-invalido").forEach(function (campo) {
        campo.classList.remove("campo-invalido");
        campo.removeAttribute("aria-invalid");
    });
    formReceita.querySelectorAll(".erro-campo").forEach(function (erro) {
        erro.textContent = "";
    });
}

// Confere cada campo e mostra o erro embaixo dele
function validarReceita(dados) {
    limparErros();
    let valido = true;

    const nomeRepetido = receitas.some(function (receita) {
        return normalizarTexto(receita.nome) === normalizarTexto(dados.nome) && receita.id !== campoId.value;
    });

    if (dados.nome.length < 3) {
        marcarErro("nome", "erro-nome", "Informe um nome com pelo menos 3 letras.");
        valido = false;
    } else if (nomeRepetido) {
        marcarErro("nome", "erro-nome", "Já existe uma receita com esse nome.");
        valido = false;
    }

    if (!NOMES_CATEGORIAS[dados.categoria]) {
        marcarErro("categoria", "erro-categoria", "Escolha uma categoria.");
        valido = false;
    }

    if (!Number.isInteger(dados.tempo) || dados.tempo < 1 || dados.tempo > 600) {
        marcarErro("tempo", "erro-tempo", "Informe um tempo entre 1 e 600 minutos.");
        valido = false;
    }

    if (!Number.isInteger(dados.porcoes) || dados.porcoes < 1 || dados.porcoes > 50) {
        marcarErro("porcoes", "erro-porcoes", "Informe entre 1 e 50 porções.");
        valido = false;
    }

    if (dados.ingredientes.length === 0) {
        marcarErro("ingredientes", "erro-ingredientes", "Informe pelo menos um ingrediente.");
        valido = false;
    }

    if (dados.preparo.length === 0) {
        marcarErro("modo-preparo", "erro-preparo", "Descreva pelo menos um passo do preparo.");
        valido = false;
    }

    if (dados.imagem !== "" && !/^https?:\/\/\S+$/.test(dados.imagem)) {
        marcarErro("imagem", "erro-imagem", "O link deve começar com http:// ou https://.");
        valido = false;
    }

    if (!valido) {
        formReceita.querySelector(".campo-invalido").focus();
    }

    return valido;
}

// Cria a nova receita, coloca no array e salva no localStorage
function adicionarReceita(dados) {
    const novaReceita = {
        id: gerarId(),
        ...dados,
        origem: "manual",
        criadaEm: Date.now()
    };

    receitas.push(novaReceita);
    salvarReceitas();
    return novaReceita;
}

function limparFormulario() {
    formReceita.reset();
    campoId.value = "";
    limparErros();
}

formReceita.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const dados = lerFormulario();

    if (!validarReceita(dados)) {
        mostrarMensagemForm("Corrija os campos destacados em vermelho.", "erro");
        return;
    }

    if (campoId.value) {
        // Modo de edição (implementado na PARTE 5)
        atualizarReceita(campoId.value, dados);
        mostrarMensagemForm(`Receita "${dados.nome}" atualizada com sucesso.`, "sucesso");
    } else {
        adicionarReceita(dados);
        mostrarMensagemForm(`Receita "${dados.nome}" salva com sucesso.`, "sucesso");
    }

    limparFormulario();
    renderizarLista();
});

// Ao digitar em um campo com erro, o aviso daquele campo some
formReceita.addEventListener("input", function (evento) {
    const campo = evento.target;
    if (campo.classList.contains("campo-invalido")) {
        campo.classList.remove("campo-invalido");
        campo.removeAttribute("aria-invalid");
        const erro = campo.parentElement.querySelector(".erro-campo");
        if (erro) {
            erro.textContent = "";
        }
    }
});

formReceita.addEventListener("reset", limparErros);

/* ---------- PARTE 4: Visualização de detalhes ---------- */

const detalhesConteudo = document.getElementById("detalhes-conteudo");
let idDetalhesAberto = null;

function buscarReceitaPorId(id) {
    return receitas.find((receita) => receita.id === id);
}

function criarLinhaTabela(titulo, valor) {
    const linha = document.createElement("tr");
    const cabecalho = criarElemento("th", "", titulo);
    cabecalho.scope = "row";
    linha.appendChild(cabecalho);
    linha.appendChild(criarElemento("td", "", valor));
    return linha;
}

function criarListaDeTextos(tag, itens) {
    const lista = document.createElement(tag);
    for (const texto of itens) {
        lista.appendChild(criarElemento("li", "", texto));
    }
    return lista;
}

// Monta o painel de detalhes da receita escolhida
function mostrarDetalhes(id) {
    const receita = buscarReceitaPorId(id);
    if (!receita) {
        return;
    }

    idDetalhesAberto = id;

    const artigo = criarElemento("article", "receita-detalhe");
    artigo.appendChild(criarElemento("h3", "", receita.nome));
    artigo.appendChild(criarImagem(receita.imagem, `Foto da receita ${receita.nome}`));

    const tabela = document.createElement("table");
    tabela.appendChild(criarElemento("caption", "", "Informações da receita"));
    const corpoTabela = document.createElement("tbody");
    corpoTabela.appendChild(criarLinhaTabela("Categoria", nomeCategoria(receita.categoria)));
    corpoTabela.appendChild(criarLinhaTabela("Tempo de preparo", `${receita.tempo} minutos`));
    corpoTabela.appendChild(criarLinhaTabela("Porções", String(receita.porcoes)));
    corpoTabela.appendChild(criarLinhaTabela("Dificuldade", nomeDificuldade(receita.dificuldade)));
    corpoTabela.appendChild(criarLinhaTabela("Favorita", receita.favorita ? "Sim" : "Não"));
    corpoTabela.appendChild(criarLinhaTabela("Origem", receita.origem === "api" ? "Importada do TheMealDB" : "Cadastrada por você"));
    corpoTabela.appendChild(criarLinhaTabela("Cadastrada em", new Date(receita.criadaEm).toLocaleDateString("pt-BR")));
    tabela.appendChild(corpoTabela);
    artigo.appendChild(tabela);

    artigo.appendChild(criarElemento("h4", "", "Ingredientes"));
    artigo.appendChild(criarListaDeTextos("ul", receita.ingredientes));

    artigo.appendChild(criarElemento("h4", "", "Modo de preparo"));
    artigo.appendChild(criarListaDeTextos("ol", receita.preparo));

    const acoes = criarElemento("div", "acoes");
    acoes.appendChild(criarBotao("Editar", "botao-secundario", "editar", receita.id));
    acoes.appendChild(criarBotao("Excluir", "botao-perigo", "excluir", receita.id));
    const voltar = criarElemento("a", "link-voltar", "Voltar para a lista");
    voltar.href = "#receitas";
    acoes.appendChild(voltar);
    artigo.appendChild(acoes);

    detalhesConteudo.replaceChildren(artigo);
}

// Volta o painel para a mensagem inicial
function limparDetalhes() {
    idDetalhesAberto = null;
    detalhesConteudo.replaceChildren(criarElemento("p", "detalhes-vazio",
        "Clique em Ver detalhes em uma receita para ver as informações completas aqui."));
}

// Um único evento na lista atende o botão "Ver detalhes" de todos os cards
listaReceitas.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao || botao.dataset.acao !== "detalhes") {
        return;
    }

    mostrarDetalhes(botao.dataset.id);
    document.getElementById("detalhes").scrollIntoView({ behavior: "smooth" });
});

/* ---------- PARTE 5: Edição e exclusão ---------- */

const tituloForm = document.getElementById("titulo-form");
const botaoSalvar = document.getElementById("botao-salvar");
const botaoCancelar = document.getElementById("botao-cancelar");

// Coloca os dados da receita de volta nos campos do formulário
function preencherFormulario(receita) {
    document.getElementById("nome").value = receita.nome;
    document.getElementById("categoria").value = receita.categoria;
    document.getElementById("tempo").value = receita.tempo;
    document.getElementById("porcoes").value = receita.porcoes;
    document.getElementById(receita.dificuldade).checked = true;
    document.getElementById("ingredientes").value = receita.ingredientes.join("\n");
    document.getElementById("modo-preparo").value = receita.preparo.join("\n");
    document.getElementById("imagem").value = receita.imagem;
    document.getElementById("favorita").checked = receita.favorita;
}

function entrarNoModoEdicao(id) {
    const receita = buscarReceitaPorId(id);
    if (!receita) {
        return;
    }

    limparFormulario();
    preencherFormulario(receita);
    campoId.value = id;

    tituloForm.textContent = `Editando: ${receita.nome}`;
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.hidden = false;
    formReceita.classList.add("form-editando");

    document.getElementById("cadastro").scrollIntoView({ behavior: "smooth" });
    document.getElementById("nome").focus({ preventScroll: true });
}

function sairDoModoEdicao() {
    campoId.value = "";
    tituloForm.textContent = "Cadastrar receita";
    botaoSalvar.textContent = "Salvar receita";
    botaoCancelar.hidden = true;
    formReceita.classList.remove("form-editando");
}

// Troca os dados antigos pelos novos, mantendo id, origem e data
function atualizarReceita(id, dados) {
    const indice = receitas.findIndex((receita) => receita.id === id);
    if (indice === -1) {
        return;
    }

    receitas[indice] = { ...receitas[indice], ...dados };
    salvarReceitas();

    if (idDetalhesAberto === id) {
        mostrarDetalhes(id);
    }
}

function excluirReceita(id) {
    const receita = buscarReceitaPorId(id);
    if (!receita) {
        return;
    }

    const confirmou = confirm(`Excluir a receita "${receita.nome}"? Essa ação não pode ser desfeita.`);
    if (!confirmou) {
        return;
    }

    receitas = receitas.filter((item) => item.id !== id);
    salvarReceitas();

    if (campoId.value === id) {
        limparFormulario();
    }
    if (idDetalhesAberto === id) {
        limparDetalhes();
    }

    renderizarLista();
    contador.textContent = `Receita "${receita.nome}" excluída. ${contador.textContent}`;
}

// Atende os botões Editar e Excluir dos cards e do painel de detalhes
function tratarAcoes(evento) {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) {
        return;
    }

    if (botao.dataset.acao === "editar") {
        entrarNoModoEdicao(botao.dataset.id);
    } else if (botao.dataset.acao === "excluir") {
        excluirReceita(botao.dataset.id);
    }
}

listaReceitas.addEventListener("click", tratarAcoes);
detalhesConteudo.addEventListener("click", tratarAcoes);

botaoCancelar.addEventListener("click", function () {
    limparFormulario();
    mostrarMensagemForm("Edição cancelada. Nenhuma alteração foi salva.", "info");
});

// Sempre que o formulário é limpo, ele volta para o modo de cadastro
formReceita.addEventListener("reset", sairDoModoEdicao);

/* ---------- PARTE 6: Pesquisa, filtro e ordenação ---------- */

const formFiltros = document.getElementById("form-filtros");
const CHAVE_ORDENACAO = "pratoRapido.ordenacao";

// A lista é atualizada enquanto o usuário digita ou muda uma opção
campoPesquisa.addEventListener("input", renderizarLista);
filtroCategoria.addEventListener("change", renderizarLista);

seletorOrdenacao.addEventListener("change", function () {
    // Lembra a ordenação escolhida para a próxima visita
    localStorage.setItem(CHAVE_ORDENACAO, seletorOrdenacao.value);
    renderizarLista();
});

// Evita que o Enter na pesquisa recarregue a página
formFiltros.addEventListener("submit", function (evento) {
    evento.preventDefault();
});

// "Limpar filtros": espera o formulário voltar ao padrão e redesenha
formFiltros.addEventListener("reset", function () {
    localStorage.removeItem(CHAVE_ORDENACAO);
    setTimeout(renderizarLista, 0);
});

// Recupera a ordenação salva ao abrir a página
const ordenacaoSalva = localStorage.getItem(CHAVE_ORDENACAO);
if (ordenacaoSalva) {
    seletorOrdenacao.value = ordenacaoSalva;
    renderizarLista();
}

/* ---------- PARTE 7: Integração com a API TheMealDB ---------- */

const URL_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const formApi = document.getElementById("form-api");
const campoTermoApi = document.getElementById("termo-api");
const mensagemApi = document.getElementById("mensagem-api");
const resultadosApi = document.getElementById("resultados-api");
let resultadosAtuais = [];

// Categorias da API (em inglês) convertidas para as categorias do sistema
const CATEGORIAS_API = {
    Breakfast: "cafe-da-manha",
    Dessert: "sobremesa",
    Starter: "lanche",
    Side: "lanche",
    Pasta: "almoco",
    Beef: "almoco",
    Chicken: "almoco",
    Lamb: "jantar",
    Pork: "jantar",
    Seafood: "jantar",
    Vegetarian: "almoco",
    Vegan: "almoco"
};

// A API guarda os ingredientes em campos separados (strIngredient1 a 20)
function extrairIngredientes(prato) {
    const ingredientes = [];

    for (let i = 1; i <= 20; i++) {
        const ingrediente = prato[`strIngredient${i}`];
        const medida = prato[`strMeasure${i}`] || "";

        if (ingrediente && ingrediente.trim() !== "") {
            ingredientes.push(`${medida.trim()} ${ingrediente.trim()}`.trim());
        }
    }

    return ingredientes;
}

// Separa as instruções em passos e remove linhas como "STEP 1"
function extrairPassos(texto) {
    const passos = (texto || "")
        .split(/\r?\n/)
        .map((linha) => linha.trim())
        .filter((linha) => linha !== "" && !/^(step\s*)?\d+\.?$/i.test(linha));

    return passos.length > 0 ? passos : ["Modo de preparo não informado pela API."];
}

// Converte um prato da API para o formato de receita do sistema
function converterPrato(prato) {
    return {
        nome: prato.strMeal,
        categoria: CATEGORIAS_API[prato.strCategory] || "almoco",
        tempo: 30,
        porcoes: 2,
        dificuldade: "media",
        ingredientes: extrairIngredientes(prato),
        preparo: extrairPassos(prato.strInstructions),
        imagem: prato.strMealThumb || "",
        favorita: false,
        idApi: prato.idMeal
    };
}

function jaFoiImportada(idApi) {
    return receitas.some((receita) => receita.idApi === idApi);
}

function criarCardApi(prato) {
    const item = document.createElement("li");
    const artigo = criarElemento("article", "receita receita-api");
    const corpo = criarElemento("div", "receita-corpo");

    artigo.appendChild(criarImagem(prato.strMealThumb, `Foto do prato ${prato.strMeal}`));
    corpo.appendChild(criarElemento("h3", "", prato.strMeal));

    const informacoes = criarElemento("ul", "receita-info");
    informacoes.appendChild(criarElemento("li", "etiqueta etiqueta-api", "TheMealDB"));
    if (prato.strCategory) {
        informacoes.appendChild(criarElemento("li", "etiqueta", prato.strCategory));
    }
    if (prato.strArea) {
        informacoes.appendChild(criarElemento("li", "etiqueta", prato.strArea));
    }
    corpo.appendChild(informacoes);

    corpo.appendChild(criarElemento("p", "", plural(extrairIngredientes(prato).length, "ingrediente", "ingredientes")));

    const acoes = criarElemento("div", "acoes");
    const botao = criarElemento("button", "botao botao-primario", "Importar para meu catálogo");
    botao.type = "button";
    botao.dataset.idApi = prato.idMeal;

    if (jaFoiImportada(prato.idMeal)) {
        botao.disabled = true;
        botao.textContent = "Já está no catálogo";
    }

    acoes.appendChild(botao);
    corpo.appendChild(acoes);
    artigo.appendChild(corpo);
    item.appendChild(artigo);
    return item;
}

// Faz a requisição para a API e mostra os resultados
async function buscarNaApi(termo) {
    mostrarMensagem(mensagemApi, "Buscando receitas...", "info");
    resultadosApi.replaceChildren();

    try {
        const resposta = await fetch(URL_API + encodeURIComponent(termo));

        if (!resposta.ok) {
            throw new Error(`A API respondeu com o código ${resposta.status}`);
        }

        const dados = await resposta.json();
        resultadosAtuais = dados.meals || [];

        if (resultadosAtuais.length === 0) {
            mostrarMensagem(mensagemApi, `Nenhuma receita encontrada para "${termo}". Tente outro nome em inglês.`, "info");
            return;
        }

        mostrarMensagem(mensagemApi,
            `${plural(resultadosAtuais.length, "receita encontrada", "receitas encontradas")}. Clique em "Importar" para adicionar ao seu catálogo.`,
            "sucesso");

        for (const prato of resultadosAtuais.slice(0, 12)) {
            resultadosApi.appendChild(criarCardApi(prato));
        }
    } catch (erro) {
        console.error("Erro ao buscar na API:", erro);
        mostrarMensagem(mensagemApi, "Não foi possível conectar à API agora. Verifique sua internet e tente de novo.", "erro");
    }
}

// Importa o prato escolhido: dados da API → receita do sistema → localStorage
function importarPrato(idApi, botao) {
    const prato = resultadosAtuais.find((item) => item.idMeal === idApi);
    if (!prato || jaFoiImportada(idApi)) {
        return;
    }

    const novaReceita = {
        id: gerarId(),
        ...converterPrato(prato),
        origem: "api",
        criadaEm: Date.now()
    };

    receitas.push(novaReceita);
    salvarReceitas();
    renderizarLista();

    botao.disabled = true;
    botao.textContent = "Importada ✓";
    mostrarMensagem(mensagemApi,
        `"${novaReceita.nome}" foi importada! Ela já aparece em Receitas cadastradas. Ajuste tempo e porções em Editar, se quiser.`,
        "sucesso");
}

formApi.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const termo = campoTermoApi.value.trim();

    if (termo.length < 2) {
        mostrarMensagem(mensagemApi, "Digite pelo menos 2 letras para buscar.", "erro");
        campoTermoApi.focus();
        return;
    }

    buscarNaApi(termo);
});

resultadosApi.addEventListener("click", function (evento) {
    const botao = evento.target.closest("button[data-id-api]");
    if (botao) {
        importarPrato(botao.dataset.idApi, botao);
    }
});