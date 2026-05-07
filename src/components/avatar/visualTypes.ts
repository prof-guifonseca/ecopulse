import type { ReactNode } from 'react';
import type { AvatarPose, GearFxLevel, GearHandPose, GearItem, GearSlot, GearTheme } from '@/types';
import type { AvatarPalette } from './palettes';

export interface GearVisualRenderProps {
  item: GearItem;
  palette: AvatarPalette;
  idPrefix: string;
  highlighted: boolean;
  pose: AvatarPose;
}

export interface GearVisualDefinition {
  key: string;
  slot: GearSlot;
  theme: GearTheme;
  render: (props: GearVisualRenderProps) => ReactNode;
  hidesHair?: boolean;
  hidesFace?: boolean;
  handPose?: GearHandPose;
  fxLevel?: GearFxLevel;
}

export type VisualMeta = {
  family: string;
  slot: GearSlot;
  variant: string;
};

export type SlotAnchor = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type EquipmentVisualStatus = 'signature' | 'variant' | 'legacy-polished' | 'fallback';
