document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("add-expense-btn")
    .addEventListener("click", function () {
      const nome = document.getElementById("nome").value;
      const valor = parseFloat(
        document
          .getElementById("valor")
          .value.replace("R$", "")
          .replace(",", ".")
      );

      const tipo = document.getElementById("tipo").value;
      const categoria = document.getElementById("categoria").value;

      if (!nome || isNaN(valor) || !tipo || !categoria) {
        alert("Preencha todos os campos corretamente.");
        return;
      }

      if (tipo === "entrada") {
        // Atualize o saldo
        const saldo = parseFloat(
          document
            .querySelector(".balance-acount h3")
            .textContent.replace("R$", "")
            .replace(",", ".")
        );
        const novoSaldo = saldo + valor;
        document.querySelector(
          ".balance-acount h3"
        ).textContent = `R$ ${novoSaldo.toFixed(2).replace(".", ",")}`;

        // acumule o valor da receita
        const receitasText = document
          .querySelector(".balance-enter p strong")
          .textContent.replace("R$", "")
          .replace(",", ".");
        const receitas = parseFloat(receitasText) || 0;
        const novoReceita = receitas + valor;

        document.querySelector(
          ".balance-enter p strong"
        ).textContent = `R$ ${valor.toFixed(2).replace(".", ",")}`;

        document.getElementById("expense-form").reset();
        return;
      }

      if (tipo === "saida") {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          <span>${nome}</span>
          <span class="amount">R$ ${valor.toFixed(2).replace(".", ",")}</span>
          <div class="actions">
            <button class="pay-btn">✅</button>
            <button class="delete-btn">❌</button>
          </div>
      `;

        document.querySelector(".expense-list").appendChild(listItem);

        updateBalance();
        saveToLocalStorage();

        document.getElementById("expense-form").reset();
      }
    });

  // Função para atualizar o saldo e as saídas
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

      saidas += value;
      total -= value;
    });

    document.querySelector(".balance-acount h3").textContent = `R$ ${total
      .toFixed(2)
      .replace(".", ",")}`;

    document.querySelector(".balance-down p strong").textContent = `R$ ${saidas
      .toFixed(2)
      .replace(".", ",")}`;
  }

  // Função para exibir o modal de confirmação
  function showConfirmationModal(callback) {
    const modal = document.getElementById("confirmation-modal");
    const successMessage = document.getElementById("success-message");

    modal.style.display = "flex";

    document.getElementById("confirm-yes").onclick = function () {
      modal.style.display = "none";
      callback(true);

      // Exibir mensagem de sucesso
      successMessage.style.display = "block";

      // Esconder a mensagem de sucesso após 3 segundos
      setTimeout(function () {
        successMessage.style.display = "none";
      }, 3000);
    };

    document.getElementById("confirm-no").onclick = function () {
      modal.style.display = "none";
      callback(false);
    };
  }

  function showDeleteConfirmationModal(callback) {
    const modal = document.getElementById("delete-confirmation-modal");
    modal.style.display = "flex";

    document.getElementById("delete-confirm-yes").onclick = function () {
      modal.style.display = "none";
      callback(true);
    };

    document.getElementById("delete-confirm-no").onclick = function () {
      modal.style.display = "none";
      callback(false);
    };
  }

  // Função para pagar uma despesa
  function payExpense(listItem) {
    showConfirmationModal(function (confirmed) {
      if (confirmed) {
        // Remove a despesa da lista
        listItem.remove();
        // Atualiza o saldo e as saídas
        updateBalance();
        showSuccessMessage("Despesa paga com sucesso!", "green");
        saveToLocalStorage();
      }
    });
  }

  function handleExpenseDeletion(listItem, value) {
    const saldo = parseFloat(
      document
        .querySelector(".balance-acount h3")
        .textContent.replace("R$", "")
        .replace(",", ".")
    );
    const novoSaldo = saldo + value;

    document.querySelector(".balance-acount h3").textContent = `R$ ${novoSaldo
      .toFixed(2)
      .replace(".", ",")}`;

    listItem.remove();
    updateBalance();
    saveToLocalStorage();
    showSuccessMessage("Despesa excluída com sucesso!", "red");
  }

  function showSuccessMessage(message, color) {
    const successMessage = document.getElementById("success-message");
    successMessage.textContent = message;
    successMessage.style.display = "block";
    successMessage.style.background = color;

    setTimeout(function () {
      successMessage.style.display = "none";
    }, 3000);
  }

  document
    .querySelector(".expense-list")
    .addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-btn")) {
        const listItem = e.target.closest("li");
        const valueText = listItem
          .querySelector(".amount")
          .textContent.replace("R$", "")
          .replace(",", ".");
        const value = parseFloat(valueText);

        showDeleteConfirmationModal(function (confirmed) {
          if (confirmed) {
            handleExpenseDeletion(listItem, value);

            showSuccessMessage("Despesa excluída com sucesso!");

            saveToLocalStorage();
          }
        });
      }
    });

  document
    .querySelector(".expense-list")
    .addEventListener("click", function (e) {
      if (e.target.classList.contains("pay-btn")) {
        const listItem = e.target.closest("li");
        const valueText = listItem
          .querySelector(".amount")
          .textContent.replace("R$", "")
          .replace(",", ".");
        const value = parseFloat(valueText);

        payExpense(listItem, value);
      }
    });

  function saveToLocalStorage() {
    const expenses = document.querySelectorAll(".expense-list li");
    const expenseArray = [];
    expenses.forEach((expense) => {
      const nome = expense.querySelector("span:first-child").textContent;
      const valor = parseFloat(
        expense
          .querySelector(".amount")
          .textContent.replace("R$", "")
          .replace(",", ".")
      );
      expenseArray.push({ nome, valor });
    });

    const saldo = parseFloat(
      document
        .querySelector(".balance-acount h3")
        .textContent.replace("R$", "")
        .replace(",", ".")
    );

    const receitas = parseFloat(
      document
        .querySelector(".balance-enter p strong")
        .textContent.replace("R$", "")
        .replace(",", ".")
    );

    const saidas = parseFloat(
      document
        .querySelector(".balance-down p strong")
        .textContent.replace("R$", "")
        .replace(",", ".")
    );

    localStorage.setItem("expenses", JSON.stringify(expenseArray));
    localStorage.setItem("saldo", saldo);
    localStorage.setItem("receitas", receitas);
    localStorage.setItem("saidas", saidas);
  }

  function loadFromLocalStorage() {
    const expenses = JSON.parse(localStorage.getItem("expenses"));
    if (expenses) {
      expenses.forEach((expense) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <span>${expense.nome}</span>
            <span class="amount">R$ ${expense.valor
              .toFixed(2)
              .replace(".", ",")}</span>
            <div class="actions">
              <button class="pay-btn">✅</button>
              <button class="delete-btn">❌</button>
            </div>
        `;
        document.querySelector(".expense-list").appendChild(listItem);
      });
    }

    const saldo = localStorage.getItem("saldo");
    const receitas = localStorage.getItem("receitas");
    const saidas = localStorage.getItem("saidas");

    if (saldo) {
      document.querySelector(
        ".balance-acount h3"
      ).textContent = `R$ ${parseFloat(saldo).toFixed(2).replace(".", ",")}`;
    }
    if (receitas) {
      document.querySelector(
        ".balance-enter p strong"
      ).textContent = `R$ ${parseFloat(receitas).toFixed(2).replace(".", ",")}`;
    }
    if (saidas) {
      document.querySelector(
        ".balance-down p strong"
      ).textContent = `R$ ${parseFloat(saidas).toFixed(2).replace(".", ",")}`;
    }
  }

  loadFromLocalStorage();
});
