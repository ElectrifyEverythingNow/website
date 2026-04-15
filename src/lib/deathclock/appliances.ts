import type { ApplianceDefinition } from "./types";

export const APPLIANCES: ApplianceDefinition[] = [
  {
    id: "furnace",
    name: "Furnace",
    emoji: "🌡️",
    upgradeTo: "Heat Pump",
    minLifespan: 15,
    maxLifespan: 20,
  },
  {
    id: "central_ac",
    name: "Central AC",
    emoji: "❄️",
    upgradeTo: "Heat Pump",
    minLifespan: 15,
    maxLifespan: 20,
  },
  {
    id: "water_heater",
    name: "Water Heater",
    emoji: "🔥",
    upgradeTo: "Heat Pump Water Heater",
    minLifespan: 8,
    maxLifespan: 12,
  },
  {
    id: "dryer",
    name: "Clothes Dryer",
    emoji: "👕",
    upgradeTo: "Heat Pump Dryer",
    minLifespan: 10,
    maxLifespan: 13,
  },
  {
    id: "stove",
    name: "Stove / Range",
    emoji: "🍳",
    upgradeTo: "Induction Range",
    minLifespan: 13,
    maxLifespan: 15,
  },
];
