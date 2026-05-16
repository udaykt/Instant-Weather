// Stub for html2canvas in the Vitest / HappyDOM test environment.
const html2canvas = async () => document.createElement('canvas');
export default html2canvas;
