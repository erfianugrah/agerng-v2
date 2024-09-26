import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { generateRandomAoE4Civ, finalizeAoE4Selection, updateAoE4Weight, rerollAoE4Landmarks } from '../scripts/aoe4';
import { generateRandomAoMCiv, finalizeAoMSelection, updateAoMWeight, rerollAoMGods } from '../scripts/aom';
import { addToHistory, loadHistory, exportJSON, exportCSV } from '../scripts/utils';
import { aoe4AgeUpOptions, aomGods, AOE4_CIVILIZATIONS, aoe4AyyubidBonuses } from '../scripts/civgods';

interface AoE4Civ {
  name: string;
  weights: {
    [key: string]: number[] | { wings: number[] };
  };
  ageUps?: {
    [key: string]: string;
  };
}

interface AoMCiv {
  name: string;
  majorGod: string;
  weights: {
    [key: string]: number[];
  };
  minorGods?: {
    [key: string]: string;
  };
}

interface HistoryEntry {
  game: string;
  civilization: string;
  majorGod?: string;
  ageUps?: { [key: string]: string };
  minorGods?: { [key: string]: string };
  civSlug?: string;
}

export default function AgeGenerator() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentAoE4Civ, setCurrentAoE4Civ] = useState<AoE4Civ | null>(null);
  const [currentAoMCiv, setCurrentAoMCiv] = useState<AoMCiv | null>(null);

  useEffect(() => {
    const savedHistory = loadHistory();
    setHistory(savedHistory);
  }, []);

  const generateAoE4 = () => {
    const result = generateRandomAoE4Civ();
    setCurrentAoE4Civ(result);
  };

  const generateAoM = () => {
    const result = generateRandomAoMCiv();
    setCurrentAoMCiv(result);
  };

  const finalizeAoE4 = () => {
    const result = finalizeAoE4Selection(true);
    if (result) {
      addToHistory(result);
      setHistory(prevHistory => [result, ...prevHistory]);
      setCurrentAoE4Civ(null);
    }
  };

  const finalizeAoM = () => {
    const result = finalizeAoMSelection(true);
    if (result) {
      const finalResult = {
        ...result,
        civilization: result.civilization.split(' - ')[0]
      };
      addToHistory(finalResult);
      setHistory(prevHistory => [finalResult, ...prevHistory]);
      setCurrentAoMCiv(null);
    }
  };

  const handleAoE4WeightChange = (age: string, index: number, newValue: number) => {
    if (!currentAoE4Civ) return;

    if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
      const updatedWeights = updateAoE4Weight('wings', index, newValue / 100);
      setCurrentAoE4Civ(prev => prev ? { ...prev, weights: updatedWeights } : null);
    } else {
      const updatedWeights = updateAoE4Weight(age, index, newValue / 100);
      setCurrentAoE4Civ(prev => prev ? { ...prev, weights: updatedWeights } : null);
    }
  };

  const handleAoMWeightChange = (age: string, index: number, newValue: number) => {
    if (!currentAoMCiv) return;

    const updatedWeights = updateAoMWeight(age, index, newValue / 100);
    setCurrentAoMCiv(prev => prev ? { ...prev, weights: updatedWeights } : null);
  };

  const handleRerollAoE4Landmarks = () => {
    const result = rerollAoE4Landmarks();
    if (result) {
      setCurrentAoE4Civ(prevState => prevState ? {
        ...prevState,
        ageUps: result.ageUps
      } : null);
    }
  };

  const handleRerollAoMGods = () => {
    const result = rerollAoMGods();
    if (result) {
      setCurrentAoMCiv(prevState => prevState ? {
        ...prevState,
        minorGods: result.minorGods
      } : null);
    }
  };

  const renderAoE4Weights = () => {
    if (!currentAoE4Civ || !currentAoE4Civ.weights || !currentAoE4Civ.name) return null;

    if (currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids') {
      const wings = currentAoE4Civ.weights.wings as number[];
      return (
        <div className="mb-6">
          <h4 className="text-2xl font-semibold mb-3 font-serif">Wings</h4>
          {aoe4AgeUpOptions[currentAoE4Civ.name].map((wing, index) => (
            <div key={index} className="flex items-center mb-3">
              <span className="w-1/3 text-lg">{wing}</span>
              <Slider
                value={[wings[index] * 100]}
                onValueChange={(newValue) => handleAoE4WeightChange('wings', index, newValue[0])}
                max={100}
                step={1}
                className="flex-grow mx-4"
              />
              <span className="w-16 text-right text-lg">{(wings[index] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      );
    }

    return Object.entries(currentAoE4Civ.weights as { [key: string]: number[] }).map(([age, options]) => {
      if (!Array.isArray(options) || !aoe4AgeUpOptions[currentAoE4Civ.name] || !aoe4AgeUpOptions[currentAoE4Civ.name][age]) {
        return null;
      }

      return (
        <div key={age} className="mb-6">
          <h4 className="text-2xl font-semibold mb-3 font-serif">Age {age}</h4>
          {options.map((option, index) => {
            const landmark = aoe4AgeUpOptions[currentAoE4Civ.name][age][index];
            if (!landmark) return null;
            return (
              <div key={index} className="flex items-center mb-3">
                <span className="w-1/3 text-lg">{landmark}</span>
                <Slider
                  value={[option * 100]}
                  onValueChange={(newValue) => handleAoE4WeightChange(age, index, newValue[0])}
                  max={100}
                  step={1}
                  className="flex-grow mx-4"
                />
                <span className="w-16 text-right text-lg">{(option * 100).toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      );
    });
  };

  const renderAoMWeights = () => {
    if (!currentAoMCiv || !currentAoMCiv.weights) return null;

    return Object.entries(currentAoMCiv.weights).map(([age, gods]) => (
      <div key={age} className="mb-6">
        <h4 className="text-2xl font-semibold mb-3 font-serif">{age} Age</h4>
        {gods.map((weight, index) => {
          const god = aomGods[currentAoMCiv.name]?.minor[currentAoMCiv.majorGod]?.[age]?.[index] || 'Unknown';
          return (
            <div key={index} className="flex items-center mb-3">
              <span className="w-1/3 text-lg">{god}</span>
              <Slider
                value={[weight * 100]}
                onValueChange={(newValue) => handleAoMWeightChange(age, index, newValue[0])}
                max={100}
                step={1}
                className="flex-grow mx-4"
              />
              <span className="w-16 text-right text-lg">{(weight * 100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    ));
  };

  const renderHistoryEntry = (entry: HistoryEntry) => {
    if (!entry || typeof entry !== 'object') {
      return null;
    }

    const isAoE4 = entry.game === "AoE IV";
    const title = entry.civilization;
    
    return (
      <Dialog key={entry.civilization + (entry.majorGod || '')}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full text-left justify-between text-lg">
            {title}
            <span className="text-muted-foreground">{isAoE4 ? 'AoE IV' : 'AoM'}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl">{title}</DialogTitle>
            <DialogDescription asChild>
              <div className="mt-4 text-lg">
                {isAoE4 ? (
                  <>
                    <div className="mb-4">
                      <a href={`https://aoe4world.com/explorer/civs/${entry.civSlug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View civilization on AoE4 World
                      </a>
                    </div>
                    {entry.ageUps && Object.entries(entry.ageUps).length > 0 ? (
                      Object.entries(entry.ageUps).map(([age, choice]) => (
                        <div key={age} className="mb-3 flex justify-between items-center">
                          <span className="font-semibold font-serif">Age {age}:</span>
                          <a 
                            href={`https://aoe4world.com/explorer/civs/${entry.civSlug}/buildings/${choice.toLowerCase().replace(/\s+/g, '-')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            {choice || 'Unknown'}
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="mb-3">No age-up choices available</div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex justify-between items-center">
                      <span className="font-semibold font-serif">Major God:</span>
                      <span>{entry.majorGod || 'Unknown'}</span>
                    </div>
                    {entry.minorGods && Object.entries(entry.minorGods).length > 0 ? (
                      Object.entries(entry.minorGods).map(([age, god]) => (
                        <div key={age} className="mb-3 flex justify-between items-center">
                          <span className="font-semibold font-serif">{age} Age:</span>
                          <span>{god || 'Unknown'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="mb-3">No minor gods available</div>
                    )}
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button className="mt-4 text-lg">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="aoe4" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="aoe4" className="text-xl font-serif">Age of Empires IV</TabsTrigger>
          <TabsTrigger value="aom" className="text-xl font-serif">Age of Mythology</TabsTrigger>
        </TabsList>
        <TabsContent value="aoe4">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-serif">Age of Empires IV</CardTitle>
            </CardHeader>
            <CardContent className="text-lg">
              {currentAoE4Civ ? (
                <div>
                  <h3 className="text-2xl font-semibold mb-4 font-serif">Selected Civilization: {currentAoE4Civ.name}</h3>
                  {renderAoE4Weights()}
                  {currentAoE4Civ.ageUps && (
                    <div className="mt-4">
                      <h4 className="text-2xl font-semibold mb-3 font-serif">Selected {currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids' ? 'Wings' : 'Landmarks'}:</h4>
                      {Object.entries(currentAoE4Civ.ageUps).map(([age, choice]) => (
                        <div key={age} className="mb-2">
                          <span className="font-semibold">Age {age}:</span> {choice}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>Roll a random civilization for AoE IV.</div>
              )}
            </CardContent>
            <CardFooter>
              {currentAoE4Civ ? (
                <>
                  <Button onClick={finalizeAoE4} className="mr-2 text-lg">Finalize Selection</Button>
                  <Button onClick={handleRerollAoE4Landmarks} className="text-lg">
{currentAoE4Civ.name === 'Abbasid Dynasty' || currentAoE4Civ.name === 'Ayyubids' ? 'Roll Wings' : 'Roll Landmarks'}
                  </Button>
                </>
              ) : (
                <Button onClick={generateAoE4} className="text-lg">Roll</Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="aom">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-serif">Age of Mythology</CardTitle>
            </CardHeader>
            <CardContent className="text-lg">
              {currentAoMCiv ? (
                <div>
                  <h3 className="text-2xl font-semibold mb-4 font-serif">Selected Civilization: {currentAoMCiv.name}</h3>
                  <h4 className="text-xl font-medium mb-3 font-serif">Major God: {currentAoMCiv.majorGod}</h4>
                  {renderAoMWeights()}
                  {currentAoMCiv.minorGods && (
                    <div className="mt-4">
                      <h4 className="text-2xl font-semibold mb-3 font-serif">Selected Minor Gods:</h4>
                      {Object.entries(currentAoMCiv.minorGods).map(([age, god]) => (
                        <div key={age} className="mb-2">
                          <span className="font-semibold">{age} Age:</span> {god}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>Roll a random major god for AoM.</div>
              )}
            </CardContent>
            <CardFooter>
              {currentAoMCiv ? (
                <>
                  <Button onClick={finalizeAoM} className="mr-2 text-lg">Finalize Selection</Button>
                  <Button onClick={handleRerollAoMGods} className="text-lg">Roll Gods</Button>
                </>
              ) : (
                <Button onClick={generateAoM} className="text-lg">Roll</Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-3xl font-serif">History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {history.map((entry) => renderHistoryEntry(entry))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button onClick={exportJSON} className="mr-2 text-lg">Export JSON</Button>
          <Button onClick={exportCSV} className="text-lg">Export CSV</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
