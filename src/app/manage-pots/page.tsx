
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Pot } from '@/lib/types';
import { AlertCircle, Trash2, Edit, Plus, GripVertical } from 'lucide-react';
import { EditPotDialog } from '@/components/pots/EditPotDialog';
import { ConfirmDeleteDialog } from '@/components/pots/ConfirmDeleteDialog';
import { AddPotDialog } from '@/components/pots/AddPotDialog';
import { potIcons, PotIconKey } from '@/lib/icons';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  pot: Pot;
  language: any;
  handlePercentageChange: (id: string, value: string) => void;
  setPotToEdit: (pot: Pot) => void;
  setPotToDelete: (pot: Pot) => void;
}

function SortablePotItem({ pot, language, handlePercentageChange, setPotToEdit, setPotToDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: pot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  };

  const PotIcon = pot.icon;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`glass-effect rounded-[1.8rem] border-white/5 overflow-hidden transition-all duration-300 ${isDragging ? 'scale-105 shadow-2xl ring-2 ring-primary/50' : ''}`}
    >
      <CardContent className="p-4 flex items-center gap-4">
        {/* Drag Handle Area */}
        <div 
          {...attributes} 
          {...listeners} 
          className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors touch-none"
          title={language.key === 'ar' ? 'اضغط مطولاً للسحب' : 'Long press to drag'}
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {PotIcon && <PotIcon className="h-8 w-8 flex-shrink-0" style={{ color: pot.color }}/>}
        
        <div className="flex-1 space-y-1">
          <Label htmlFor={`pot-${pot.id}`} className="font-black text-sm truncate block max-w-[120px]">
            {pot.name[language.key]}
          </Label>
          <div className="relative">
            <Input
              id={`pot-${pot.id}`}
              type="number"
              value={pot.percentage}
              onChange={e => handlePercentageChange(pot.id, e.target.value)}
              className={language.dir === 'ltr' ? 'pl-8 h-10 rounded-xl bg-secondary/30' : 'pr-8 h-10 rounded-xl bg-secondary/30'}
            />
            <span className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xs ${language.dir === 'rtl' ? 'left-3' : 'right-3'}`}>%</span>
          </div>
        </div>

        <div className="flex gap-1">
           <Button variant="ghost" size="icon" onClick={() => setPotToEdit(pot)} className="h-10 w-10 rounded-xl">
              <Edit className="h-4 w-4" />
           </Button>
           { !['necessities', 'freedom', 'saving', 'education', 'play', 'giving'].includes(pot.id) && (
              <Button variant="ghost" size="icon" onClick={() => setPotToDelete(pot)} className="h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
              </Button>
           )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManagePotsPage() {
  const { pots, updatePots, language } = useApp();
  const { toast } = useToast();
  const [localPots, setLocalPots] = useState<Pot[]>([]);
  const [potToEdit, setPotToEdit] = useState<Pot | null>(null);
  const [potToDelete, setPotToDelete] = useState<Pot | null>(null);
  const [isAddPotDialogOpen, setAddPotDialogOpen] = useState(false);

  useEffect(() => {
    setLocalPots(pots.map(p => ({ ...p, name: { ...p.name } })));
  }, [pots]);
  
  const totalPercentage = useMemo(() => {
    return localPots.reduce((sum, pot) => sum + Number(pot.percentage || 0), 0);
  }, [localPots]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250, // Long press behavior
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handlePercentageChange = (id: string, value: string) => {
    const newPercentage = parseInt(value, 10);
    if (isNaN(newPercentage) && value !== '') return;
    
    setLocalPots(prevPots =>
      prevPots.map(pot =>
        pot.id === id ? { ...pot, percentage: isNaN(newPercentage) ? 0 : newPercentage } : pot
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalPots((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveChanges = () => {
    if (totalPercentage !== 100) {
      toast({
        variant: 'destructive',
        title: language.key === 'ar' ? 'خطأ' : 'Error',
        description: language.key === 'ar' ? 'يجب أن يكون مجموع النسب 100% لحفظ التغييرات.' : 'The sum of percentages must be 100% to save changes.',
      });
      return;
    }
    const potsToSave = localPots.map(({ icon, ...rest }) => rest);
    updatePots(potsToSave);
    toast({
      title: language.key === 'ar' ? 'تم الحفظ' : 'Saved',
      description: language.key === 'ar' ? 'تم تحديث الموازين والترتيب بنجاح.' : 'Pots and order have been updated successfully.',
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

  const handlePotAdd = (newPotData: { name: string; percentage: number; color: string; iconKey: string; }) => {
    const newPot: Pot = {
        id: `custom-${new Date().getTime()}`,
        name: {
            ar: newPotData.name,
            en: newPotData.name,
        },
        percentage: newPotData.percentage,
        color: newPotData.color,
        iconKey: newPotData.iconKey,
        icon: potIcons[newPotData.iconKey as PotIconKey] || potIcons.custom
    }
    setLocalPots(prev => [...prev, newPot]);
    setAddPotDialogOpen(false);
  }

  return (
    <div className="space-y-6 pb-20">
      <Card className="glass-effect rounded-[2rem] border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-black tracking-tight">
            {language.key === 'ar' ? 'إجمالي النسب' : 'Total Percentage'}: <span className={totalPercentage !== 100 ? 'text-destructive' : 'text-green-500 tabular-nums'}>{totalPercentage}%</span>
          </CardTitle>
          {totalPercentage !== 100 && (
            <CardDescription className="text-destructive flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4"/>
              {language.key === 'ar' ? 'يجب أن يكون مجموع النسب 100%.' : 'Total must be 100%.'}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-3">
          <SortableContext 
            items={localPots.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {localPots.map((pot) => (
              <SortablePotItem 
                key={pot.id} 
                pot={pot} 
                language={language}
                handlePercentageChange={handlePercentageChange}
                setPotToEdit={setPotToEdit}
                setPotToDelete={setPotToDelete}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <div className="grid grid-cols-1 gap-3">
        <Button variant="outline" className="h-14 rounded-2xl border-dashed border-primary/40 font-black" onClick={() => setAddPotDialogOpen(true)}>
          <Plus className={`h-5 w-5 ${language.dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
          {language.key === 'ar' ? 'إضافة وعاء مخصص' : 'Add Custom Pot'}
        </Button>

        <Button className="h-14 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all" onClick={handleSaveChanges} disabled={totalPercentage !== 100}>
          {language.key === 'ar' ? 'حفظ التغييرات والترتيب' : 'Save Changes & Order'}
        </Button>
      </div>

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

      {isAddPotDialogOpen && (
        <AddPotDialog
            open={isAddPotDialogOpen}
            onOpenChange={setAddPotDialogOpen}
            onSave={handlePotAdd}
        />
      )}
    </div>
  );
}
