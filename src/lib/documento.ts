// Validação de CPF e CNPJ (dígitos verificadores). O Asaas exige um documento válido para cobrar.

function cpfValido(c: string) {
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(c[i]) * (t + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(c[t])) return false;
  }
  return true;
}

function cnpjValido(c: string) {
  if (c.length !== 14 || /^(\d)\1+$/.test(c)) return false;
  const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (const t of [12, 13]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(c[i]) * pesos[i + (13 - t)];
    const dv = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (dv !== Number(c[t])) return false;
  }
  return true;
}

export function documentoValido(valor: string) {
  const d = valor.replace(/\D/g, "");
  return d.length === 11 ? cpfValido(d) : cnpjValido(d);
}
