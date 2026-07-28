import { type User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

let currentUser: User | null = null;
const authChangeListeners: Array<(user: User | null) => void> = [];

export function getCurrentUser(): User | null { return currentUser; }

export function onAuthChange(cb: (user: User | null) => void) {
  authChangeListeners.push(cb);
}

function notifyAuthChange() {
  authChangeListeners.forEach(cb => cb(currentUser));
}

async function syncUser() {
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  currentUser = data.user ?? null;
  updateNavUserState();
  notifyAuthChange();
}

function updateNavUserState() {
  const signInBtn = document.getElementById('nav-sign-in');
  const userChip = document.getElementById('nav-user-chip');
  const userEmail = document.getElementById('nav-user-email');

  if (currentUser) {
    if (signInBtn) signInBtn.style.display = 'none';
    if (userChip) userChip.style.display = 'flex';
    if (userEmail) userEmail.textContent = currentUser.email ?? 'Signed In';
  } else {
    if (signInBtn) signInBtn.style.display = '';
    if (userChip) userChip.style.display = 'none';
  }
}

export function initAuth() {
  if (!supabase) {
    const signInBtn = document.getElementById('nav-sign-in');
    if (signInBtn) signInBtn.style.display = 'none';
    return;
  }

  syncUser();

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    updateNavUserState();
    closeAuthModal();
    notifyAuthChange();
  });

  document.getElementById('nav-sign-in')?.addEventListener('click', openAuthModal);
  document.getElementById('auth-modal-close')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAuthModal();
  });
  document.getElementById('nav-user-sign-out')?.addEventListener('click', async () => {
    await supabase!.auth.signOut();
  });

  document.getElementById('auth-tab-signin')?.addEventListener('click', () => setAuthTab('signin'));
  document.getElementById('auth-tab-signup')?.addEventListener('click', () => setAuthTab('signup'));

  document.getElementById('auth-submit')?.addEventListener('click', handleAuthSubmit);
  document.getElementById('auth-password')?.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') handleAuthSubmit();
  });
}

function setAuthTab(tab: 'signin' | 'signup') {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`auth-tab-${tab}`)?.classList.add('active');

  const submit = document.getElementById('auth-submit');
  if (submit) submit.textContent = tab === 'signin' ? 'Sign In' : 'Create Account';

  clearAuthError();
  (document.getElementById('auth-modal') as HTMLElement).dataset.mode = tab;
}

export function openAuthModal() {
  document.getElementById('auth-modal-overlay')?.classList.add('open');
  setAuthTab('signin');
  (document.getElementById('auth-email') as HTMLInputElement).value = '';
  (document.getElementById('auth-password') as HTMLInputElement).value = '';
}

function closeAuthModal() {
  document.getElementById('auth-modal-overlay')?.classList.remove('open');
}

function clearAuthError() {
  const el = document.getElementById('auth-error');
  if (el) { el.style.display = 'none'; el.textContent = ''; }
}

function showAuthError(msg: string) {
  const el = document.getElementById('auth-error');
  if (el) { el.style.display = 'block'; el.textContent = msg; }
}

async function handleAuthSubmit() {
  if (!supabase) return;
  const email = (document.getElementById('auth-email') as HTMLInputElement).value.trim();
  const password = (document.getElementById('auth-password') as HTMLInputElement).value;
  const mode = (document.getElementById('auth-modal') as HTMLElement).dataset.mode;
  const btn = document.getElementById('auth-submit') as HTMLButtonElement;

  clearAuthError();
  btn.disabled = true;
  btn.textContent = 'Please wait…';

  if (!email || !password) {
    showAuthError('Email and password are required.');
    btn.disabled = false;
    btn.textContent = mode === 'signup' ? 'Create Account' : 'Sign In';
    return;
  }

  if (mode === 'signup') {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) showAuthError(error.message);
    else showAuthError('Check your email to confirm your account.');
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) showAuthError(error.message);
  }

  btn.disabled = false;
  btn.textContent = mode === 'signup' ? 'Create Account' : 'Sign In';
}
