import React from 'react'
import {
  SquaresFour,
  CalendarDots,
  ClipboardText,
  CreditCard,
  Users,
  CarProfile,
  Garage,
  ArrowsLeftRight,
  ShieldCheck,
  SealCheck,
  Wrench,
  WarningOctagon,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  GearSix,
  Globe,
  Money,
  Hammer,
  Cube,
} from '@phosphor-icons/react'
import { SECRETARIA_MENU_CATEGORIES } from '../../../constants/secretariaMenus'
import { MobilePortalComingSoon } from '../../mobile/MobilePortalComingSoon'

const ICONS_MAP = {
  SquaresFour,
  CalendarDots,
  ClipboardText,
  CreditCard,
  Users,
  CarProfile,
  Garage,
  ArrowsLeftRight,
  ShieldCheck,
  SealCheck,
  Wrench,
  WarningOctagon,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  GearSix,
  Globe,
  Money,
  Hammer,
  Cube,
}

export function MobileSecretariaComingSoon() {
  return <MobilePortalComingSoon menuCategories={SECRETARIA_MENU_CATEGORIES} iconsMap={ICONS_MAP} />
}
