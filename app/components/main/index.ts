import { ComponentType, ReactNode } from "react";

export interface IRoute {
  slug: string;
  title?: string;
  icon?: ReactNode;
  bottom?: boolean;
  component?: ComponentType;
  children?: IRoute[];
  hidden?: boolean;
}
