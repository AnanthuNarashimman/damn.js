// UI controller for the DevTools panel - receives, displays, filters errors and provides AI-powered debugging features

let errors = [];
let selectedErrorId = null;
let filters = {
  'console.error': true,
  'window.onerror': true,
  'unhandledRejection': true
};

const errorListEl = document.getElementById('error-list');
const filterCheckboxes = document.querySelectorAll('.damn-filters input');

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FORWARD_ERROR') {
      addError(request.data);
      sendResponse({ success: true });
    }
  });

  filterCheckboxes.forEach(cb => {
    cb.addEventListener('click', (e) => {
      const type = e.target.id.replace('filter-', '');
      filters[type] = e.target.checked;
      renderErrors();
    });
  });

  renderErrors();
});


function addError(errorData) {
  errors.unshift(errorData);
  if (errors.length > 100) errors.pop();
  renderErrors();
}

// renders error-cards based on errors
function renderErrors() {
  const filtered = errors.filter(err => {
    const typeKey = err.type === 'window.onerror' ? 'window.onerror' :
      err.type === 'unhandledRejection' ?
        'unhandledRejection' :
        'console.error';

    return filters[typeKey];
  });

  if (filtered.length === 0) {
    errorListEl.innerHTML = '<p class="placeholder">No errors yet. Keep coding!</p>';
    return;
  }

  errorListEl.innerHTML = filtered.map(err => `
    <div class="error-card ${err.id === selectedErrorId ? 'selected' : ''}" data-id="${err.id}">
      <div class="error-card-content">
        <div class="error-type">${err.type}</div>
        <div class="error-message">${escapeHtml(err.message.substring(0, 100))}</div>
        <div class="error-time">${new Date(err.timestamp).toLocaleTimeString()}</div>
      </div>
      <div class="error-actions">
        <button class="btn btn-explain" data-error-id="${err.id}">💡 Explain</button>
        <button class="btn btn-spell" data-error-id="${err.id}">✨ Spell</button>
      </div>
    </div>
  `).join('');

  // Add event listeners to buttons (CSP-compliant)
  document.querySelectorAll('.btn-explain').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const errorId = parseFloat(e.target.dataset.errorId);
      explainError(errorId);
    });
  });

  document.querySelectorAll('.btn-spell').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const errorId = parseFloat(e.target.dataset.errorId);
      castSpell(errorId);
    });
  });

  document.querySelectorAll('.error-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn')) {
        selectedErrorId = parseInt(card.dataset.id);
        renderErrors();
      }
    });
  });
}

// function to call the function reponsible for explaining the errors
function explainError(errorId) {
  const error = errors.find(e => e.id === errorId);
  if (!error) return;

  showModal('Explaining Error...', '<p>Loading explanation...</p>');

  ApiClient.explain(error).then(result => {
    const html = `
    <div class="explanation-box">
        <strong>Explanation:</strong>
        <p>${escapeHtml(result.explanation)}</p>
      </div>
      <div class="explanation-box">
        <strong>What to try:</strong>
        <p>${escapeHtml(result.fix)}</p>
      </div>
      ${result.references && result.references.length ? `
        <div class="references-list">
          <strong>References:</strong>
          <ul>
            ${result.references.map(ref => `<li><a href="${ref.url}" target="_blank">${escapeHtml(ref.title)}</a></li>`).join('')}
          </ul>
        </div>
    ` : ''}
    `;
    updateModal('Error Explanation', html);
  }).catch(err => {
    updateModal('Error', `<p style="color: #f85149;"Failed to explain error: ${err.message}</p>`);
  });
}

// function for calling the function reponsible for getting prompts for errors
function castSpell(errorId) {
  const error = errors.find(e => e.id === errorId);
  if (!error) return;

  showModal('Generating Spell...', '<p>Crafting the perfect debugging prompt...</p>');

  ApiClient.generatePrompt(error, errors).then(result => {
    const html = `
      <strong>Your AI-Ready Debugging Prompt:</strong>
      <div class="prompt-box">
        <button class="copy-btn">Copy</button>
        <pre>${escapeHtml(result.prompt)}</pre>
      </div>
      <p style="font-size: 12px; color: #8b949e; margin-top: 12px;">
        Use this prompt in your favorite AI tool (Cursor, Claude, ChatGPT) to get structured debugging help.
      </p>
    `;
    updateModal('Spell Generated ✨', html);
  }).catch(err => {
    updateModal('Error', `<p style="color: #f85149;">Failed to generate spell: ${err.message}</p>`);
  });
}

// function to enable modals for specific errors
function showModal(title, content) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'damn-modal';
  modal.innerHTML = `
  <div class="modal">
      <button class="modal-close">×</button>
      <h2>${title}</h2>
      ${content}
    </div>
  `;
  document.body.appendChild(modal);
  
  // Add close button event listener (CSP-compliant)
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// function to update modal from loading state to display state after getting reponse from explanation function
function updateModal(title, content) {
  const modal = document.getElementById('damn-modal');
  if(modal) {
    modal.querySelector('h2').textContent = title;
    modal.querySelector('.modal').innerHTML = `
      <button class="modal-close">×</button>
      <h2>${title}</h2>
      ${content}
    `;
    
    // Re-attach event listeners after updating innerHTML
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    
    // Attach copy button listener if it exists
    const copyBtn = modal.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        copyToClipboard(this);
      });
    }
  }
}

// function to close modal
function closeModal() {
  const modal = document.getElementById('damn-modal');
  if(modal) modal.remove();
}

// function to copy prompt to clipboard
function copyToClipboard(btn) {
  const text = btn.nextElementSibling.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => {
      btn.textContent = original;
    }, 2000)
  });
}

// function to prevent XSS attacks. converts dangerous code into text
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML
}

