export const getCalculations = (
   units: string,
   nav: string,
   invested: string,
): { currentAmount: number; pnl: number; returns: number } => {
   const u = parseFloat(units) || 0;
   const n = parseFloat(nav) || 0;
   const i = parseFloat(invested) || 0;

   const currentAmount = u * n;
   const pnl = currentAmount - i;
   const returns = i > 0 ? (pnl / i) * 100 : 0;

   return {
      currentAmount: parseFloat(currentAmount.toFixed(2)),
      pnl: parseFloat(pnl.toFixed(2)),
      returns: parseFloat(returns.toFixed(2)),
   };
};
