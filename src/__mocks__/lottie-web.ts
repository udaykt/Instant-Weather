// Stub for lottie-web in the Vitest / HappyDOM test environment.
// HappyDOM's canvas returns null from getContext(), crashing lottie's init probe.

const noopAnim = {
  destroy: () => {},
  addEventListener: () => {},
};

const lottie = {
  loadAnimation: () => noopAnim,
};

export default lottie;
export const loadAnimation = () => noopAnim;
