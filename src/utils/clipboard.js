export function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  alert("Output copied to clipboard!");
}
