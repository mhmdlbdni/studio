
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

export function ConfirmDeleteDialog({ open, onOpenChange, pot, onConfirm }: { open: boolean, onOpenChange: (open: boolean) => void, pot: Pot, onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ تأكيد الحذف</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من رغبتك في حذف وعاء "{pot.name}"؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.
            <br/><br/>
            <strong>تنبيه:</strong> بعد الحذف، يجب عليك إعادة توزيع نسبة هذا الوعاء على الأوعية المتبقية ليصل المجموع إلى 100%.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} asChild>
            <Button variant="destructive">نعم، قم بالحذف</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
