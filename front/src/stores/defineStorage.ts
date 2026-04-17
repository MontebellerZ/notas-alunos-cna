const NEGATIVE_VALUES = ["false", "0", "null", "undefined"];

function defineStorage() {
  const useLocalStorage = import.meta.env.VITE_USE_LOCALSTORAGE;

  return useLocalStorage && !NEGATIVE_VALUES.includes(useLocalStorage)
    ? localStorage
    : sessionStorage;
}

export default defineStorage;
