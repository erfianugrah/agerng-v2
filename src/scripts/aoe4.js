import { weightedRandomChoice, fisherYatesShuffle } from './utils.js';
import {
  aoe4Civilizations,
  aoe4AgeUpOptions,
  AOE4_CIVILIZATIONS,
  aoe4AyyubidBonuses,
} from './civgods.js';

let currentAoE4Civ = null;

function initializeAoE4Weights(civ) {
  if (civ === 'Abbasid Dynasty' || civ === 'Ayyubids') {
    return { wings: [0.25, 0.25, 0.25, 0.25] };
  } else {
    return Object.fromEntries(
      Object.entries(aoe4AgeUpOptions[civ]).map(([age, options]) => [
        age,
        Array.isArray(options) ? [0.5, 0.5] : null,
      ])
    );
  }
}

export function generateRandomAoE4Civ() {
  const shuffledCivs = fisherYatesShuffle([...aoe4Civilizations]);
  const civ = shuffledCivs[0];
  currentAoE4Civ = {
    name: civ,
    weights: initializeAoE4Weights(civ),
    ageUps: {},
  };
  return currentAoE4Civ;
}

export function updateAoE4Weight(key, index, value) {
  if (!currentAoE4Civ) return null;

  const newWeights = { ...currentAoE4Civ.weights };
  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    const totalWeight = newWeights.wings.reduce((sum, w, i) => (i !== index ? sum + w : sum), 0);
    newWeights.wings[index] = value;
    const scaleFactor = (1 - value) / totalWeight;
    newWeights.wings.forEach((w, i) => {
      if (i !== index) newWeights.wings[i] *= scaleFactor;
    });
  } else {
    newWeights[key][index] = value;
    newWeights[key][1 - index] = 1 - value;
  }

  currentAoE4Civ.weights = newWeights;
  return newWeights;
}

export function finalizeAoE4Selection(addToHistory = true) {
  if (!currentAoE4Civ) return null;

  let ageUps;
  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    ageUps = finalizeAbbasidAyyubidSelection();
  } else {
    ageUps = finalizeStandardSelection();
  }

  const result = {
    game: 'AoE IV',
    civilization: currentAoE4Civ.name,
    ageUps,
    civSlug: AOE4_CIVILIZATIONS[currentAoE4Civ.name],
  };
  currentAoE4Civ = null;
  return result;
}

function finalizeAbbasidAyyubidSelection() {
  const wings = [...aoe4AgeUpOptions[currentAoE4Civ.name]];
  const weights = [...currentAoE4Civ.weights.wings];
  const selectedWings = [];
  for (let i = 0; i < 3; i++) {
    const wing = weightedRandomChoice(wings, weights);
    selectedWings.push(wing);
    const index = wings.indexOf(wing);
    wings.splice(index, 1);
    weights.splice(index, 1);
  }

  if (currentAoE4Civ.name === 'Abbasid Dynasty') {
    return {
      II: selectedWings[0],
      III: selectedWings[1],
      IV: selectedWings[2],
    };
  } else {
    // Ayyubids
    return Object.fromEntries(
      ['II', 'III', 'IV'].map((age, index) => {
        const wing = selectedWings[index];
        const bonusTypes = Object.keys(aoe4AyyubidBonuses[wing]);
        const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        return [age, `${wing} - ${bonusType}: ${aoe4AyyubidBonuses[wing][bonusType][age]}`];
      })
    );
  }
}

function finalizeStandardSelection() {
  const ageUps = {};
  for (const [age, options] of Object.entries(aoe4AgeUpOptions[currentAoE4Civ.name])) {
    if (Array.isArray(options)) {
      ageUps[age] = weightedRandomChoice(options, currentAoE4Civ.weights[age]);
    }
  }
  return ageUps;
}

export function rerollAoE4Landmarks() {
  if (!currentAoE4Civ) return null;

  let ageUps;
  if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
    ageUps = finalizeAbbasidAyyubidSelection();
  } else {
    ageUps = finalizeStandardSelection();
  }

  currentAoE4Civ.ageUps = ageUps;
  return { ...currentAoE4Civ };
}

export function resetAoE4State() {
  currentAoE4Civ = null;
}
