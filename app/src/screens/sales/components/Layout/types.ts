import type { ReactNode } from "react";

export type SalesLayoutSlots = {
  header?: ReactNode;
  product?: ReactNode;
  cart?: ReactNode;
};

export type SalesLayoutProps = {
  slots?: SalesLayoutSlots;
  className?: string;
};
