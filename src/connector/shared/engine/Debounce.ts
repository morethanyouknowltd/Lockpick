export function debounce(fn, wait = 1) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.call(this, ...args), wait);
    }
  }

  export async function wait(ms) {
    return new Promise(res => setTimeout(res, ms))
  }