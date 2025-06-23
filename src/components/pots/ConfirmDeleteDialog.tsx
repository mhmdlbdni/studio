
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { Pot } from '@/lib/types';
import { useApp } from '@/contexts/AppContext';

export function ConfirmDeleteDialog({ open, onOpenChange, pot, onConfirm }: { open: boolean, onOpenChange: (open: boolean) => void, pot: Pot, onConfirm: () => void }) {
  const { language } = useApp();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion'}</AlertDialogTitle>
          <AlertDialogDescription>
            {language === 'ar' ? `هل أنت متأكد من رغبتك في حذف وعاء "${pot.name.ar}"؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.` : `Are you sure you want to delete the pot "${pot.name.en}"? This action is final and cannot be undone.`}
            <br/><br/>
            <strong>{language === 'ar' ? 'تنبيه:' : 'Note:'}</strong> {language === 'ar' ? 'بعد الحذف، يجب عليك إعادة توزيع نسبة هذا الوعاء على الأوعية المتبقية ليصل المجموع إلى 100%.' : "After deletion, you must redistribute this pot's percentage among the remaining pots to reach a total of 100%."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} asChild>
            <Button variant="destructive">{language === 'ar' ? 'نعم، قم بالحذف' : 'Yes, delete'}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
