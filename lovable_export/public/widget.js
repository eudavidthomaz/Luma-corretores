(function() {
  'use strict';
  
  // Get configuration from script tag
  var script = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();
  
  var userId = script.getAttribute('data-user');
  if (!userId) {
    console.error('[Luma Widget] Missing data-user attribute');
    return;
  }
  
  var baseUrl = script.src.replace('/widget.js', '');
  
  // State
  var isOpen = false;
  var isLoaded = false;
  var profileData = null;
  
  // Generate or retrieve persistent visitor ID (cross-session memory)
  function getOrCreateVisitorId() {
    var storageKey = 'luma_visitor_id';
    var visitorId = null;
    
    try {
      visitorId = localStorage.getItem(storageKey);
      if (!visitorId) {
        // Generate UUID-like ID
        visitorId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0;
          var v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        localStorage.setItem(storageKey, visitorId);
      }
    } catch (e) {
      // localStorage not available, generate temporary ID
      visitorId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    return visitorId;
  }
  
  var visitorId = getOrCreateVisitorId();
  
  // Create styles
  var styles = document.createElement('style');
  styles.textContent = '\
    #luma-widget-container { \
      position: fixed; \
      bottom: 20px; \
      right: 20px; \
      z-index: 2147483647; \
      font-family: system-ui, -apple-system, sans-serif; \
    } \
    #luma-widget-btn { \
      width: 60px; \
      height: 60px; \
      border-radius: 50%; \
      cursor: pointer; \
      box-shadow: 0 4px 20px rgba(0,0,0,0.25), 0 0 0 3px rgba(168, 85, 247, 0.4); \
      transition: transform 0.2s ease, box-shadow 0.2s ease; \
      background: linear-gradient(135deg, #9333ea, #7c3aed); \
      border: none; \
      padding: 3px; \
      position: relative; \
      overflow: visible; \
    } \
    #luma-widget-btn:hover { \
      transform: scale(1.08); \
      box-shadow: 0 6px 25px rgba(0,0,0,0.3), 0 0 0 4px rgba(168, 85, 247, 0.5); \
    } \
    #luma-widget-btn img { \
      width: 100%; \
      height: 100%; \
      border-radius: 50%; \
      object-fit: cover; \
    } \
    #luma-widget-btn-fallback { \
      width: 100%; \
      height: 100%; \
      border-radius: 50%; \
      background: linear-gradient(135deg, #9333ea, #7c3aed); \
      display: flex; \
      align-items: center; \
      justify-content: center; \
      color: white; \
      font-size: 24px; \
      font-weight: bold; \
    } \
    #luma-widget-badge { \
      position: absolute; \
      top: -4px; \
      right: -4px; \
      width: 22px; \
      height: 22px; \
      background: #ef4444; \
      border-radius: 50%; \
      color: white; \
      font-size: 12px; \
      font-weight: bold; \
      display: flex; \
      align-items: center; \
      justify-content: center; \
      border: 2px solid white; \
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5); \
      animation: luma-pulse 2s ease-in-out infinite; \
    } \
    @keyframes luma-pulse { \
      0%, 100% { transform: scale(1); } \
      50% { transform: scale(1.1); } \
    } \
    #luma-widget-frame-container { \
      position: absolute; \
      bottom: 75px; \
      right: 0; \
      width: 380px; \
      height: 600px; \
      max-height: calc(100vh - 120px); \
      border-radius: 16px; \
      overflow: hidden; \
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); \
      opacity: 0; \
      transform: translateY(20px) scale(0.95); \
      pointer-events: none; \
      transition: opacity 0.3s ease, transform 0.3s ease; \
    } \
    #luma-widget-frame-container.open { \
      opacity: 1; \
      transform: translateY(0) scale(1); \
      pointer-events: auto; \
    } \
    #luma-widget-frame { \
      width: 100%; \
      height: 100%; \
      border: none; \
      border-radius: 16px; \
    } \
    @media (max-width: 420px) { \
      #luma-widget-frame-container { \
        width: calc(100vw - 40px); \
        right: 0; \
        bottom: 75px; \
      } \
    } \
  ';
  document.head.appendChild(styles);
  
  // Create container
  var container = document.createElement('div');
  container.id = 'luma-widget-container';
  
  // Create button
  var button = document.createElement('button');
  button.id = 'luma-widget-btn';
  button.setAttribute('aria-label', 'Abrir chat');
  button.innerHTML = '<div id="luma-widget-btn-fallback">L</div><div id="luma-widget-badge">1</div>';
  
  // Create iframe container
  var frameContainer = document.createElement('div');
  frameContainer.id = 'luma-widget-frame-container';
  
  container.appendChild(frameContainer);
  container.appendChild(button);
  
  // Wait for DOM ready
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
  
  ready(function() {
    document.body.appendChild(container);
    loadProfile();
  });
  
  // Load profile data
  function loadProfile() {
    fetch(baseUrl + '/functions/v1/widget-profile?userId=' + encodeURIComponent(userId))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.avatar_url) {
          profileData = data;
          updateButtonAvatar(data.luma_avatar_url || data.avatar_url);
        }
      })
      .catch(function(err) {
        console.warn('[Luma Widget] Could not load profile:', err);
      });
  }
  
  // Update button with avatar
  function updateButtonAvatar(avatarUrl) {
    if (!avatarUrl) return;
    var img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = 'Chat';
    img.onload = function() {
      var fallback = button.querySelector('#luma-widget-btn-fallback');
      if (fallback) fallback.remove();
      button.insertBefore(img, button.firstChild);
    };
  }
  
  // Toggle chat
  function toggleChat() {
    isOpen = !isOpen;
    
    if (isOpen) {
      // Hide badge when opened
      var badge = button.querySelector('#luma-widget-badge');
      if (badge) badge.style.display = 'none';
      
      // Create iframe if not loaded (include visitorId for persistent memory)
      if (!isLoaded) {
        var iframe = document.createElement('iframe');
        iframe.id = 'luma-widget-frame';
        iframe.src = baseUrl + '/embed/' + userId + '?vid=' + encodeURIComponent(visitorId);
        iframe.setAttribute('allow', 'microphone');
        frameContainer.appendChild(iframe);
        isLoaded = true;
      }
      
      frameContainer.classList.add('open');
    } else {
      frameContainer.classList.remove('open');
    }
  }
  
  button.addEventListener('click', toggleChat);
  
  // Listen for messages from iframe
  window.addEventListener('message', function(event) {
    if (!event.data || event.data.source !== 'luma-widget') return;
    
    switch (event.data.type) {
      case 'close':
      case 'minimize':
        if (isOpen) toggleChat();
        break;
      case 'ready':
        // Widget is ready
        break;
    }
  });
})();
