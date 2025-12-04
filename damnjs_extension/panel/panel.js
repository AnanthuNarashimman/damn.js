// Placeholder reference
const errorInput = document.getElementById("error-input");
const explainBtn = document.getElementById("explain-btn");
const spellBtn = document.getElementById("spell-btn");
const output = document.getElementById("output");

// Listen for Explain button
explainBtn.addEventListener("click", () => {
  const err = errorInput.value.trim();

  if (!err) {
    output.textContent = "Please select or paste an error.";
    return;
  }

  output.textContent = "Processing... (MVP placeholder)";
});

// Listen for Get Spell button
spellBtn.addEventListener("click", () => {
  const err = errorInput.value.trim();

  if (!err) {
    output.textContent = "No error found to generate a spell.";
    return;
  }

  output.textContent =
    "Generated Spell Prompt:\n\n" +
    `Please analyze the following error:\n${err}\n\n` +
    "Explain root causes & provide fix paths.";
});

