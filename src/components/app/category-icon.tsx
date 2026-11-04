import {
  IconArrowDownLeft,
  IconBeach,
  IconBolt,
  IconBook,
  IconBriefcase,
  IconCar,
  IconDeviceLaptop,
  IconDeviceTv,
  IconDots,
  IconGift,
  IconHeart,
  IconHome,
  IconPaw,
  IconPercentage,
  IconPigMoney,
  IconPlane,
  IconSchool,
  IconShield,
  IconShirt,
  IconShoppingCart,
  IconTag,
  IconToolsKitchen2,
  IconTrendingUp,
  type Icon,
} from "@tabler/icons-react";
import clsx from "clsx";
import { IncomeCategory } from "@/lib/transactions";

/**
 * Icons offered for expense categories. The key is the Tabler icon name, stored in the API `icon`
 * field — the same keys as the mobile app (src/components/CategoryIcon.tsx there), so both show the same icon.
 */
export const CATEGORY_ICONS: Record<string, Icon> = {
  "shopping-cart": IconShoppingCart,
  "tools-kitchen-2": IconToolsKitchen2,
  car: IconCar,
  home: IconHome,
  heart: IconHeart,
  "device-tv": IconDeviceTv,
  book: IconBook,
  bolt: IconBolt,
  shirt: IconShirt,
  plane: IconPlane,
  paw: IconPaw,
  gift: IconGift,
  briefcase: IconBriefcase,
  dots: IconDots,
};

export const CATEGORY_ICON_LABELS: Record<string, string> = {
  "shopping-cart": "Carrinho",
  "tools-kitchen-2": "Talheres",
  car: "Carro",
  home: "Casa",
  heart: "Coração",
  "device-tv": "TV",
  book: "Livro",
  bolt: "Energia",
  shirt: "Roupa",
  plane: "Avião",
  paw: "Pet",
  gift: "Presente",
  briefcase: "Maleta",
  dots: "Outros",
};

/** Same color list as the mobile app (CATEGORY_COLORS), stored as hex in the API `color` field. */
export const CATEGORY_COLORS = ["#F58A3C", "#F8B26A", "#E8C14E", "#4E9E6B", "#5B8DEF", "#E06C8B", "#B0AFAF"];

export const CATEGORY_COLOR_LABELS: Record<string, string> = {
  "#F58A3C": "Laranja",
  "#F8B26A": "Pêssego",
  "#E8C14E": "Amarelo",
  "#4E9E6B": "Verde",
  "#5B8DEF": "Azul",
  "#E06C8B": "Rosa",
  "#B0AFAF": "Cinza",
};

/** Icons offered for savings goals (same keys as SAVINGS_GOAL_ICONS in the mobile app). */
export const SAVINGS_GOAL_ICONS: Record<string, Icon> = {
  plane: IconPlane,
  shield: IconShield,
  "device-laptop": IconDeviceLaptop,
  home: IconHome,
  gift: IconGift,
  car: IconCar,
  school: IconSchool,
  beach: IconBeach,
  heart: IconHeart,
  "pig-money": IconPigMoney,
};

export const SAVINGS_GOAL_ICON_LABELS: Record<string, string> = {
  plane: "Viagem",
  shield: "Reserva",
  "device-laptop": "Eletrônico",
  home: "Casa",
  gift: "Presente",
  car: "Carro",
  school: "Estudos",
  beach: "Férias",
  heart: "Saúde",
  "pig-money": "Cofrinho",
};

const ALL_ICONS: Record<string, Icon> = { ...CATEGORY_ICONS, ...SAVINGS_GOAL_ICONS };

const INCOME_ICONS: Record<IncomeCategory, Icon> = {
  [IncomeCategory.Salary]: IconBriefcase,
  [IncomeCategory.Freelance]: IconDeviceLaptop,
  [IncomeCategory.Investment]: IconTrendingUp,
  [IncomeCategory.Commission]: IconPercentage,
  [IncomeCategory.Gift]: IconGift,
  [IncomeCategory.Other]: IconArrowDownLeft,
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Values outside the convention (e.g. "amarelo") fall back to the brand color, like in the app. */
export function categoryColor(color: string | null | undefined) {
  return color && HEX_COLOR.test(color) ? color : "#F58A3C";
}

type Size = "sm" | "md" | "lg";
const BOX: Record<Size, string> = {
  sm: "size-10 rounded-xl",
  md: "size-14 rounded-2xl",
  lg: "size-16 rounded-2xl",
};
const ICON: Record<Size, string> = { sm: "1.25rem", md: "1.5rem", lg: "1.75rem" };

/** Category (or savings goal) icon on a soft tint of its color. Unknown icons use a tag. */
export function CategoryIcon({
  icon,
  color,
  size = "md",
}: {
  icon?: string | null;
  color?: string | null;
  size?: Size;
}) {
  const Glyph = (icon && ALL_ICONS[icon]) || IconTag;
  const tint = categoryColor(color);
  return (
    <span
      className={clsx("grid shrink-0 place-items-center", BOX[size])}
      style={{ background: `${tint}26`, color: tint }}
      aria-hidden
    >
      <Glyph size={ICON[size]} />
    </span>
  );
}

/** Fixed income categories always use the income green. */
export function IncomeIcon({ category, size = "md" }: { category: IncomeCategory | null; size?: Size }) {
  const Glyph = (category && INCOME_ICONS[category]) || IconArrowDownLeft;
  return (
    <span
      className={clsx("bg-income-soft text-income grid shrink-0 place-items-center", BOX[size])}
      aria-hidden
    >
      <Glyph size={ICON[size]} />
    </span>
  );
}

export function incomeIcon(category: IncomeCategory) {
  return INCOME_ICONS[category];
}
