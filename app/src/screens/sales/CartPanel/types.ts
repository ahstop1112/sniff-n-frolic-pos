import { Currency } from "@/app/types";

export type CartPanelProps = {
  currency?: Currency;
  onPay?: (orderId: string) => void;
};