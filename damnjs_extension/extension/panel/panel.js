// Select UI elements
const errorInput = document.getElementById("error-input");
const explainBtn = document.getElementById("explain-btn");
const spellBtn = document.getElementById("spell-btn");
const output = document.getElementById("output");

// Explain button clicked
explainBtn.addEventListener("click", () => {
  const errorText = errorInput.value.trim();

  if (!errorText) {
    output.textContent = "Please enter or select an error.";
    return;
  }

  output.textContent = "Analyzing error...";

  // Send message to background worker
  chrome.runtime.sendMessage(
    {
      type: "EXPLAIN_ERROR",
      payload: errorText
    },
    (response) => {
      if (response && response.result) {
        output.textContent = response.result;
      } else {
        output.textContent = "Unable to explain error.";
      }
    }
  );
});

// Spell button clicked
spellBtn.addEventListener("click", () => {
  const errorText = errorInput.value.trim();

  if (!errorText) {
    output.textContent = "No error to generate spell for.";
    return;
  }

  const spellPrompt = `
Analyze the following JavaScript error:

${errorText}

Explain the root cause, most likely scenarios, and detailed steps to fix it.
  `;

  output.textContent = spellPrompt;
});
