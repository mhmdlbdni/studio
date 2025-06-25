
'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subDays, startOfWeek, startOfMonth, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    // Sort transactions once before filtering
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let interval: Interval | null = null;
    
    switch (filter) {
      case 'day':
        interval = { start: subDays(now, 1), end: now };
        break;
      case 'week':
        interval = { start: startOfWeek(now), end: now };
        break;
      case 'month':
        interval = { start: startOfMonth(now), end: now };
        break;
      case 'all':
      default:
        return sortedTransactions;
    }

    return sortedTransactions.filter(t => isWithinInterval(new Date(t.date), interval as Interval));
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
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    // Define Theme Colors (using light theme for PDF)
    const primaryColor = '#47abff';
    const headerTextColor = '#ffffff';
    const greenColor = '#28a745';
    const redColor = '#dc3545';
    const mutedTextColor = '#6c757d';

    // -- Header --
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.text('Al-Mawazin', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(mutedTextColor);
    doc.text('Transaction Report', 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US')}`, pageWidth - 14, 22, { align: 'right' });

    // -- Summary Cards --
    const netBalance = totalIncome - totalExpenses;
    const summaryStartY = 45;

    // Total Income Card
    doc.setFillColor(230, 245, 233); // Light green
    doc.setDrawColor(greenColor);
    doc.roundedRect(14, summaryStartY, 58, 25, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setTextColor(mutedTextColor);
    doc.text('Total Income', 20, summaryStartY + 7);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(greenColor);
    doc.text(new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome), 20, summaryStartY + 17);

    // Total Expenses Card
    doc.setFillColor(253, 235, 237); // Light red
    doc.setDrawColor(redColor);
    doc.roundedRect(77, summaryStartY, 58, 25, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedTextColor);
    doc.text('Total Expenses', 83, summaryStartY + 7);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(redColor);
    doc.text(`- ${new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}`, 83, summaryStartY + 17);
    
    // Net Balance Card
    doc.setFillColor(232, 244, 255); // Light blue
    doc.setDrawColor(primaryColor);
    doc.roundedRect(140, summaryStartY, 58, 25, 3, 3, 'FD');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedTextColor);
    doc.text('Net Balance', 146, summaryStartY + 7);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text(new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance), 146, summaryStartY + 17);

    // -- Table --
    const tableHeaders = [['Date', 'Description', 'Pot', 'Amount']];
    const tableRows = filteredTransactions.map(transaction => {
        const isExpense = transaction.type === 'expense';
        // Use English pot name to avoid font issues with Arabic
        const potName = isExpense && transaction.potId ? (potMap.get(transaction.potId)?.name['en'] || 'N/A') : '—';
        const amount = `${isExpense ? '-' : '+'} ${new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(transaction.amount)}`;
        return [
            new Date(transaction.date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' }),
            transaction.description,
            potName,
            { content: amount, styles: { textColor: isExpense ? redColor : greenColor, halign: 'right' } }
        ];
    });

    autoTable(doc, {
        head: tableHeaders,
        body: tableRows,
        startY: summaryStartY + 35,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: headerTextColor,
            fontStyle: 'bold',
        },
        columnStyles: {
            3: { halign: 'right' },
        },
        didParseCell: function(data) {
            if (data.section === 'head' && data.column.index === 3) {
                data.cell.styles.halign = 'right';
            }
        },
        foot: [
          [{ content: 'Total Income', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalIncome), styles: { halign: 'right', textColor: greenColor, fontStyle: 'bold' } }],
          [{ content: 'Total Expenses', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: `- ${new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalExpenses)}`, styles: { halign: 'right', textColor: redColor, fontStyle: 'bold' } }],
          [{ content: 'Net Balance', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold', fillColor: [232, 244, 255] } }, { content: new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(netBalance), styles: { halign: 'right', textColor: primaryColor, fontStyle: 'bold', fillColor: [232, 244, 255] } }],
        ],
        footStyles: {
            fontStyle: 'bold'
        }
    });

    doc.save('Mawazin_Report.pdf');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.title}</CardTitle>
            <Button variant="outline" size="icon" onClick={handleDownloadPDF}>
              <FileDown className="h-4 w-4" />
              <span className="sr-only">Download PDF</span>
            </Button>
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
