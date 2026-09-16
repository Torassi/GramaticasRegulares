# Gramáticas Regulares

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/status-concluído-brightgreen)

Ferramenta web para derivar sentenças a partir de uma gramática regular e converter essa gramática em expressão regular — passo a passo, com a pilha de produções visível a cada etapa.

Feito para a disciplina de **Linguagens Formais e Autômatos** (UNESC), mas serve como ajuda de estudo para qualquer um tentando visualizar como uma derivação leftmost realmente acontece por trás da teoria.

## O que ela faz

Você define a gramática G = {N, T, P, S} — não-terminais, terminais, regras de produção e símbolo inicial — e a ferramenta:

- Valida se a gramática é de fato regular (no máximo um não-terminal por produção, sempre à direita);
- Executa a derivação escolhendo produções aleatoriamente até restarem só terminais, mostrando cada passo com o não-terminal expandido destacado;
- Visualiza a pilha de produções usada em cada etapa da derivação;
- Converte a gramática para uma expressão regular equivalente usando o **Lema de Arden**, mostrando cada equação intermediária do sistema até chegar na expressão final;
- Traz 3 gramáticas de exemplo prontas para carregar com um clique.

## Tecnologias

HTML5, CSS3 e JavaScript puro (sem frameworks, sem dependências, sem build). O parser, o motor de derivação e o conversor para regex estão todos separados em módulos simples dentro de `js/`.

## Pré-requisitos

Só um navegador. Nada para instalar.

## Como rodar localmente

```bash
git clone https://github.com/Torassi/GramaticasRegulares.git
cd GramaticasRegulares
```

Depois é só abrir o `index.html` direto no navegador (duplo clique já funciona, já que não há chamadas `fetch` nem módulos ES que exijam servidor). Se preferir servir por HTTP:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Como usar

1. Escolha um dos 3 exemplos prontos ou escreva sua própria gramática (um não-terminal por linha em N e T, entre chaves — ex: `{ S, A }`);
2. Escreva as produções no formato `S ::= aS | ab`, uma regra por não-terminal por linha;
3. Defina o símbolo inicial;
4. Clique em **Gerar Sentença** para ver a derivação e a conversão para expressão regular.

Se a gramática não for regular (por exemplo, mais de um não-terminal numa produção, ou não-terminal fora da última posição), a ferramenta avisa o erro específico em vez de travar.

## Autor

Leonardo Torassi

## Licença

Este projeto não possui uma licença definida.
