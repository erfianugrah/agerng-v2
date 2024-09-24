import { weightedRandomChoice, fisherYatesShuffle } from './utils.js';
import { aomCivilizations, aomGods } from './civgods.js';

let currentAoMCiv = null;

function initializeAoMWeights(civ, god) {
  return {
    Classical: [0.5, 0.5],
    Heroic: [0.5, 0.5],
    Mythic: [0.5, 0.5],
  };
}

export function generateRandomAoMCiv() {
  const shuffledCivs = fisherYatesShuffle([...aomCivilizations]);
  const civ = shuffledCivs[0];
  const shuffledMajorGods = fisherYatesShuffle([...aomGods[civ].major]);
  const majorGod = shuffledMajorGods[0];
  currentAoMCiv = {
    name: civ,
    majorGod: majorGod,
    weights: initializeAoMWeights(civ, majorGod),
    minorGods: {},
  };
  return currentAoMCiv;
}

export function updateAoMWeight(age, index, value) {
  if (!currentAoMCiv) return null;

  const newWeights = { ...currentAoMCiv.weights };
  newWeights[age][index] = value;
  newWeights[age][1 - index] = 1 - value;
  currentAoMCiv.weights = newWeights;
  return newWeights;
}

export function finalizeAoMSelection(addToHistory = true) {
  if (!currentAoMCiv) return null;

  const minorGods = {};
  for (const age of ['Classical', 'Heroic', 'Mythic']) {
    const options = aomGods[currentAoMCiv.name].minor[currentAoMCiv.majorGod][age];
    minorGods[age] = weightedRandomChoice(options, currentAoMCiv.weights[age]);
  }

  const result = {
    game: 'AoM',
    civilization: currentAoMCiv.name,
    majorGod: currentAoMCiv.majorGod,
    minorGods,
  };

  currentAoMCiv = null;
  return result;
}

export function rerollAoMGods() {
  if (!currentAoMCiv) return null;

  const minorGods = {};
  for (const age of ['Classical', 'Heroic', 'Mythic']) {
    const options = aomGods[currentAoMCiv.name].minor[currentAoMCiv.majorGod][age];
    minorGods[age] = weightedRandomChoice(options, currentAoMCiv.weights[age]);
  }

  currentAoMCiv.minorGods = minorGods;
  return { ...currentAoMCiv };
}

export function resetAoMState() {
  currentAoMCiv = null;
}
