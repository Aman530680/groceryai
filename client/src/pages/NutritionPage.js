import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Spinner from '../components/ui/Spinner';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export default function NutritionPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyNutrition, setWeeklyNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    api.get('/orders/my-orders').then(({ data }) => {
      setOrders(data.slice(0, 7));
      // Simulate nutrition from recent orders
      const totals = { calories: 1850, protein: 75, carbs: 220, fat: 65 };
      setWeeklyNutrition(totals);
    }).finally(() => setLoading(false));
  }, []);

  const macros = [
    { name: 'Protein', value: weeklyNutrition.protein, color: '#3b82f6', goal: 100 },
    { name: 'Carbs', value: weeklyNutrition.carbs, color: '#f59e0b', goal: 300 },
    { name: 'Fat', value: weeklyNutrition.fat, color: '#ef4444', goal: 80 },
  ];

  const pieData = macros.map((m) => ({ name: m.name, value: m.value }));

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">📊 Nutrition Dashboard</h1>

      {/* Calorie card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-6 text-center md:col-span-1">
          <div className="text-4xl font-bold text-primary-600">{weeklyNutrition.calories}</div>
          <div className="text-sm text-gray-500 mt-1">Daily Calories</div>
          <div className="mt-3 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${Math.min((weeklyNutrition.calories / 2000) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">Goal: 2000 kcal</div>
        </div>

        {macros.map((m) => (
          <div key={m.name} className="card p-6 text-center">
            <div className="text-3xl font-bold" style={{ color: m.color }}>{m.value}g</div>
            <div className="text-sm text-gray-500 mt-1">{m.name}</div>
            <div className="mt-3 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${Math.min((m.value / m.goal) * 100, 100)}%`, backgroundColor: m.color }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">Goal: {m.goal}g</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macro distribution */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Macro Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}g`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i + 1]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly calories */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Weekly Calorie Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
              day,
              calories: Math.floor(1600 + Math.random() * 800),
            }))}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="calories" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
