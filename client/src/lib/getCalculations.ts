export const getCalculations = (
	units: number,
	nav: number,
	invested: number
): { current: string; pnl: string; returns: string } => {
	const current = units && nav ? (units * nav).toFixed(2) : "";
	const pnl =
		invested && current ? (parseFloat(current) - invested).toFixed(2) : "";
	const returns =
		invested && pnl ? ((parseFloat(pnl) / invested) * 100).toFixed(2) : "";

	return { current, pnl, returns };
};
