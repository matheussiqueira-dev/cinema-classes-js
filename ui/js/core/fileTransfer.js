export function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Nao foi possivel ler o arquivo.'));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        resolve(parsed);
      } catch (error) {
        reject(new Error('Arquivo JSON invalido.'));
      }
    };
    reader.readAsText(file);
  });
}
