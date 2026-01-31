import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, FileSpreadsheet, Upload } from 'lucide-react';
import { useRef } from 'react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

export default function Reports() {
  const [expenseData, setExpenseData] = useState<{name: string, value: number}[]>([]);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [incomeVsExpense, setIncomeVsExpense] = useState({ income: 0, expense: 0 });
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]); // Need accounts for default assignment
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [expenses, cashflow, inVsEx, accs] = await Promise.all([
            fetch('http://localhost:3000/reports/expenses-by-category').then(res => res.json()),
            fetch('http://localhost:3000/reports/cashflow').then(res => res.json()),
            fetch('http://localhost:3000/reports/income-vs-expenses').then(res => res.json()),
            fetch('http://localhost:3000/accounts').then(res => res.json())
        ]);
        setExpenseData(expenses);
        setCashFlowData(cashflow);
        setIncomeVsExpense(inVsEx);
        setAccounts(accs);
        setLoading(false);
    } catch (error) {
        console.error("Error fetching reports", error);
    } finally {
        setLoading(false);
    }
  };

  const netSavings = incomeVsExpense.income - incomeVsExpense.expense;
  const savingsRate = incomeVsExpense.income > 0 ? ((netSavings / incomeVsExpense.income) * 100).toFixed(1) : 0;

  const handlePrint = () => {
      window.print();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
          const text = evt.target?.result as string;
          const lines = text.split('\n');
          // Expect CSV: Fecha,Descripcion,Monto,Tipo
          // Skip header
          if (lines.length < 2) return;

          let successCount = 0;
           // Default account for import (first active)
          const defaultAccount = accounts.find(a => a.activa)?.id;
          
          if(!defaultAccount) {
              alert("No tienes cuentas activas para asignar estas transacciones. Crea una cuenta primero.");
              return;
          }

          for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              
              const [fecha, descripcion, monto, tipo] = line.split(',');
              
              if (!fecha || !descripcion || !monto) continue;

              try {
                  await fetch('http://localhost:3000/transactions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          fecha: new Date(fecha).toISOString(), // simple parse
                          descripcion,
                          monto: Number(monto),
                          tipo: tipo?.toLowerCase().includes('ingreso') ? 'ingreso' : 'gasto',
                          cuentaId: defaultAccount,
                          categoriaId: null // Default null for now
                      })
                  });
                  successCount++;
              } catch (err) {
                  console.error("Error importing line", i, err);
              }
          }
          
          if (successCount > 0) {
              alert(`Se importaron ${successCount} transacciones correctamente.`);
              fetchData(); // Refresh reports
              // Reset input
              if(fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  const handleExportExcel = () => {
      // 1. Prepare CSV Content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Section 1: Summary
      csvContent += "Resumen Financiero\n";
      csvContent += `Ingresos Totales,${incomeVsExpense.income}\n`;
      csvContent += `Gastos Totales,${incomeVsExpense.expense}\n`;
      csvContent += `Ahorro Neto,${netSavings}\n\n`;

      // Section 2: Cashflow
      csvContent += "Historial de Flujo de Caja\n";
      csvContent += "Mes,Ingresos,Gastos,Ahorro\n";
      cashFlowData.forEach(row => {
          csvContent += `${row.month},${row.income},${row.expense},${row.savings}\n`;
      });
      csvContent += "\n";

      // Section 3: Expenses by Category
      csvContent += "Gastos por Categoria\n";
      csvContent += "Categoria,Monto\n";
      expenseData.forEach(row => {
          csvContent += `${row.name},${row.value}\n`;
      });

      // 2. Trigger Download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `reporte_financiero_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center">Generando reportes financieros...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 print:animate-none">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reportes Financieros</h1>
          <p className="text-gray-600">Tu salud financiera en gráficos</p>
        </div>
        <div className="flex gap-2">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden" 
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all font-semibold flex items-center gap-2 border border-white/20"
            >
              <Upload size={20} />
              Importar Excel
            </button>
            <button 
                onClick={handleExportExcel}
                className="px-4 py-2.5 bg-green-600 text-white rounded-xl shadow-lg shadow-green-600/30 hover:shadow-green-600/50 hover:-translate-y-0.5 transition-all font-semibold flex items-center gap-2 border border-white/20"
            >
              <FileSpreadsheet size={20} />
              Exportar Excel
            </button>
            <button 
                onClick={handlePrint}
                className="btn-primary"
            >
              <Download size={20} />
              Exportar PDF
            </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-green-50 border-green-100">
              <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
                      <TrendingUp size={24} />
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
                      <p className="text-2xl font-bold text-gray-800">${incomeVsExpense.income.toLocaleString()}</p>
                  </div>
              </div>
          </div>
          <div className="card bg-red-50 border-red-100">
             <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-red-100 rounded-full text-red-600">
                      <TrendingDown size={24} />
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
                      <p className="text-2xl font-bold text-gray-800">${incomeVsExpense.expense.toLocaleString()}</p>
                  </div>
              </div>
          </div>
          <div className="card bg-blue-50 border-blue-100">
             <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                      <DollarSign size={24} />
                  </div>
                  <div>
                      <p className="text-sm font-medium text-gray-500">Ahorro Neto</p>
                      <p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          ${netSavings.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Tasa de ahorro: {savingsRate}%</p>
                  </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expenses by Category Pie Chart */}
          <div className="card min-h-[400px] flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Gastos por Categoría</h3>
              <div className="flex-1">
                  {expenseData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                              <Pie
                                  data={expenseData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  fill="#8884d8"
                                  paddingAngle={5}
                                  dataKey="value"
                              >
                                  {expenseData.map((_, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                              <Legend />
                          </PieChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                          Sin datos de gastos
                      </div>
                  )}
              </div>
          </div>

          {/* Monthly Cashflow Bar Chart */}
          <div className="card min-h-[400px] flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Flujo de Caja (Últimos 6 Meses)</h3>
               <div className="flex-1">
                  {cashFlowData.length > 0 ? (
                       <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                              data={cashFlowData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} />
                              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                              <RechartsTooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                  formatter={(value: number) => `$${value.toLocaleString()}`}
                              />
                              <Legend />
                              <Bar dataKey="income" name="Ingresos" fill="#4ade80" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="expense" name="Gastos" fill="#f87171" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                          SIn historial suficiente
                      </div>
                  )}
              </div>
          </div>
      </div>

       {/* Net Savings Trend Area Chart */}
       <div className="card min-h-[400px] flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Tendencia de Ahorro</h3>
               <div className="flex-1">
                  {cashFlowData.length > 0 ? (
                       <ResponsiveContainer width="100%" height={300}>
                          <AreaChart
                              data={cashFlowData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                              <defs>
                                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <XAxis dataKey="month" axisLine={false} tickLine={false} />
                              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                              <Area type="monotone" dataKey="savings" name="Ahorro Neto" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSavings)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  ) : (
                       <div className="h-full flex items-center justify-center text-gray-400">
                          SIn historial suficiente
                      </div>
                  )}
              </div>
          </div>
    </div>
  );
}
