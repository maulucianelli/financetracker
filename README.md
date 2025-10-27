# FinanceTrack - Sistema de Controle Financeiro

Sistema completo de controle financeiro para pequenos e médios negócios, com contabilidade profissional correta.

## 🎯 Funcionalidades Principais

### Relatórios Contábeis (NOVO - Contabilidade Correta)

#### 1. **DRE - Demonstrativo de Resultados do Exercício**
- Análise em regime de competência (quando as transações ocorrem)
- Estrutura contábil profissional:
  - Receitas
  - (-) Custos Diretos / Variáveis
  - = **Lucro Bruto**
  - (-) Despesas Operacionais / Fixas
  - = **Lucro Operacional (EBITDA)**
  - (-) Despesas Financeiras (Juros)
  - = **Lucro Líquido**
- Análise separada por unidade (Loja / Transportadora)
- Margens de lucro automáticas

#### 2. **Fluxo de Caixa**
- Análise em regime de caixa (quando o dinheiro entra/sai)
- Entradas vs Saídas efetivas
- Alertas de contas pendentes
- Projeção de obrigações futuras

### Gestão Operacional

- **Receitas**: Registro de vendas e serviços
- **Contas a Pagar/Receber**: Controle de obrigações
- **Empréstimos**: Acompanhamento de financiamentos com juros
- **Dashboard**: Visão geral com métricas-chave

## 🔧 Correções Contábeis Implementadas

### Problemas Corrigidos:

1. ✅ **Eliminada duplicação de despesas**
   - Agora há uma única fonte de verdade
   - Receitas, Custos Diretos e Despesas Operacionais separados

2. ✅ **Cálculos corretos no Relatório Consolidado**
   - DRE calcula lucro real incluindo todas as despesas
   - Separação clara entre lucro bruto, operacional e líquido

3. ✅ **Rateio inteligente de custos compartilhados**
   - Custos podem ser alocados para Loja, Transportadora ou Compartilhados
   - Rateio configurável por percentual

4. ✅ **Empréstimos com juros**
   - Cálculo aproximado de juros mensais
   - Impacto real no lucro líquido

5. ✅ **Regime Contábil definido**
   - DRE = Regime de Competência
   - Fluxo de Caixa = Regime de Caixa
   - Distinção clara entre os dois

## 📱 Instalação Offline (PWA)

O aplicativo funciona **100% offline** após instalado!

### Como Instalar:

#### No Computador (Chrome/Edge):
1. Abra o app no navegador: `http://localhost:5173`
2. Clique no ícone de instalação na barra de endereços (⊕)
3. Ou vá em Menu → "Instalar FinanceTrack"

#### No Celular/Tablet:
1. Abra no navegador Chrome/Safari
2. No Chrome: Menu (⋮) → "Instalar aplicativo"
3. No Safari (iOS): Compartilhar → "Adicionar à Tela Inicial"

### Benefícios:
- ✅ Funciona sem internet
- ✅ Dados salvos localmente
- ✅ Abre como app nativo
- ✅ Não precisa de servidor
- ✅ Sem custo mensal

## 🚀 Como Usar

### Desenvolvimento:
```bash
npm install
npm run dev
```

### Build para Produção:
```bash
npm run build
```

Os arquivos gerados em `dist/` podem ser:
- Copiados para qualquer computador
- Abertos diretamente no navegador
- Hospedados em qualquer servidor simples

### Usar Localmente (Sem Servidor):
```bash
npm run build
npm run preview
```

Ou simplesmente abra `dist/index.html` no navegador!

## 📊 Estrutura de Dados

### Receitas
- Data, Descrição, Valor
- Origem: Loja | Transportadora
- Categoria: Vendas | Serviços | Outros

### Custos Diretos (Variáveis)
- Relacionados ao volume de vendas/operação
- Ex: Mercadoria, Combustível

### Despesas Operacionais (Fixas)
- Independentes do volume
- Ex: Aluguel, Energia, Salários
- Podem ser compartilhadas (rateadas)

### Empréstimos
- Valor Total, Parcelas, Juros
- Cálculo automático do saldo devedor

## 💾 Armazenamento

Todos os dados são salvos automaticamente no navegador (localStorage):
- ✅ Não precisa de banco de dados
- ✅ Privacidade total (dados ficam no seu computador)
- ✅ Backup simples (exportar/importar JSON)

## 🔐 Segurança

- Dados armazenados localmente
- Sem envio para servidor externo
- Sem risco de vazamento de dados
- Recomendado fazer backup periódico

## 📱 Compatibilidade

- ✅ Chrome/Edge (Desktop e Mobile)
- ✅ Firefox (Desktop e Mobile)
- ✅ Safari (Desktop e Mobile)
- ✅ Funciona offline após instalação

## 🎨 Tecnologias

- React 18
- React Router
- TailwindCSS
- Recharts (gráficos)
- Vite PWA (offline)
- date-fns

---

**Desenvolvido com contabilidade profissional para pequenos e médios negócios.**
