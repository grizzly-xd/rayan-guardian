/** Small, safe helper for letting user download a JSON blob locally. */
export function downloadJson(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Free after a small delay to ensure the download started.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
