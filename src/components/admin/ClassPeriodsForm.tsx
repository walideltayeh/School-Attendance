
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { dataService } from "@/services/dataService";
import { PlusCircle, Save, Trash, Clock } from "lucide-react";

export function ClassPeriodsForm() {
  const [periods, setPeriods] = useState(() => {
    const existingPeriods = dataService.getPeriods();
    return existingPeriods.length > 0 
      ? existingPeriods 
      : [{ periodNumber: 1, startTime: "", endTime: "" }];
  });

  const handleAddPeriod = () => {
    const nextPeriodNumber = periods.length > 0 
      ? Math.max(...periods.map(p => p.periodNumber)) + 1 
      : 1;
      
    setPeriods([...periods, { 
      periodNumber: nextPeriodNumber, 
      startTime: "", 
      endTime: "" 
    }]);
  };

  const handleRemovePeriod = (index: number) => {
    if (periods.length > 1) {
      const newPeriods = [...periods];
      newPeriods.splice(index, 1);
      setPeriods(newPeriods);
    }
  };

  const updatePeriod = (index: number, field: "startTime" | "endTime", value: string) => {
    const newPeriods = [...periods];
    newPeriods[index][field] = value;
    setPeriods(newPeriods);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all periods have start and end times
    const isValid = periods.every(period => period.startTime && period.endTime);
    
    if (!isValid) {
      toast({
        title: "Error",
        description: "Please provide start and end times for all periods",
        variant: "destructive",
      });
      return;
    }
    
    // Save periods
    periods.forEach(period => {
      dataService.addOrUpdatePeriod(period);
    });
    
    toast({
      title: "Success",
      description: `${periods.length} class periods have been saved`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">Class Periods</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddPeriod}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Add Period
        </Button>
      </div>
      
      {periods.map((period, index) => (
        <div key={index} className="border p-3 rounded-md space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Clock className="h-4 w-4 text-primary" />
            <Label className="font-semibold">
              Period {period.periodNumber}
            </Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`startTime-${index}`}>Start Time</Label>
              <Input
                id={`startTime-${index}`}
                type="time"
                value={period.startTime}
                onChange={(e) => updatePeriod(index, "startTime", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`endTime-${index}`}>End Time</Label>
              <Input
                id={`endTime-${index}`}
                type="time"
                value={period.endTime}
                onChange={(e) => updatePeriod(index, "endTime", e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemovePeriod(index)}
              disabled={periods.length <= 1}
              className="text-destructive"
            >
              <Trash className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ))}
      
      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" /> Save Periods
      </Button>
    </form>
  );
}
