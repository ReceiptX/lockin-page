/**
 * LockIn - Client-Side Page Access Control
 * 
 * A production-ready SaaS script for protecting webpage content with a password modal.
 * 
 * Usage:
 * <script src="https://your-cdn.com/lockin.js" 
 *         data-lockin-key="YOUR_LICENSE_KEY"
 *         data-lockin-password="YOUR_PASSWORD"
 *         data-lockin-title="Access Required"
 *         data-lockin-message="Please enter the password to continue"
 *         data-lockin-branding="hide"></script>
 * 
 * @version 1.0.0
 * @license Commercial
 */

(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.LockInInitialized) {
    return;
  }
  window.LockInInitialized = true;

  // Configuration object
  const config = {
    licenseKey: '',
    password: '',
    title: 'Access Required',
    message: 'Please enter the password to continue',
    placeholder: 'Enter password',
    submitText: 'Submit',
    errorMessage: 'Incorrect password. Please try again.',
    showBranding: true,
    maxAttempts: 0, // 0 = unlimited
    brandingText: 'Protected by LockIn',
    brandingLink: 'https://github.com/ReceiptX/lockin-page'
  };

  // Get the current script tag and extract configuration
  function getConfig() {
    const scripts = document.getElementsByTagName('script');
    let scriptTag = null;

    // Find the script tag that loaded this file
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || '';
      if (src.includes('lockin') || scripts[i].hasAttribute('data-lockin-key')) {
        scriptTag = scripts[i];
        break;
      }
    }

    if (!scriptTag) {
      console.error('LockIn: Could not find script tag');
      return;
    }

    // Extract configuration from data attributes
    config.licenseKey = scriptTag.getAttribute('data-lockin-key') || '';
    config.password = scriptTag.getAttribute('data-lockin-password') || '';
    config.title = scriptTag.getAttribute('data-lockin-title') || config.title;
    config.message = scriptTag.getAttribute('data-lockin-message') || config.message;
    config.placeholder = scriptTag.getAttribute('data-lockin-placeholder') || config.placeholder;
    config.submitText = scriptTag.getAttribute('data-lockin-submit') || config.submitText;
    config.errorMessage = scriptTag.getAttribute('data-lockin-error') || config.errorMessage;
    config.maxAttempts = parseInt(scriptTag.getAttribute('data-lockin-max-attempts') || '0', 10);
    
    const branding = scriptTag.getAttribute('data-lockin-branding');
    config.showBranding = branding !== 'hide' && branding !== 'false';

    // Validate required fields
    if (!config.licenseKey) {
      console.error('LockIn: License key is required (data-lockin-key)');
      return false;
    }

    if (!config.password) {
      console.error('LockIn: Password is required (data-lockin-password)');
      return false;
    }

    return true;
  }

  // Check if password is stored in sessionStorage
  function isAuthenticated() {
    const stored = sessionStorage.getItem('lockin_auth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.key === config.licenseKey && data.hash === hashPassword(config.password);
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  // Simple hash function for password validation (client-side obfuscation)
  function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  // Store authentication state
  function setAuthenticated() {
    sessionStorage.setItem('lockin_auth', JSON.stringify({
      key: config.licenseKey,
      hash: hashPassword(config.password),
      timestamp: Date.now()
    }));
  }

  // Create and inject modal HTML
  function createModal() {
    const modalHTML = `
      <div id="lockin-overlay" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        animation: lockin-fadein 0.3s ease-in;
      ">
        <div id="lockin-modal" style="
          background: #ffffff;
          border-radius: 12px;
          padding: 40px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: lockin-slideup 0.4s ease-out;
        ">
          <h2 style="
            margin: 0 0 12px 0;
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            text-align: center;
          ">${escapeHtml(config.title)}</h2>
          
          <p style="
            margin: 0 0 24px 0;
            font-size: 14px;
            color: #666;
            text-align: center;
            line-height: 1.5;
          ">${escapeHtml(config.message)}</p>
          
          <form id="lockin-form" style="margin: 0;">
            <input 
              type="password" 
              id="lockin-password" 
              placeholder="${escapeHtml(config.placeholder)}"
              autocomplete="off"
              style="
                width: 100%;
                padding: 12px 16px;
                font-size: 16px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                box-sizing: border-box;
                margin-bottom: 16px;
                transition: border-color 0.2s;
                font-family: inherit;
              "
              onfocus="this.style.borderColor='#4285f4'; this.style.outline='none';"
              onblur="this.style.borderColor='#e0e0e0';"
            />
            
            <button 
              type="submit" 
              id="lockin-submit"
              style="
                width: 100%;
                padding: 12px 16px;
                font-size: 16px;
                font-weight: 600;
                color: #ffffff;
                background: #4285f4;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
                font-family: inherit;
              "
              onmouseover="this.style.background='#3367d6';"
              onmouseout="this.style.background='#4285f4';"
            >${escapeHtml(config.submitText)}</button>
          </form>
          
          <div id="lockin-error" style="
            margin-top: 16px;
            padding: 12px;
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 6px;
            color: #c33;
            font-size: 14px;
            text-align: center;
            display: none;
          "></div>
          
          ${config.showBranding ? `
          <div style="
            margin-top: 24px;
            text-align: center;
            font-size: 12px;
            color: #999;
          ">
            <a href="${escapeHtml(config.brandingLink)}" target="_blank" rel="noopener" style="
              color: #999;
              text-decoration: none;
              transition: color 0.2s;
            " onmouseover="this.style.color='#666';" onmouseout="this.style.color='#999';">
              ${escapeHtml(config.brandingText)}
            </a>
          </div>
          ` : ''}
        </div>
      </div>
      
      <style>
        @keyframes lockin-fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes lockin-slideup {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes lockin-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        #lockin-modal.shake {
          animation: lockin-shake 0.4s ease-in-out;
        }
      </style>
    `;

    // Block the page content
    document.body.style.overflow = 'hidden';
    
    // Insert modal into the page
    const container = document.createElement('div');
    container.innerHTML = modalHTML;
    document.body.appendChild(container.firstElementChild);
  }

  // Remove modal and restore page
  function removeModal() {
    const overlay = document.getElementById('lockin-overlay');
    if (overlay) {
      overlay.style.animation = 'lockin-fadein 0.2s ease-out reverse';
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 200);
    }
  }

  // Handle form submission
  function handleSubmit(e) {
    e.preventDefault();
    
    const passwordInput = document.getElementById('lockin-password');
    const errorDiv = document.getElementById('lockin-error');
    const modal = document.getElementById('lockin-modal');
    const enteredPassword = passwordInput.value;

    // Check password
    if (enteredPassword === config.password) {
      // Correct password
      setAuthenticated();
      removeModal();
    } else {
      // Wrong password
      errorDiv.textContent = config.errorMessage;
      errorDiv.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
      
      // Shake animation
      modal.classList.add('shake');
      setTimeout(() => modal.classList.remove('shake'), 400);

      // Track attempts if limit is set
      if (config.maxAttempts > 0) {
        const attempts = parseInt(sessionStorage.getItem('lockin_attempts') || '0', 10) + 1;
        sessionStorage.setItem('lockin_attempts', attempts.toString());
        
        if (attempts >= config.maxAttempts) {
          errorDiv.textContent = 'Maximum attempts reached. Please contact the administrator.';
          passwordInput.disabled = true;
          document.getElementById('lockin-submit').disabled = true;
        } else if (config.maxAttempts - attempts <= 2) {
          errorDiv.textContent = `${config.errorMessage} (${config.maxAttempts - attempts} attempts remaining)`;
        }
      }
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize the lock
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Get configuration
    if (!getConfig()) {
      return;
    }

    // Check if already authenticated
    if (isAuthenticated()) {
      return;
    }

    // Create and show modal
    createModal();

    // Set up form handler
    const form = document.getElementById('lockin-form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
      
      // Focus the password input
      setTimeout(() => {
        const passwordInput = document.getElementById('lockin-password');
        if (passwordInput) {
          passwordInput.focus();
        }
      }, 100);
    }
  }

  // Start initialization
  init();
})();
