import { RACES } from "../data/races"

export function getRaceLabel(categorie) {

  const race = RACES.find(
    r => r.categorie === categorie
  )

  return race ? race.label : categorie

}