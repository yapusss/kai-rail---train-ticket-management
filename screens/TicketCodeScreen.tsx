import React, { useState, useRef } from 'react';
import { ArrowLeftIcon } from '../components/icons/FeatureIcons';
import { NavigationTab } from '../types';
import Swal from 'sweetalert2';

interface TicketCodeScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
}

const TicketCodeScreen: React.FC<TicketCodeScreenProps> = ({ setActiveTab }) => {
    const [inputMethod, setInputMethod] = useState<'manual' | 'qr' | 'camera'>('manual');
    const [ticketCode, setTicketCode] = useState('');
    const [qrImage, setQrImage] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLVideoElement>(null);

    const handleBack = () => {
        setActiveTab(NavigationTab.Tickets);
    };

    const handleManualInput = () => {
        if (!ticketCode.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Kode Tiket Kosong',
                text: 'Silakan masukkan kode tiket terlebih dahulu',
                confirmButtonText: 'Baik'
            });
            return;
        }

        setIsProcessing(true);
        validateTicketCode(ticketCode);
    };

    const handleQRUpload = () => {
        if (!qrImage) {
            Swal.fire({
                icon: 'warning',
                title: 'Belum Memilih File',
                text: 'Silakan pilih file QR code terlebih dahulu',
                confirmButtonText: 'Baik'
            });
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            const mockTicketCode = 'TIX-SCAN123';
            validateTicketCode(mockTicketCode);
        }, 2000);
    };

    const handleCameraScan = () => {
        setIsProcessing(true);
        setTimeout(() => {
            const mockTicketCode = 'TIX-CAM456';
            validateTicketCode(mockTicketCode);
        }, 3000);
    };

    const validateTicketCode = (code: string) => {
        setIsProcessing(false);
        
        const isValid = Math.random() > 0.3;
        
        if (isValid) {
            Swal.fire({
                icon: 'success',
                title: 'Tiket Ditemukan!',
                html: `
                    <div class="text-left">
                        <p class="mb-2"><strong>Kode Booking:</strong> ${code}</p>
                        <p class="mb-2"><strong>Kereta:</strong> Argo Bromo Anggrek</p>
                        <p class="mb-2"><strong>Rute:</strong> Jakarta - Surabaya</p>
                        <p class="mb-2"><strong>Jadwal:</strong> 25 Desember 2024, 08:00</p>
                        <p><strong>Status:</strong> <span class="text-green-600">Aktif</span></p>
                    </div>
                `,
                confirmButtonText: 'Tambah ke Tiket Saya',
                showCancelButton: true,
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil Ditambahkan!',
                        text: `Tiket ${code} telah ditambahkan ke akun Anda`,
                        confirmButtonText: 'Lihat Tiket Saya'
                    }).then(() => {
                        setActiveTab(NavigationTab.Tickets);
                    });
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Tiket Tidak Ditemukan',
                text: 'Kode tiket tidak valid atau sudah tidak aktif. Silakan periksa kembali kode Anda.',
                confirmButtonText: 'Coba Lagi'
            });
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setQrImage(file);
            setInputMethod('qr');
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold">Cek & Tambah Tiket</h1>
                    <div className="w-8 h-8" />
                </div>
            </div>

            <div className="p-4 space-y-6">
            {}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pilih Cara Input</h3>
                    
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <button
                            onClick={() => setInputMethod('manual')}
                            className={`p-3 rounded-lg transition-colors ${
                                inputMethod === 'manual'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                                    : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600'
                            }`}
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Manual</p>
                        </button>

                        <button
                            onClick={() => setInputMethod('qr')}
                            className={`p-3 rounded-lg transition-colors ${
                                inputMethod === 'qr'
                                    ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                                    : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600'
                            }`}
                        >
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Upload QR</p>
                        </button>

                        <button
                            onClick={() => setInputMethod('camera')}
                            className={`p-3 rounded-lg transition-colors ${
                                inputMethod === 'camera'
                                    ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                                    : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600'
                            }`}
                        >
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Scan Camera</p>
                        </button>
                    </div>
                </div>

            {}
                {inputMethod === 'manual' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Input Kode Tiket</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Kode Booking 
                                </label>
                                <input
                                    type="text"
                                    value={ticketCode}
                                    onChange={(e) => setTicketCode(e.target.value)}
                                    placeholder="Masukkan kode tiket (contoh: TIX-AB1234)"
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleManualInput}
                                disabled={isProcessing}
                                className="w-full py-3 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Mencari Tiket...' : 'Cek Tiket'}
                            </button>
                        </div>
                    </div>
                )}

            {}
                {inputMethod === 'qr' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Upload QR Code</h4>
                        <div className="space-y-4">
                            <div className="text-center">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                
                                {qrImage ? (
                                    <div className="space-y-3">
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                        File QR Code Dipilih
                                                    </p>
                                                    <p className="text-xs text-green-600 dark:text-green-300">
                                                        {qrImage.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleQRUpload}
                                            disabled={isProcessing}
                                            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? 'Memproses QR Code...' : 'Scan QR Code'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-gray-500 dark:text-gray-400">Pilih atau drag file QR code ke sini</p>
                                        </div>
                                        <button
                                            onClick={openFileDialog}
                                            className="w-full py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                        >
                                            Pilih File QR Code
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            {}
                {inputMethod === 'camera' && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Scan Camera QR Code</h4>
                        <div className="space-y-4">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <p className="text-gray-500 dark:text-gray-400 mb-2">Preview Kamera</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Arahkan kamera ke QR code untuk scanning
                                </p>
                            </div>
                            
                            <button
                                onClick={handleCameraScan}
                                disabled={isProcessing}
                                className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Scanning QR Code...' : 'Mulai Scan'}
                            </button>
                        </div>
                    </div>
                )}

            {}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Cara Menggunakan</h4>
                    <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                        <p>• <strong>Manual:</strong> Ketik kode booking secara manual</p>
                        <p>• <strong>Upload QR:</strong> Pilih file gambar QR code dari galeri</p>
                        <p>• <strong>Scan Camera:</strong> Gunakan kamera untuk scan QR langsung</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketCodeScreen;
