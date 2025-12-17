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
    cb.addEventListener('change', (e) => {
      const filterId = e.target.id;
      if (filterId === 'filter-error') {
        filters['console.error'] = e.target.checked;
      } else if (filterId === 'filter-window') {
        filters['window.onerror'] = e.target.checked;
      } else if (filterId === 'filter-promise') {
        filters['unhandledRejection'] = e.target.checked;
      }
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
    errorListEl.innerHTML = `
      <div class="placeholder">
        <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <h3>No errors detected</h3>
        <p>Your application is running smoothly</p>
      </div>
    `;
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
        <button class="btn btn-explain" data-error-id="${err.id}">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Explain
        </button>
        <button class="btn btn-spell" data-error-id="${err.id}">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Spell
        </button>
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
    let errorMessage = err.message;
    let errorHtml = '';
    
    // Check if it's a 503 error from response
    if (err.message && err.message.includes('503')) {
      errorHtml = `
        <div class="error-notice">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#F59E0B" stroke-width="2"/>
            <path d="M12 8v4m0 4h.01" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h3>Gemini API Temporarily Unavailable</h3>
          <p>The Google Gemini model is currently experiencing high traffic. This is not an issue with damn.js.</p>
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Wait a few moments and try again</li>
            <li>The request will automatically retry up to 3 times</li>
            <li>If the issue persists, please try again in a few minutes</li>
          </ul>
        </div>
      `;
    } else {
      errorHtml = `<p class="error-text">Failed to explain error: ${escapeHtml(errorMessage)}</p>`;
    }
    
    updateModal('Error', errorHtml);
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
      <p style="font-size: 12px; color: var(--text-secondary); margin-top: 12px;">
        Use this prompt in your favorite AI tool (Cursor, Claude, ChatGPT) to get structured debugging help.
      </p>
    `;
    updateModal('Spell Generated', html);
  }).catch(err => {
    let errorHtml = '';
    
    if (err.message && err.message.includes('503')) {
      errorHtml = `
        <div class="error-notice">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#F59E0B" stroke-width="2"/>
            <path d="M12 8v4m0 4h.01" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <h3>Gemini API Temporarily Unavailable</h3>
          <p>The Google Gemini model is currently experiencing high traffic. This is not an issue with damn.js.</p>
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Wait a few moments and try again</li>
            <li>The request will automatically retry up to 3 times</li>
            <li>If the issue persists, please try again in a few minutes</li>
          </ul>
        </div>
      `;
    } else {
      errorHtml = `<p class="error-text">Failed to generate spell: ${escapeHtml(err.message)}</p>`;
    }
    
    updateModal('Error', errorHtml);
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
  const promptBox = btn.parentElement;
  const preElement = promptBox.querySelector('pre');
  const text = preElement ? preElement.textContent : btn.nextElementSibling.innerText;
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

