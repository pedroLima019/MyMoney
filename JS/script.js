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
        listItem.dataset.categoria = categoria;
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

  function showConfirmationModal(callback) {
    const modal = document.getElementById("confirmation-modal");
    const successMessage = document.getElementById("success-message");

    modal.style.display = "flex";

    document.getElementById("confirm-yes").onclick = function () {
      modal.style.display = "none";
      callback(true);

      successMessage.style.display = "block";

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

  function payExpense(listItem) {
    showConfirmationModal(function (confirmed) {
      if (confirmed) {
        listItem.remove();

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

  function updateOverview() {
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    const categories = {};

    // Calcula o total por categoria
    expenses.forEach((expense) => {
      const category = expense.categoria;
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += expense.valor;
    });

    const totalExpenses = Object.values(categories).reduce((a, b) => a + b, 0);
    const overviewBody = document.getElementById("overview-body");
    overviewBody.innerHTML = "";

    // Adiciona uma linha para cada categoria na tabela
    for (const category in categories) {
      const totalGasto = categories[category].toFixed(2).replace(".", ",");
      const porcentagem = ((categories[category] / totalExpenses) * 100)
        .toFixed(2)
        .replace(".", ",");

      const row = `
        <tr>
          <td>${category}</td>
          <td>R$ ${totalGasto}</td>
          <td>${porcentagem}%</td>
        </tr>
      `;
      overviewBody.innerHTML += row;
    }
  }

  // Chama a função após carregar as despesas do localStorage
  loadFromLocalStorage();
  updateOverview();

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
      const categoria = expense.dataset.categoria;
      expenseArray.push({ nome, valor, categoria });
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
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    const expenseList = document.querySelector(".expense-list");

    expenseList.innerHTML = ""

    expenses.forEach((expense) => {
      const listItem = document.createElement("li");
      listItem.dataset.categoria = expense.categoria;
      listItem.innerHTML = `
        <span>${expense.nome}</span>
        <span class="amount">R$ ${expense.valor.toFixed(2).replace(".", ",")}</span>
        <div class="actions">
          <button class="pay-btn">✅</button>
          <button class="delete-btn">❌</button>
        </div>
      `;
      expenseList.appendChild(listItem);
    });

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
  updateOverview();
});
