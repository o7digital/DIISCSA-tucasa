// Olivia API contract adapted from o7digital/suitesmine-bot (lib/api.js and O7Widget.jsx).
(() => {
  const base = 'https://suitesmine-bot.vercel.app/api';
  const clientCode = 'diicsatucasa';
  const root = document.createElement('aside');
  root.className = 'olivia-chat';
  root.setAttribute('aria-label', 'Olivia IA');
  root.innerHTML = `<button class="olivia-toggle" aria-expanded="false" aria-controls="olivia-panel">✦ <span>Olivia IA</span></button>
    <section id="olivia-panel" class="olivia-panel" aria-label="Chat con Olivia IA" hidden>
      <header class="olivia-header"><div><strong>✦ Olivia IA</strong><small>DIICSA Tu Casa · Asistente virtual</small></div><button type="button" class="olivia-close" aria-label="Cerrar chat">×</button></header>
      <p class="olivia-notice">Explora la demo. Las cotizaciones y visitas requieren confirmación de DIICSA.</p>
      <div class="olivia-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
      <form class="olivia-consent"><p>Para responderte, Olivia procesa tus mensajes mediante los servicios de IA de O7 Digital. Si aceptas, la conversación podrá guardarse en su plataforma para seguimiento. No compartas información sensible. Esta demo no agenda servicios.</p><label><input type="checkbox" required> Acepto el tratamiento de mis mensajes para recibir atención.</label><button type="submit">Iniciar conversación</button></form>
      <form class="olivia-compose" hidden><label class="olivia-sr" for="olivia-message">Tu mensaje</label><textarea id="olivia-message" placeholder="¿Cómo podemos ayudarte?" rows="2" maxlength="2000" required></textarea><button type="submit" aria-label="Enviar mensaje">↑</button></form>
      <p class="olivia-status" role="status"></p>
    </section>`;
  document.body.append(root);
  const $ = selector => root.querySelector(selector);
  const panel = $('.olivia-panel');
  const toggle = $('.olivia-toggle');
  const compose = $('.olivia-compose');
  const consent = $('.olivia-consent');
  const input = $('#olivia-message');
  const log = $('.olivia-messages');
  const status = $('.olivia-status');
  let identity = '', expiresAt = 0, busy = false, accepted = false;
  let storageReady = false;
  let visitorId = crypto.randomUUID();
  try { visitorId = sessionStorage.getItem('diicsa-olivia-visitor') || visitorId; sessionStorage.setItem('diicsa-olivia-visitor', visitorId); } catch {}
  let lead = {};
  const history = [];
  const seen = new Set();
  function add(role, text, id) {
    if (id && seen.has(id)) return;
    if (id) seen.add(id);
    const item = document.createElement('p');
    item.className = `olivia-message olivia-message--${role}`;
    item.textContent = text;
    log.append(item);
    log.scrollTop = log.scrollHeight;
  }
  add('assistant', 'Hola, soy Olivia IA. Te ayudo a conocer DIICSA Tu Casa, sus servicios y la demostración. ¿Qué necesitas para tu hogar?');
  function open(value) {
    panel.hidden = !value;
    toggle.setAttribute('aria-expanded', String(value));
    if (value) (accepted ? input : consent.querySelector('input')).focus();
    else toggle.focus();
  }
  toggle.addEventListener('click', () => open(panel.hidden));
  $('.olivia-close').addEventListener('click', () => open(false));
  root.addEventListener('keydown', event => { if (event.key === 'Escape') open(false); });
  async function request(path, options = {}) {
    const response = await fetch(`${base}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(identity ? { 'X-Olivia-Widget-Identity': identity } : {}) }, signal: AbortSignal.timeout(45000) });
    const data = await response.json();
    if (!response.ok) throw new Error(`Olivia: ${response.status}`);
    return data;
  }
  async function identify() {
    if (identity && Date.now() < expiresAt) return;
    const response = await fetch(`${base}/widget/identity`, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    if (!response.ok || data.clientCode !== clientCode || !data.identity) throw new Error('Identity unavailable');
    identity = data.identity;
    expiresAt = Date.now() + 50 * 60 * 1000;
  }
  const metadata = () => ({ lead, language: 'es', pageUrl: location.href, pageTitle: document.title, dataConsent: true, dataConsentAt: accepted, consentVersion: 'diicsatucasa-chat-2026-10-14' });
  function showLeadForm() {
    if ($('.olivia-lead')) return;
    const form = document.createElement('form');
    form.className = 'olivia-lead';
    form.innerHTML = `<strong>Datos para seguimiento</strong><p>Se guardan en la plataforma Olivia. No confirman una cita ni una notificación a DIICSA.</p>
      <label>Nombre<input name="firstName" autocomplete="given-name" maxlength="80" required></label>
      <label>Apellido<input name="lastName" autocomplete="family-name" maxlength="80" required></label>
      <label>Correo electrónico<input name="email" type="email" autocomplete="email" maxlength="150" required></label>
      <label>Teléfono<input name="phone" type="tel" autocomplete="tel" maxlength="30" required></label>
      <label>¿Qué necesitas?<textarea name="details" maxlength="1500" required></textarea></label>
      <button type="submit">Guardar mis datos</button><button type="button" class="olivia-lead-cancel">Ahora no</button><p role="status"></p>`;
    for (const [key,value] of Object.entries(lead)) {
      const field = form.elements.namedItem(key);
      if (field) field.value = value;
    }
    form.querySelector('.olivia-lead-cancel').addEventListener('click', () => form.remove());
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"]');
      button.disabled = true;
      const nextLead = Object.fromEntries(new FormData(form));
      try {
        await identify();
        const content = `Solicitud de seguimiento: ${nextLead.details}`;
        await request('/widget/conversations', { method: 'POST', body: JSON.stringify({ clientCode, visitorId, source: 'website', language: 'es', visitorName: `${nextLead.firstName} ${nextLead.lastName}`, email: nextLead.email, phone: nextLead.phone, content, metadata: { ...metadata(), lead: nextLead } }) });
        lead = nextLead;
        add('assistant', 'Tus datos se guardaron en Olivia para seguimiento. Esto no confirma una cita ni el envío de una notificación a DIICSA.');
        form.remove();
      } catch {
        form.querySelector('[role="status"]').textContent = 'No se guardaron tus datos. Intenta nuevamente.';
      } finally { button.disabled = false; }
    });
    log.append(form);
    log.scrollTop = log.scrollHeight;
  }
  async function poll() {
    if (!accepted || panel.hidden || busy) return;
    try {
      await identify();
      const data = await request(`/widget/conversations?${new URLSearchParams({ clientCode, visitorId })}`);
      for (const message of data.messages || []) {
        if (message.role === 'operator') add('assistant', message.content, message.id);
      }
    } catch { /* Sending remains available when polling is temporarily unavailable. */ }
  }
  consent.addEventListener('submit', async event => {
    event.preventDefault();
    const button = consent.querySelector('button');
    button.disabled = true;
    status.textContent = 'Conectando con Olivia…';
    try {
      await identify();
      accepted = new Date().toISOString();
      consent.hidden = true;
      compose.hidden = false;
      status.textContent = '';
      input.focus();
    } catch {
      status.textContent = 'No pudimos conectar con Olivia. Intenta nuevamente.';
    } finally { button.disabled = false; }
  });
  compose.addEventListener('submit', async event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || busy) return;
    busy = true;
    compose.querySelector('button').disabled = true;
    input.readOnly = true;
    status.textContent = 'Olivia está escribiendo…';
    try {
      await identify();
      add('user', message);
      input.value = '';
      let stored = null;
      try {
        stored = await request('/widget/conversations', { method: 'POST', body: JSON.stringify({ clientCode, visitorId, content: message, source: 'website', language: 'es', metadata: metadata() }) });
        storageReady = true;
      } catch { storageReady = false; }
      if (stored?.conversation?.status === 'manual') {
        status.textContent = 'Tu mensaje fue recibido. La conversación está en atención manual; la respuesta puede tardar.';
        return;
      }
      const data = await request('/olivia/chat', { method: 'POST', body: JSON.stringify({ clientCode, visitorId, message, language: 'es', metadata: metadata(), history: history.slice(-12) }) });
      if (!data.reply) throw new Error('Empty reply');
      add('assistant', data.reply);
      if (data.action === 'show_lead_form' || data.leadForm) showLeadForm();
      history.push({ role: 'user', content: message }, { role: 'assistant', content: data.reply });
      if (storageReady) {
        try { await request('/widget/conversations', { method: 'PATCH', body: JSON.stringify({ clientCode, visitorId, content: data.reply, metadata: { mode: data.mode } }) }); }
        catch { storageReady = false; }
      }
      status.textContent = storageReady ? '' : 'Respuesta recibida. El guardado para seguimiento no está disponible.';
    } catch {
      status.textContent = 'No pudimos obtener una respuesta. Intenta nuevamente.';
      input.value = message;
    } finally {
      busy = false;
      input.readOnly = false;
      compose.querySelector('button').disabled = false;
      if (!panel.hidden) input.focus();
    }
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); compose.requestSubmit(); }
  });
  setInterval(poll, 10000);
})();
