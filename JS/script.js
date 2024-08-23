document
  .getElementById("add-expense-btn")
  .addEventListener("click", function () {
    // Capturar dados do formulário
    const nome = document.getElementById("nome").value;
    const valor = parseFloat(
      document.getElementById("valor").value.replace("R$", "").replace(",", ".")
    );
    const tipo = document.getElementById("tipo").value;
    const categoria = document.getElementById("categoria").value;

    // Validar dados
    if (!nome || isNaN(valor) || !tipo || !categoria) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    // Adicionar ao saldo se for uma entrada
    if (tipo === "entrada") {
      const saldo = parseFloat(
        document
          .querySelector(".balance-acount h3")
          .textContent.replace("R$", "")
          .replace(",", ".")
      );
      const novoSaldo = saldo + valor;
      document.querySelector(".balance-acount h3").textContent = `R$ ${novoSaldo
        .toFixed(2)
        .replace(".", ",")}`;

      const receitas = parseFloat(
        document
          .querySelector(".balance-enter p strong")
          .textContent.replace("R$", "")
          .replace(",", ".")
      );
      document.querySelector(".balance-enter p strong").textContent = `R$ ${(
        receitas + valor
      )
        .toFixed(2)
        .replace(".", ",")}`;

      // Limpar o formulário
      document.getElementById("expense-form").reset();
      return; // Não adiciona à lista de despesas
    }

    // Adicionar à lista de despesas se for uma saída
    if (tipo === "saida") {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <span>${nome}</span>
        <span class="amount">R$${valor.toFixed(2).replace(".", ",")}</span>
        <div class="actions">
          <button class="pay-btn">✅</button>
          <button class="delete-btn">❌</button>
        </div>
      `;

      // Adicionar à lista de despesas
      document.querySelector(".expense-list").appendChild(listItem);

      // Atualizar o saldo e as saídas
      updateBalance();

      // Limpar o formulário
      document.getElementById("expense-form").reset();
    }
  });

function updateBalance() {
  const expenses = document.querySelectorAll(".expense-list li");
  let total = parseFloat(
    document
      .querySelector(".balance-acount h3")
      .textContent.replace("R$", "")
      .replace(",", ".")
  );
  let saidas = 0;

  expenses.forEach((expense) => {
    const valueText = expense
      .querySelector(".amount")
      .textContent.replace("R$", "")
      .replace(",", ".");
    const value = parseFloat(valueText);

    // Somar o valor das saídas
    saidas += value;
    total -= value;
  });

  // Atualizar elementos na página
  document.querySelector(".balance-acount h3").textContent = `R$ ${total
    .toFixed(2)
    .replace(".", ",")}`;
  document.querySelector(".balance-down p strong").textContent = `R$ ${saidas
    .toFixed(2)
    .replace(".", ",")}`;
}

// Função para remover despesas
document.querySelector(".expense-list").addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-btn")) {
    const valueText = e.target
      .closest("li")
      .querySelector(".amount")
      .textContent.replace("R$", "")
      .replace(",", ".");
    const value = parseFloat(valueText);

    // Atualizar o saldo ao remover a despesa
    const saldo = parseFloat(
      document
        .querySelector(".balance-acount h3")
        .textContent.replace("R$", "")
        .replace(",", ".")
    );
    document.querySelector(".balance-acount h3").textContent = `R$ ${(
      saldo + value
    )
      .toFixed(2)
      .replace(".", ",")}`;

    e.target.closest("li").remove();
    updateBalance();
  }
});

// Função para marcar despesas como pagas
document.querySelector(".expense-list").addEventListener("click", function (e) {
  if (e.target.classList.contains("pay-btn")) {
    const valueText = e.target
      .closest("li")
      .querySelector(".amount")
      .textContent.replace("R$", "")
      .replace(",", ".");
    const value = parseFloat(valueText);

    e.target.closest("li").remove();
    updateBalance();
  }
});
