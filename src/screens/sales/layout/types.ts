import type { ReactNode } from "react";

export type SalesLayoutSlots = {
  header?: ReactNode;
  product?: ReactNode;
  cart?: ReactNode;
  footer?: ReactNode;
};

export type SalesLayoutProps = {
  slots?: SalesLayoutSlots;
  className?: string;
};
