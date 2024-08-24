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

  document
    .querySelector(".expense-list")
    .addEventListener("click", function (e) {
      if (e.target.classList.contains("delete-btn")) {
        const valueText = e.target
          .closest("li")
          .querySelector(".amount")
          .textContent.replace("R$", "")
          .replace(",", ".");
        const value = parseFloat(valueText);

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

        saveToLocalStorage();
      }
    });

  function showConfirmationModal(callback) {
    const modal = document.getElementById("confirmation-modal");
    
    modal.style.display = "flex";

    document.getElementById("confirm-yes").onclick = function () {
      modal.style.display = "none";
      callback(true);
    };

    document.getElementById("confirm-no").onclick = function () {
      modal.style.display = "none";
      callback(false);
    };
  }

  document
    .querySelector(".expense-list")
    .addEventListener("click", function (e) {
      if (e.target.classList.contains("pay-btn")) {
        showConfirmationModal(function (confirmed) {
          if (confirmed) {
            const valueText = e.target
              .closest("li")
              .querySelector(".amount")
              .textContent.replace("R$", "")
              .replace(",", ".");
            const value = parseFloat(valueText);

            const saldo = parseFloat(
              document
                .querySelector(".balance-acount h3")
                .textContent.replace("R$", "")
                .replace(",", ".")
            );
            document.querySelector(".balance-acount h3").textContent = `R$ ${(
              saldo - value
            )
              .toFixed(2)
              .replace(".", ",")}`;
          }

          e.target.closest("li").remove();
          updateBalance()

          saveToLocalStorage()
        });
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
      ).textContent = `R$ ${parseFloat(saldo).toFixed(2).replace(",", ".")}`;
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
