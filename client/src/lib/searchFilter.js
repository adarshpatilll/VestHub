export const searchFilter = (funds = [], query = "") => {
   const filtered = funds.filter((fund) => {
      if (Object.keys(fund).includes("label")) {
         const name = fund.label.toLowerCase();
         const words = query.toLowerCase().split(" ");
         return words.every((word) => name.includes(word));
      } else {
         const name = fund.schemeName.toLowerCase();
         const words = query.toLowerCase().split(" ");
         return words.every((word) => name.includes(word));
      }
   });

   return filtered;
};
