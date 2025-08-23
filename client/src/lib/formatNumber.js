export const formatNumber = (num, mdf = 0) => {
   if (num == null || isNaN(Number(num))) return num;

   return new Intl.NumberFormat("en-IN", {
      useGrouping: true,
      maximumFractionDigits: 4,
      minimumFractionDigits: mdf,
   }).format(Number(num));
};
