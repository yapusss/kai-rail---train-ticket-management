
import React, { useState, useEffect } from 'react';
import { generateTripPlan } from '../services/geminiService';
import type { TripPlan } from '../types';
import { ArrowLeftIcon } from '../components/icons/FeatureIcons';
import { PlannerIcon, SparklesIcon } from '../components/icons/FeatureIcons';

const PlannerScreen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  const [showVoiceExamples, setShowVoiceExamples] = useState(true);

  const handleTrainClick = (train: any) => {
    setSelectedTrain(train);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTrain(null);
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setBrowserSupportsSpeechRecognition(true);
    }
  }, []);

  // Handle transcript changes
  useEffect(() => {
    if (transcript) {
      setPrompt(prev => prev + (prev ? ' ' : '') + transcript);
      setTranscript('');
    }
  }, [transcript]);

  // Voice recognition functions
  const startListening = () => {
    if (!browserSupportsSpeechRecognition) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'id-ID';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (!browserSupportsSpeechRecognition) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    SpeechRecognition.stopListening();
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
        <div className="flex items-center justify-start">
          <div className="p-2">
            <PlannerIcon className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">AI Trip Planner</h1>
          <div></div>
        </div>
        <p className="text-sm opacity-90 mt-2 ml-10">Deskripsikan perjalanan impian Anda, dan biarkan AI merancangnya</p>
      </div>

      <div className="p-4 space-y-6">

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={transcript || prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isListening ? "Mendengarkan..." : "Contoh: Saya ingin pergi dari Jakarta ke Yogyakarta untuk liburan akhir pekan depan. Saya berangkat Jumat malam dan kembali Minggu malam. Saya lebih suka kereta eksekutif."}
            className={`w-full p-3 pb-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-none ${isListening ? 'animate-pulse' : ''}`}
            rows={4}
          />
          
          {/* Voice Recognition Button */}
          <button
            onClick={browserSupportsSpeechRecognition ? (isListening ? stopListening : startListening) : undefined}
            disabled={!browserSupportsSpeechRecognition}
            className={`absolute right-3 bottom-3 p-2 rounded-full transition-all duration-300 hover:scale-110 ${
              browserSupportsSpeechRecognition
                ? isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-400 cursor-not-allowed text-white'
            }`}
            title={browserSupportsSpeechRecognition 
              ? (isListening ? 'Stop Voice Input' : 'Start Voice Input')
              : 'Voice recognition not supported'
            }
          >
            {isListening ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Voice Status */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Mendengarkan... Bicaralah sekarang</span>
          </div>
        )}

        {/* Voice Commands Examples */}
        {showVoiceExamples && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setShowVoiceExamples(false)}
              className="absolute top-2 right-2 p-1 text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full transition-all duration-200 group"
              title="Tutup contoh voice commands"
            >
              <svg className="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="pr-6">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                🎤 Contoh Voice Commands:
              </h4>
              <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <p>• "Saya ingin pergi dari Jakarta ke Yogyakarta akhir pekan depan"</p>
                <p>• "Buatkan rencana perjalanan ke Bandung dengan kereta eksekutif"</p>
                <p>• "Saya berangkat hari Jumat dan kembali hari Minggu"</p>
                <p>• "Perjalanan ke Surabaya dengan budget lima ratus ribu"</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleGeneratePlan}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-red-700 disabled:bg-red-400 dark:disabled:bg-red-800 transition-all transform hover:scale-105 disabled:scale-100"
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
              <div 
                key={index} 
                className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTrainClick(step)}
              >
                <p className="font-semibold text-blue-600 dark:text-blue-400">{step.trainName} ({step.trainClass})</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.departureStation} → {step.arrivalStation}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(step.departureTime).toLocaleString('id-ID')} - {new Date(step.arrivalTime).toLocaleString('id-ID')}</p>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">Rp {step.estimatedPrice.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-600 text-right">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Estimasi Biaya</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Rp {plan.steps.reduce((total, step) => total + step.estimatedPrice, 0).toLocaleString('id-ID')}</p>
              <button className="mt-2 w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  Pesan Perjalanan Ini
              </button>
          </div>
        </div>
      )}

      {/* Modal for Train Details */}
      {showModal && selectedTrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Detail Perjalanan</h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">{selectedTrain.trainName} ({selectedTrain.trainClass})</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Rute:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedTrain.departureStation} → {selectedTrain.arrivalStation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Waktu Keberangkatan:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedTrain.departureTime).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Waktu Kedatangan:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedTrain.arrivalTime).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Durasi:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.round((new Date(selectedTrain.arrivalTime).getTime() - new Date(selectedTrain.departureTime).getTime()) / (1000 * 60 * 60))} jam
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Harga:</span>
                      <span className="font-bold text-red-600 dark:text-red-400">Rp {selectedTrain.estimatedPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Informasi Stasiun</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-400">Stasiun Keberangkatan:</span>
                      <p className="text-gray-700 dark:text-gray-300">{selectedTrain.departureStation}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700 dark:text-blue-400">Stasiun Kedatangan:</span>
                      <p className="text-gray-700 dark:text-gray-300">{selectedTrain.arrivalStation}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={closeModal}
                    className="flex-1 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Tutup
                  </button>
                  <button 
                    onClick={() => {
                      alert('Fitur booking akan segera tersedia!');
                      closeModal();
                    }}
                    className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Pesan Tiket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PlannerScreen;
