export function getCardBackground(brand: string) {
  const brandLower = brand.toLowerCase();

  switch (brandLower) {
    case "visa":
      return "bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-950 text-blue-900 dark:text-white";
    case "mastercard":
      return "bg-gradient-to-br from-orange-100 to-red-300 dark:from-orange-900 dark:to-red-950 text-red-900 dark:text-white";
    case "amex":
      return "bg-gradient-to-br from-cyan-100 to-blue-300 dark:from-cyan-900 dark:to-blue-950 text-blue-900 dark:text-white";
    case "discover":
      return "bg-gradient-to-br from-amber-100 to-orange-300 dark:from-amber-900 dark:to-orange-950 text-orange-900 dark:text-white";
    case "jcb":
      return "bg-gradient-to-br from-emerald-100 to-green-300 dark:from-emerald-900 dark:to-green-950 text-green-900 dark:text-white";
    default:
      return "bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-white";
  }
}

export const getCardIconPath = (brand: string): string => {
  switch (brand.toLowerCase()) {
    case "visa":
      return "/images/payment/visa.svg";
    case "mastercard":
      return "/images/payment/mastercard.svg";
    case "amex":
    case "american_express":
      return "/images/payment/american-express.svg";
    case "discover":
      return "/images/payment/discover.svg";
    case "diners":
    case "diners_club":
      return "/images/payment/diners.svg";
    case "jcb":
      return "/images/payment/jcb.svg";
    case "unionpay":
      return "/images/payment/unionpay.svg";
    default:
      return "/images/payment/generic-card.svg";
  }
};
