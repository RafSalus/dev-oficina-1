import React from 'react'
import {
  SquaresFour,
  CalendarDots,
  ClipboardText,
  MagnifyingGlassPlus,
  CheckSquareOffset,
  Wrench,
  ShoppingCart,
  Package,
  WarningOctagon,
  Hammer,
  Users,
  ArrowsLeftRight,
  Coins,
} from '@phosphor-icons/react'
import { MECANICO_MENU_CATEGORIES } from '../../../constants/mecanicoMenus'
import { MobilePortalComingSoon } from '../../mobile/MobilePortalComingSoon'

const ICONS_MAP = {
  SquaresFour,
  CalendarDots,
  ClipboardText,
  MagnifyingGlassPlus,
  CheckSquareOffset,
  Wrench,
  ShoppingCart,
  Package,
  WarningOctagon,
  Hammer,
  Users,
  ArrowsLeftRight,
  Coins,
}

export function MobileMecanicoComingSoon() {
  return <MobilePortalComingSoon menuCategories={MECANICO_MENU_CATEGORIES} iconsMap={ICONS_MAP} />
}
