import React from 'react'
import {
  SquaresFour,
  CarProfile,
  Wrench,
  Toolbox,
  Certificate,
  ClockCounterClockwise,
  GasPump,
  CalendarDots,
} from '@phosphor-icons/react'
import { CLIENTE_MENU_CATEGORIES } from '../../../constants/clienteMenus'
import { MobilePortalComingSoon } from '../../mobile/MobilePortalComingSoon'

const ICONS_MAP = {
  SquaresFour,
  CarProfile,
  Wrench,
  Toolbox,
  Certificate,
  ClockCounterClockwise,
  GasPump,
  CalendarDots,
}

export function MobileClienteComingSoon() {
  return (
    <MobilePortalComingSoon
      menuCategories={CLIENTE_MENU_CATEGORIES}
      iconsMap={ICONS_MAP}
      extraPathMatches={['/cliente', '/cliente/inicio']}
    />
  )
}
