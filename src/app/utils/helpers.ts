export const generateWalletId = (): string => {
  return "W" + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const generateTransactionId = (): string => {
  return (
    "TXN" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
  );
};

// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export function calculateFee(
  amount: number,
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  feePercentage: number = 1.5
): number {
  return (amount * feePercentage) / 100;
}
