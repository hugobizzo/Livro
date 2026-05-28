const DEFAULT_USD_BRL = 5.2;
const TEXT_GENERATION_USD = 0.08;
const IMAGE_GENERATION_USD = 0.05;

export function estimateImageCount(pages: number) {
  return Math.max(0, pages) + 3;
}

export function estimateGenerationCostBrl(pages: number) {
  const usd = TEXT_GENERATION_USD + estimateImageCount(pages) * IMAGE_GENERATION_USD;
  return roundMoney(usd * DEFAULT_USD_BRL);
}

export function estimateTextGenerationCostBrl(inputTokens = 0, outputTokens = 0) {
  const inputUsd = (inputTokens / 1_000_000) * 1.25;
  const outputUsd = (outputTokens / 1_000_000) * 10;
  return roundMoney((inputUsd + outputUsd) * DEFAULT_USD_BRL);
}

export function estimateImageGenerationCostBrl(imageCount = 1) {
  return roundMoney(imageCount * IMAGE_GENERATION_USD * DEFAULT_USD_BRL);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
