import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEs from './locales/es/common.json';
import landingEs from './locales/es/landing.json';
import authEs from './locales/es/auth.json';
import dashboardEs from './locales/es/dashboard.json';
import usersEs from './locales/es/users.json';
import roomsEs from './locales/es/rooms.json';
import packagesEs from './locales/es/packages.json';
import paymentsEs from './locales/es/payments.json';
import bookingsEs from './locales/es/bookings.json';
import availabilityEs from './locales/es/availability.json';

import commonEn from './locales/en/common.json';
import landingEn from './locales/en/landing.json';
import authEn from './locales/en/auth.json';
import dashboardEn from './locales/en/dashboard.json';
import usersEn from './locales/en/users.json';
import roomsEn from './locales/en/rooms.json';
import packagesEn from './locales/en/packages.json';
import paymentsEn from './locales/en/payments.json';
import bookingsEn from './locales/en/bookings.json';
import availabilityEn from './locales/en/availability.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: commonEs,
        landing: landingEs,
        auth: authEs,
        dashboard: dashboardEs,
        users: usersEs,
        rooms: roomsEs,
        packages: packagesEs,
        payments: paymentsEs,
        bookings: bookingsEs,
        availability: availabilityEs,
      },
      en: {
        common: commonEn,
        landing: landingEn,
        auth: authEn,
        dashboard: dashboardEn,
        users: usersEn,
        rooms: roomsEn,
        packages: packagesEn,
        payments: paymentsEn,
        bookings: bookingsEn,
        availability: availabilityEn,
      },
    },
    fallbackLng: 'es',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
