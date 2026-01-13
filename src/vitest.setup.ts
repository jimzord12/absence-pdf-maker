import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import './i18n/config';
import i18n from './i18n/config';
import { useLocaleStore } from './features/leave-request/state/locale.store';

beforeEach(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  i18n.changeLanguage('en');
  useLocaleStore.setState({ locale: 'en' });
});
