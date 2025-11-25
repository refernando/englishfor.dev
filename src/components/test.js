export default function Test() {
  console.log(1)

  //"@google/generative-ai": "^0.21.0" DEPLOY CHANGE

  return (
    <div>
      test
    </div>
  );
}

/*
https://github.com/cheahjs/free-llm-api-resources

//"@google/generative-ai": "^0.21.0"

const GEMINI_API_KEY = "";

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Responda em português",
});

const generationConfig = {
  temperature: 1,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(`
Você é um especialista em criar ideias de SaaS (Software as a Service) e micro-saas voltadas para o mercado brasileiro, com foco em nichos específicos e problemas reais enfrentados por empreendedores e empresas no Brasil.

Seu objetivo é criar uma ideia de SaaS completa, seguindo o formato abaixo:

---

# [Título da Ideia: Um Nome Claro e Atrativo para o SaaS]
[Breve descrição de uma linha explicando o propósito do SaaS]

**Tags:** [Três ou quatro palavras-chave relacionadas ao nicho ou objetivo da ideia]

## Solução Proposta
[Descreva a solução que o SaaS oferece. Seja direto, explicando como o software resolve o problema do público-alvo. Use um tom simples e prático, alinhado à realidade brasileira.]

### Problema
[Explique claramente o problema que o público-alvo enfrenta e que o SaaS resolverá. Foque em desafios comuns e específicos do mercado brasileiro.]

### Impacto
[Descreva o impacto positivo do SaaS, como ele pode economizar tempo, reduzir custos ou melhorar a eficiência para os usuários.]

### Desafios
[Listar até três desafios específicos que o SaaS ajudará a superar, focando nas dores reais do nicho abordado.]

---

**Regras para geração:**
1. Escolha um nicho específico do mercado brasileiro.
2. Certifique-se de que a ideia seja acessível e viável para startups ou pequenos empreendedores.
3. Foque em problemas reais enfrentados no dia a dia pelas empresas ou profissionais do nicho escolhido.
4. Gere apenas a ideia no formato acima, sem comentários adicionais ou explicações.
`);
  console.log(result.response.text());
}

run();
*/
