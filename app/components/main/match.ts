import { ComponentType } from "react";
import { IRoute } from ".";
export function match(routes: IRoute[], slug: string[]): [IRoute?, IRoute?] {
  if (slug.length < 1) {
    return [];
  }

  for (const route of routes) {
    if (route.slug === slug[0]) {
      if (route.component) {
        return [route];
      } else
        for (const child of route.children || []) {
          if (child.slug === "index") {
            if (slug.length === 1) {
              return [child];
            } else
              for (const sub of child.children || []) {
                if (sub.slug === slug[1]) {
                  return [child, sub];
                }
              }
          }
          if (slug.length > 1 && child.slug === slug[1]) {
            if (slug.length === 2) {
              return [child];
            } else
              for (const sub of child.children || []) {
                if (sub.slug === slug[2]) {
                  return [child, sub];
                }
              }
          }
        }
    }
  }
  return [];
}

export function makeTitle(a?: IRoute, b?: IRoute) {
  if (a && b && a.title && b.title) {
    return `${a.title} - ${b.title}`;
  } else if (a && a.title) {
    return a.title;
  } else if (b && b.title) {
    return b.title;
  } else {
    return "";
  }
}
