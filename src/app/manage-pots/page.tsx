
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Pot } from '@/lib/types';
import { AlertCircle, Trash2, Edit } from 'lucide-react';
import { EditPotDialog } from '@/components/pots/EditPotDialog';
import { ConfirmDeleteDialog } from '@/components/pots/ConfirmDeleteDialog';

export default function ManagePotsPage() {
  const { pots, updatePots } = useApp();
  const { toast } = useToast();
  const [localPots, setLocalPots] = useState<Pot[]>([]);
  const [potToEdit, setPotToEdit] = useState<Pot | null>(null);
  const [potToDelete, setPotToDelete] = useState<Pot | null>(null);

  useEffect(() => {
    // Deep copy to avoid mutating global state directly
    setLocalPots(JSON.parse(JSON.stringify(pots)));
  }, [pots]);
  
  const totalPercentage = useMemo(() => {
    return localPots.reduce((sum, pot) => sum + Number(pot.percentage || 0), 0);
  }, [localPots]);

  const handlePercentageChange = (id: string, value: string) => {
    const newPercentage = parseInt(value, 10);
    if (isNaN(newPercentage) && value !== '') return;
    
    setLocalPots(prevPots =>
      prevPots.map(pot =>
        pot.id === id ? { ...pot, percentage: isNaN(newPercentage) ? 0 : newPercentage } : pot
      )
    );
  };

  const handleSaveChanges = () => {
    if (totalPercentage !== 100) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يجب أن يكون مجموع النسب 100% لحفظ التغييرات.',
      });
      return;
    }
    updatePots(localPots);
    toast({
      title: 'تم الحفظ',
      description: 'تم تحديث الموازين بنجاح.',
    });
  };

  const handlePotUpdate = (updatedPot: Pot) => {
    setLocalPots(prev => prev.map(p => p.id === updatedPot.id ? updatedPot : p));
    setPotToEdit(null);
  }

  const handlePotDelete = (potId: string) => {
    setLocalPots(prev => prev.filter(p => p.id !== potId));
    setPotToDelete(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إجمالي النسب: <span className={totalPercentage !== 100 ? 'text-destructive' : 'text-green-500'}>{totalPercentage}%</span></CardTitle>
          {totalPercentage !== 100 && (
            <CardDescription className="text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4"/>
              يجب أن يكون مجموع النسب 100% لحفظ التغييرات.
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {localPots.map(pot => (
          <Card key={pot.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`pot-${pot.id}`}>{pot.name}</Label>
                <div className="relative">
                  <Input
                    id={`pot-${pot.id}`}
                    type="number"
                    value={pot.percentage}
                    onChange={e => handlePercentageChange(pot.id, e.target.value)}
                    className="pr-8"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" onClick={() => setPotToEdit(pot)}>
                    <Edit className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => setPotToDelete(pot)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button className="w-full" onClick={handleSaveChanges} disabled={totalPercentage !== 100}>
        حفظ التغييرات
      </Button>

      {potToEdit && (
        <EditPotDialog
          pot={potToEdit}
          open={!!potToEdit}
          onOpenChange={() => setPotToEdit(null)}
          onSave={handlePotUpdate}
        />
      )}
      {potToDelete && (
         <ConfirmDeleteDialog
          pot={potToDelete}
          open={!!potToDelete}
          onOpenChange={() => setPotToDelete(null)}
          onConfirm={() => handlePotDelete(potToDelete.id)}
         />
      )}

    </div>
  );
}
