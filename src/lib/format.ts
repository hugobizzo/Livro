export function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function number(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}
