
'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subDays, startOfWeek, startOfMonth, isWithinInterval, format } from 'date-fns';
import { TrendingUp, TrendingDown, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { amiriFont } from '@/lib/amiri-font';


type FilterType = 'day' | 'week' | 'month' | 'all';

export default function TransactionsPage() {
  const { transactions, user, language, pots } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const currency = user?.currency || 'YER';

  const potMap = useMemo(() => {
    const map = new Map<string, {name: {ar: string, en: string}}>();
    pots.forEach(pot => map.set(pot.id, {name: pot.name}));
    return map;
  }, [pots]);

  const {filteredTransactions, dateRange} = useMemo(() => {
    const now = new Date();
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let interval: Interval | null = null;
    let range = {start: new Date(), end: new Date()};
    
    switch (filter) {
      case 'day':
        range = { start: subDays(now, 1), end: now };
        break;
      case 'week':
        range = { start: startOfWeek(now), end: now };
        break;
      case 'month':
        range = { start: startOfMonth(now), end: now };
        break;
      case 'all':
      default:
        const firstTransactionDate = sortedTransactions.length > 0 ? new Date(sortedTransactions[sortedTransactions.length-1].date) : now;
        return { 
          filteredTransactions: sortedTransactions,
          dateRange: { start: firstTransactionDate, end: now }
        };
    }

    return {
      filteredTransactions: sortedTransactions.filter(t => isWithinInterval(new Date(t.date), range as Interval)),
      dateRange: range
    }
  }, [transactions, filter]);
  
  const { totalIncome, totalExpenses } = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpenses += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    );
  }, [filteredTransactions]);

  const t = language.translations.transactionsPage;
  const dateLocale = 'en-US';
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const netBalance = totalIncome - totalExpenses;

    if (language.key === 'ar') {
        doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
        doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
        doc.setFont('Amiri');
        doc.setR2L(true);

        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

        // -- Header --
        doc.setFontSize(20);
        doc.text('الموازين', pageWidth - 14, 22, { align: 'right' });
        doc.setFontSize(10);
        doc.text(`اسم صاحب الحساب: ${user?.name || ''}`, pageWidth - 14, 30, { align: 'right' });
        
        const periodText = `الفترة: ${format(dateRange.start, 'yyyy/MM/dd')} - ${format(dateRange.end, 'yyyy/MM/dd')}`;
        doc.text(periodText, 14, 22);

        // -- Table --
        const tableHeaders = [['المبلغ', 'الوعاء', 'الوصف', 'التاريخ']];
        const tableRows = filteredTransactions.map(transaction => {
            const isExpense = transaction.type === 'expense';
            const potName = isExpense && transaction.potId ? (potMap.get(transaction.potId)?.name['ar'] || 'غير محدد') : '—';
            const amount = `${isExpense ? '-' : '+'} ${new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(transaction.amount)}`;
            return [
                { content: amount, styles: { textColor: isExpense ? '#dc3545' : '#28a745' } },
                potName,
                transaction.description,
                new Date(transaction.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
            ];
        });

        autoTable(doc, {
            head: tableHeaders,
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { font: 'Amiri', halign: 'right', cellPadding: 2 },
            headStyles: {
                fillColor: '#47abff',
                textColor: '#ffffff',
                fontStyle: 'bold',
            },
            foot: [
              [{ content: new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome), styles: { textColor: '#28a745' } }, { content: 'إجمالي الدخل', colSpan: 3, styles: { fontStyle: 'bold' } }],
              [{ content: `- ${new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}`, styles: { textColor: '#dc3545' } }, { content: 'إجمالي المصروفات', colSpan: 3, styles: { fontStyle: 'bold' } }],
              [{ content: new Intl.NumberFormat('ar-EG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance), styles: { textColor: '#47abff' } }, { content: 'صافي الرصيد', colSpan: 3, styles: { fontStyle: 'bold', fillColor: [232, 244, 255] } }],
            ],
            footStyles: { fontStyle: 'bold' }
        });

    } else { // English PDF Logic
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor('#47abff');
        doc.text('Al-Mawazin', 14, 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#6c757d');
        doc.text('Transaction Report', 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-US')}`, pageWidth - 14, 22, { align: 'right' });
        doc.text(`Account Holder: ${user?.name || ''}`, pageWidth - 14, 30, { align: 'right' });


        const tableHeaders = [['Date', 'Description', 'Pot', 'Amount']];
        const tableRows = filteredTransactions.map(transaction => {
            const isExpense = transaction.type === 'expense';
            const potName = isExpense && transaction.potId ? (potMap.get(transaction.potId)?.name['en'] || 'N/A') : '—';
            const amount = `${isExpense ? '-' : '+'} ${new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(transaction.amount)}`;
            return [
                new Date(transaction.date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' }),
                transaction.description,
                potName,
                { content: amount, styles: { textColor: isExpense ? '#dc3545' : '#28a745', halign: 'right' } }
            ];
        });

        autoTable(doc, {
            head: tableHeaders,
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: {
                fillColor: '#47abff',
                textColor: '#ffffff',
                fontStyle: 'bold',
            },
            foot: [
              [{ content: 'Total Income', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome), styles: { halign: 'right', textColor: '#28a745', fontStyle: 'bold' } }],
              [{ content: 'Total Expenses', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `- ${new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}`, styles: { halign: 'right', textColor: '#dc3545', fontStyle: 'bold' } }],
              [{ content: 'Net Balance', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [232, 244, 255] } }, { content: new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance), styles: { halign: 'right', textColor: '#47abff', fontStyle: 'bold', fillColor: [232, 244, 255] } }],
            ],
            footStyles: { fontStyle: 'bold' }
        });
    }

    doc.save('Mawazin_Report.pdf');
  };

  const handleDownloadXLSX = () => {
    const isArabic = language.key === 'ar';
    const netBalance = totalIncome - totalExpenses;

    const data = filteredTransactions.map(t => {
      const isExpense = t.type === 'expense';
      const potName = isExpense && t.potId ? potMap.get(t.potId)?.name[language.key] : '—';
      const formattedDate = new Date(t.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-CA');
      
      if (isArabic) {
        return {
          'التاريخ': formattedDate,
          'الوصف': t.description,
          'اسم الوعاء': potName,
          'المبلغ': isExpense ? -t.amount : t.amount,
        };
      }
      return {
        'Date': formattedDate,
        'Description': t.description,
        'Pot Name': potName,
        'Amount': isExpense ? -t.amount : t.amount,
      };
    });

    const summaryRows = isArabic
      ? [
          {}, // Spacer row
          { 'الوصف': 'إجمالي الدخل', 'المبلغ': totalIncome },
          { 'الوصف': 'إجمالي المصروفات', 'المبلغ': -totalExpenses },
          { 'الوصف': 'صافي الرصيد', 'المبلغ': netBalance },
        ]
      : [
          {}, // Spacer row
          { 'Description': 'Total Income', 'Amount': totalIncome },
          { 'Description': 'Total Expenses', 'Amount': -totalExpenses },
          { 'Description': 'Net Balance', 'Amount': netBalance },
        ];
    
    const finalData = [...data, ...summaryRows];

    const worksheet = XLSX.utils.json_to_sheet(finalData);

    if (isArabic) {
      worksheet['!RTL'] = true;
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t.title);
    XLSX.writeFile(workbook, 'Mawazin_Report.xlsx');
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <FileDown className="h-4 w-4" />
                  <span className="sr-only">{t.download}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadPDF}>{t.downloadPdf}</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadXLSX}>{t.downloadExcel}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t.all}</TabsTrigger>
              <TabsTrigger value="month">{t.monthly}</TabsTrigger>
              <TabsTrigger value="week">{t.weekly}</TabsTrigger>
              <TabsTrigger value="day">{t.daily}</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.table.description}</TableHead>
                  <TableHead className="text-right">{t.table.pot}</TableHead>
                  <TableHead className="text-right">{t.table.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(transaction => {
                    const isExpense = transaction.type === 'expense';
                    const potName = isExpense && transaction.potId ? potMap.get(transaction.potId)?.name[language.key] : '—';
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{potName}</TableCell>
                        <TableCell className={`text-right font-medium ${isExpense ? 'text-destructive' : 'text-green-500'}`}>
                          <div className="flex items-center justify-end gap-1">
                             <span>
                                {isExpense ? '-' : '+'}
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(transaction.amount)}
                             </span>
                             {isExpense ? 
                                <TrendingDown className="h-4 w-4" /> : 
                                <TrendingUp className="h-4 w-4" />}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      {t.noTransactions}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-muted/50 font-medium">
                  <TableCell colSpan={2}>{t.table.totalIncome}</TableCell>
                  <TableCell className="text-right text-green-500">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome)}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2}>{t.table.totalExpenses}</TableCell>
                  <TableCell className="text-right text-destructive">
                    - {new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
