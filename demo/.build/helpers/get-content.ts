/* AUTO-GENERATED — Do not edit! */
import getContent from '@julian_cataldo/content-components/src/client/fetch-content';

import type { Dessert } from '../types/Dessert';
import type { Boat } from '../types/Boat';

type DessertEntryNames = 'cherry' | 'banana';
type Desserts = {
  [key in DessertEntryNames]: Dessert;
};
type BoatEntryNames = 'theSmallRedOne' | 'theShinyOne' | 'theHugeYellowOne';
type Boats = {
  [key in BoatEntryNames]: Boat;
};

export async function getDesserts() {
  const desserts = await getContent('desserts');
  if (Object.keys(desserts).length) {
    return desserts as unknown as Desserts;
  }
  return false;
}
export async function getDessertsArray() {
  const desserts = await getContent('desserts');
  if (Object.keys(desserts).length) {
    const entries = Object.entries(desserts).map(
      ([key, val]: [key: string, val: unknown]) => {
        return { _key: key, ...(val as Desserts) };
      },
    );
    return entries as Desserts[];
  }
  return false;
}

export async function getBoats() {
  const boats = await getContent('boats');
  if (Object.keys(boats).length) {
    return boats as unknown as Boats;
  }
  return false;
}
export async function getBoatsArray() {
  const boats = await getContent('boats');
  if (Object.keys(boats).length) {
    const entries = Object.entries(boats).map(
      ([key, val]: [key: string, val: unknown]) => {
        return { _key: key, ...(val as Boats) };
      },
    );
    return entries as Boats[];
  }
  return false;
}
