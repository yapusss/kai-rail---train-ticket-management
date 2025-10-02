
import React, { useState } from 'react';
import { generateTripPlan } from '../services/geminiService';
import type { TripPlan } from '../types';
import { PlannerIcon, SparklesIcon } from '../components/icons/FeatureIcons';

const PlannerScreen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    if (!prompt) {
      setError("Mohon masukkan deskripsi perjalanan Anda.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await generateTripPlan(prompt);
      if (result) {
        setPlan(result);
      } else {
        setError("Gagal membuat rencana. Silakan coba lagi.");
      }
    } catch (e) {
      setError("Terjadi kesalahan saat berkomunikasi dengan AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <div className="flex justify-center items-center gap-2">
            <PlannerIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI Trip Planner</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Deskripsikan perjalanan impian Anda, dan biarkan AI merancangnya.
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Contoh: Saya ingin pergi dari Jakarta ke Yogyakarta untuk liburan akhir pekan depan. Saya berangkat Jumat malam dan kembali Minggu malam. Saya lebih suka kereta eksekutif."
          className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors h-32 resize-none"
          rows={4}
        />
        <button
          onClick={handleGeneratePlan}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-red-700 disabled:bg-red-400 dark:disabled:bg-red-800 transition-all transform hover:scale-105 disabled:scale-100"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Merancang...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Buat Rencana</span>
            </>
          )}
        </button>
      </div>
      
      {error && <p className="text-center text-red-500">{error}</p>}

      {plan && (
        <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.planTitle}</h3>
          
          <div className="space-y-3">
            {plan.steps.map((step, index) => (
              <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                <p className="font-semibold">{step.trainName} ({step.trainClass})</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.departureStation} → {step.arrivalStation}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(step.departureTime).toLocaleString('id-ID')} - {new Date(step.arrivalTime).toLocaleString('id-ID')}</p>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">Rp {step.estimatedPrice.toLocaleString('id-ID')}</p>
                {step.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">"{step.notes}"</p>}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-600 text-right">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Estimasi Biaya</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Rp {plan.totalEstimatedPrice.toLocaleString('id-ID')}</p>
              <button className="mt-2 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Pesan Perjalanan Ini
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerScreen;
