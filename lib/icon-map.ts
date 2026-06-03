'use client';

import { Braces, Code2, LayoutPanelTop, Palette, ShoppingBag, Workflow } from 'lucide-react';

export const iconMap: Record<string, typeof Workflow> = {
  workflow: Workflow,
  palette: Palette,
  layout: LayoutPanelTop,
  code: Code2,
  braces: Braces,
  shoppingBag: ShoppingBag,
};

export function getIcon(key: string) {
  return iconMap[key] ?? Workflow;
}
