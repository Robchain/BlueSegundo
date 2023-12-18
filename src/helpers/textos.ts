export function formatearTexto(texto:string) {
  const partes = texto.split(' ');

  // Reemplazar el primer carácter del segundo grupo con 'A'
  const segundoGrupo = 'A' + texto.slice(13,18);

  // Formar la cadena final
  const resultado = `ID: ${partes[0]} - sitio: ${segundoGrupo}`;

  return resultado;
  }