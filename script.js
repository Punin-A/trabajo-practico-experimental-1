"use strict";

const form = document.querySelector("#guardianForm");
const successCard = document.querySelector("#successCard");
const formHeader = document.querySelector(".form-header");
const passwordToggle = document.querySelector(".password-toggle");
const passwordInput = document.querySelector("#password");
const passwordStrength = document.querySelector("#passwordHelp");
const errorToast = document.querySelector("#errorToast");
const resetButton = document.querySelector("#resetButton");

const fields = {
  fullName: {
    element: document.querySelector("#fullName"),
    validate(value) {
      const cleanValue = value.trim();
      if (!cleanValue) return "Ingresa tu nombre completo.";
      if (cleanValue.length < 3) return "El nombre debe tener al menos 3 caracteres.";
      if (!/^[a-záéíóúüñ' -]+$/i.test(cleanValue)) return "Usa únicamente letras, espacios, apóstrofes o guiones.";
      if (cleanValue.split(/\s+/).length < 2) return "Incluye al menos un nombre y un apellido.";
      return "";
    }
  },
  email: {
    element: document.querySelector("#email"),
    validate(value) {
      const cleanValue = value.trim();
      if (!cleanValue) return "Ingresa tu correo electrónico.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(cleanValue)) return "Escribe un correo válido, por ejemplo: nombre@correo.com.";
      return "";
    }
  },
  age: {
    element: document.querySelector("#age"),
    validate(value) {
      if (value === "") return "Ingresa tu edad.";
      const age = Number(value);
      if (!Number.isInteger(age)) return "La edad debe ser un número entero.";
      if (age < 18 || age > 90) return "La edad debe estar entre 18 y 90 años.";
      return "";
    }
  },
  phone: {
    element: document.querySelector("#phone"),
    validate(value) {
      const digits = value.replace(/\D/g, "");
      if (!digits) return "Ingresa un número de teléfono.";
      if (digits.length !== 10) return "El teléfono debe tener exactamente 10 dígitos.";
      if (!digits.startsWith("0")) return "El teléfono debe comenzar con 0.";
      return "";
    }
  },
  zone: {
    element: document.querySelector("#zone"),
    validate(value) {
      return value ? "" : "Selecciona dónde cuidarás el árbol.";
    }
  },
  password: {
    element: passwordInput,
    validate(value) {
      if (!value) return "Crea una contraseña.";
      if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
      if (!/[a-záéíóúüñ]/i.test(value) || !/\d/.test(value)) return "Combina al menos una letra y un número.";
      if (/\s/.test(value)) return "La contraseña no puede contener espacios.";
      return "";
    }
  }
};

function setFieldState(fieldConfig, showValidState = true) {
  const { element, validate } = fieldConfig;
  const container = element.closest(".field");
  const errorElement = document.querySelector(`#${element.id}Error`);
  const error = validate(element.value);

  container.classList.toggle("is-invalid", Boolean(error));
  container.classList.toggle("is-valid", !error && showValidState);
  element.setAttribute("aria-invalid", String(Boolean(error)));
  errorElement.textContent = error;

  return !error;
}

function validateConsent() {
  const consent = document.querySelector("#consent");
  const label = consent.closest(".consent");
  const errorElement = document.querySelector("#consentError");
  const isValid = consent.checked;

  label.classList.toggle("is-invalid", !isValid);
  consent.setAttribute("aria-invalid", String(!isValid));
  errorElement.textContent = isValid ? "" : "Debes aceptar para continuar.";
  return isValid;
}

function updatePasswordStrength() {
  const value = passwordInput.value;
  const hasLength = value.length >= 8;
  const hasLetter = /[a-záéíóúüñ]/i.test(value);
  const hasNumber = /\d/.test(value);
  const hasExtra = /[^a-záéíóúüñ\d\s]/i.test(value) || value.length >= 12;
  let level = 0;

  if (value) level = 1;
  if (hasLength && hasLetter && hasNumber) level = 2;
  if (hasLength && hasLetter && hasNumber && hasExtra) level = 3;

  passwordStrength.dataset.level = String(level);
  const messages = {
    0: "Usa una letra y un número",
    1: "Aún es demasiado corta",
    2: "Contraseña adecuada",
    3: "Contraseña fuerte"
  };
  passwordStrength.querySelector("small").textContent = messages[level];
}

function formatPhone(event) {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
  const parts = [];

  if (digits.length) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 10));

  event.target.value = parts.join(" ");
}

Object.values(fields).forEach((fieldConfig) => {
  const { element } = fieldConfig;

  element.addEventListener("blur", () => setFieldState(fieldConfig));
  element.addEventListener("input", () => {
    if (element.closest(".field").classList.contains("is-invalid")) {
      setFieldState(fieldConfig, false);
    }
  });

  if (element.tagName === "SELECT") {
    element.addEventListener("change", () => setFieldState(fieldConfig));
  }
});

fields.phone.element.addEventListener("input", formatPhone);
passwordInput.addEventListener("input", updatePasswordStrength);

document.querySelector("#consent").addEventListener("change", validateConsent);

passwordToggle.addEventListener("click", () => {
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  passwordToggle.setAttribute("aria-pressed", String(shouldShow));
  passwordToggle.setAttribute("aria-label", shouldShow ? "Ocultar contraseña" : "Mostrar contraseña");
  passwordInput.focus();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const results = Object.values(fields).map((fieldConfig) => setFieldState(fieldConfig));
  const isConsentValid = validateConsent();
  const isFormValid = results.every(Boolean) && isConsentValid;

  if (!isFormValid) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    errorToast.hidden = false;
    window.clearTimeout(errorToast.hideTimer);
    errorToast.hideTimer = window.setTimeout(() => {
      errorToast.hidden = true;
    }, 4000);
    return;
  }

  errorToast.hidden = true;
  document.querySelector("#successName").textContent = fields.fullName.element.value.trim().split(/\s+/)[0];
  form.hidden = true;
  formHeader.hidden = true;
  successCard.hidden = false;
  successCard.focus();
});

resetButton.addEventListener("click", () => {
  form.reset();
  Object.values(fields).forEach(({ element }) => {
    element.closest(".field").classList.remove("is-valid", "is-invalid");
    element.removeAttribute("aria-invalid");
    document.querySelector(`#${element.id}Error`).textContent = "";
  });
  document.querySelector(".consent").classList.remove("is-invalid");
  document.querySelector("#consentError").textContent = "";
  passwordInput.type = "password";
  passwordToggle.setAttribute("aria-pressed", "false");
  passwordToggle.setAttribute("aria-label", "Mostrar contraseña");
  updatePasswordStrength();

  successCard.hidden = true;
  formHeader.hidden = false;
  form.hidden = false;
  fields.fullName.element.focus();
});
