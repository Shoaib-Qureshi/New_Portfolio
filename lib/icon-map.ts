'use client';

import { Braces, Code2, LayoutPanelTop, Palette, ShoppingBag, Workflow } from 'lucide-react';
import type { ProjectIconKey } from '@/lib/content-types';

export const iconMap = {
  workflow: Workflow,
  palette: Palette,
  layout: LayoutPanelTop,
  code: Code2,
  braces: Braces,
  shoppingBag: ShoppingBag,
} satisfies Record<ProjectIconKey, typeof Workflow>;

export function getIcon(key: ProjectIconKey) {
  return iconMap[key] ?? Workflow;
}
