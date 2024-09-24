export function weightedRandomChoice(options, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < options.length; i++) {
    if (random < weights[i]) {
      return options[i];
    }
    random -= weights[i];
  }
  return options[options.length - 1];
}

export function fisherYatesShuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function loadHistory() {
  if (typeof window !== 'undefined') {
    const savedHistory = localStorage.getItem('aoeRngHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  }
  return [];
}

export function addToHistory(result) {
  if (typeof window !== 'undefined') {
    const history = loadHistory();
    history.unshift(result);
    if (history.length > 100) {
      history.pop();
    }
    localStorage.setItem('aoeRngHistory', JSON.stringify(history));
  }
}

export function exportJSON() {
  if (typeof window !== 'undefined') {
    const history = loadHistory();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'aoe_rng_history.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}

export function exportCSV() {
  if (typeof window !== 'undefined') {
    const history = loadHistory();
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Game,Civilization,Major God,Minor Gods/Age Ups\n';

    history.forEach((item) => {
      let row = `${item.game},${item.civilization},${item.majorGod || ''},`;
      if (item.minorGods) {
        row += Object.entries(item.minorGods)
          .map(([age, god]) => `${age}: ${god}`)
          .join('; ');
      } else if (item.ageUps) {
        row += Object.entries(item.ageUps)
          .map(([age, choice]) => `Age ${age}: ${choice}`)
          .join('; ');
      }
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', encodedUri);
    downloadAnchorNode.setAttribute('download', 'aoe_rng_history.csv');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('astro:page-load', () => {
    const exportJSONBtn = document.getElementById('exportJSON');
    const exportCSVBtn = document.getElementById('exportCSV');

    if (exportJSONBtn) {
      exportJSONBtn.addEventListener('click', exportJSON);
    }

    if (exportCSVBtn) {
      exportCSVBtn.addEventListener('click', exportCSV);
    }
  });
}
