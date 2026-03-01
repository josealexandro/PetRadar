/**
 * Script inline que roda antes da hidratação para evitar flash de tema errado.
 * Define a classe "dark" no <html> conforme localStorage (tema claro por padrão).
 */
export function ThemeScript() {
  const script = `
    (function() {
      var key = 'resgate-animais-theme';
      var stored = localStorage.getItem(key);
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
