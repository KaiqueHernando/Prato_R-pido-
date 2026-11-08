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