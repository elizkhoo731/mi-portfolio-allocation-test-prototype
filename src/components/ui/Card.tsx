import type { HTMLAttributes, ReactNode } from "react";
import "@/components/ui/card.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Visually lift surface per MLDS shadow-sm */
  elevated?: boolean;
};

export function Card({ children, className = "", elevated = true, ...rest }: CardProps) {
  const cls = ["ml-card", elevated ? "ml-card--elevated" : "", className].filter(Boolean).join(" ");
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
