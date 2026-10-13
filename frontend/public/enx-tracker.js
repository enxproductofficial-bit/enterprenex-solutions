/**
 * Enterprenex Web Analytics & Visitor Activity Tracking SDK (v1.2)
 * Lightweight, privacy-conscious visitor telemetry script for enterprenex.solutions
 * Captures pageviews, user interactions, click events, device telemetrics & session duration
 */
(function (window, document) {
  'use strict';

  var STORAGE_KEY = 'enx_visitor_telemetry';
  var SESSION_KEY = 'enx_visitor_session';

  function generateId(prefix) {
    return prefix + '_' + Math.random().toString(36).substring(2, 9);
  }

  function getBrowserInfo() {
    var ua = navigator.userAgent;
    var browser = 'Chrome';
    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
    else if (ua.indexOf('Edg') > -1) browser = 'Edge';
    else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';

    var os = 'Windows';
    if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';

    var device = 'Desktop';
    if (/Mobi|Android|iPhone/i.test(ua)) device = 'Mobile';
    else if (/iPad|Tablet/i.test(ua)) device = 'Tablet';

    return { browser: browser, os: os, device: device };
  }

  var EnxTracker = {
    version: '1.2.0',
    visitorId: null,
    sessionId: null,
    startTime: Date.now(),

    init: function () {
      // Restore or generate Visitor ID
      var storedId = localStorage.getItem('enx_vid');
      if (!storedId) {
        storedId = generateId('vst');
        localStorage.setItem('enx_vid', storedId);
      }
      this.visitorId = storedId;

      // Restore or generate Session ID
      var session = sessionStorage.getItem(SESSION_KEY);
      if (!session) {
        session = generateId('sess');
        sessionStorage.setItem(SESSION_KEY, session);
      }
      this.sessionId = session;

      // Log initial page view
      this.trackPageView();

      // Listen for click interactions
      this.bindEvents();
    },

    trackPageView: function () {
      var clientInfo = getBrowserInfo();
      var eventData = {
        id: generateId('evt'),
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        type: 'pageview',
        path: window.location.pathname,
        title: document.title || 'Enterprenex Solutions',
        referrer: document.referrer || 'Direct Visit',
        screen: window.screen.width + 'x' + window.screen.height,
        browser: clientInfo.browser,
        os: clientInfo.os,
        device: clientInfo.device,
        timestamp: new Date().toISOString()
      };

      this.saveEvent(eventData);
    },

    trackAction: function (actionName, details) {
      var clientInfo = getBrowserInfo();
      var eventData = {
        id: generateId('evt'),
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        type: 'interaction',
        action: actionName,
        path: window.location.pathname,
        details: details || {},
        device: clientInfo.device,
        browser: clientInfo.browser,
        timestamp: new Date().toISOString()
      };

      this.saveEvent(eventData);
    },

    saveEvent: function (eventData) {
      try {
        var existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        existing.unshift(eventData);
        // Retain latest 100 events
        if (existing.length > 100) existing = existing.slice(0, 100);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

        // Dispatch CustomEvent for live UI synchronization
        window.dispatchEvent(new CustomEvent('enx:telemetry', { detail: eventData }));
      } catch (e) {
        // Safe failover
      }
    },

    bindEvents: function () {
      var self = this;
      document.addEventListener('click', function (e) {
        var target = e.target.closest('a, button, [data-track]');
        if (target) {
          var label = (target.innerText || target.getAttribute('aria-label') || target.getAttribute('title') || '').trim();
          var href = target.getAttribute('href') || '';
          if (label || href) {
            self.trackAction('Button / Link Clicked', {
              text: label.substring(0, 50),
              href: href,
              tag: target.tagName.toLowerCase()
            });
          }
        }
      }, true);
    }
  };

  // Expose global SDK
  window.EnxTracker = EnxTracker;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      EnxTracker.init();
    });
  } else {
    EnxTracker.init();
  }
})(window, document);
