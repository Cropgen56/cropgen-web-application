import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "Sign Up": "Sign Up",
      Login: "Login",
      Email: "Email",
      Password: "Password",
      "First Name": "First Name",
      "Last Name": "Last Name",
      "Phone Number": "Phone Number",
      Submit: "Submit",
      "Enter your first name": "Enter your first name",
      "Enter your last name": "Enter your last name",
      "Enter your email": "Enter your email",
      "Enter your phone number": "Enter your phone number",
      "Enter your password": "Enter your password",
    },
  },
  hi: {
    translation: {
      "Sign Up": "साइन अप करें",
      Login: "लॉग इन करें",
      Email: "ईमेल",
      Password: "पासवर्ड",
      "First Name": "पहला नाम",
      "Last Name": "अंतिम नाम",
      "Phone Number": "फ़ोन नंबर",
      Submit: "जमा करें",
      "Enter your first name": "अपना पहला नाम दर्ज करें",
      "Enter your last name": "अपना अंतिम नाम दर्ज करें",
      "Enter your email": "अपना ईमेल दर्ज करें",
      "Enter your phone number": "अपना फ़ोन नंबर दर्ज करें",
      "Enter your password": "अपना पासवर्ड दर्ज करें",
    },
  },
  fr: {
    translation: {
      "Sign Up": "S'inscrire",
      Login: "Connexion",
      Email: "E-mail",
      Password: "Mot de passe",
      "First Name": "Prénom",
      "Last Name": "Nom de famille",
      "Phone Number": "Numéro de téléphone",
      Submit: "Soumettre",
      "Enter your first name": "Entrez votre prénom",
      "Enter your last name": "Entrez votre nom de famille",
      "Enter your email": "Entrez votre e-mail",
      "Enter your phone number": "Entrez votre numéro de téléphone",
      "Enter your password": "Entrez votre mot de passe",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
