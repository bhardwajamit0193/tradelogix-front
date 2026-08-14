import { atom } from 'nanostores';

const getInitialUser = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('tradelogix_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user state', e);
    }
  }
  return {
    isLoggedIn: true,
    id: 'usr_101',
    name: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };
};

export const userStore = atom(getInitialUser());

if (typeof window !== 'undefined') {
  userStore.subscribe((user) => {
    try {
      if (user) {
        localStorage.setItem('tradelogix_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('tradelogix_user');
      }
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  });
}

export const loginUser = (email, password, role = 'customer') => {
  const newUser = {
    isLoggedIn: true,
    id: 'usr_cust_' + Math.floor(Math.random() * 1000),
    name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    email,
    role,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };
  userStore.set(newUser);
  return newUser;
};

export const logoutUser = () => {
  userStore.set({
    isLoggedIn: false,
    id: null,
    name: 'Guest',
    email: '',
    role: 'guest',
    avatar: null,
  });
};
