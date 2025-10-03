import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { ArrowLeftIcon, TrainIcon, LocationIcon, CalendarIcon, RouteIcon, PriceTagIcon } from '../components/icons/FeatureIcons';
import { TrainDataService } from '../services/trainDataService';
import TrainRouteSelectionScreen from './TrainRouteSelectionScreen';
import SimpleRouteMap from '../components/SimpleRouteMap';
import Swal from 'sweetalert2';

interface CommuterLineScreenProps {
    setActiveTab: (tab: NavigationTab) => void;
    setSelectedServiceType: (serviceType: string) => void;
    setBookingFormData: (data: any) => void;
}

const CommuterLineScreen: React.FC<CommuterLineScreenProps> = ({ 
    setActiveTab, 
    setSelectedServiceType, 
    setBookingFormData 
}) => {
    const [commuterView, setCommuterView] = useState<
        "services" | "position" | "position-detail" | "live-position" | "schedule" | "route-map" | "fare-check" | "fare-result"
    >("services");
    const [selectedStation, setSelectedStation] = useState<any | null>(null);
    const [selectedLine, setSelectedLine] = useState<any | null>(null);
    const [generatedSchedule, setGeneratedSchedule] = useState<string[]>([]);
    const [fareForm, setFareForm] = useState({
        departureStation: '',
        arrivalStation: ''
    });
    const [selectedLineFilter, setSelectedLineFilter] = useState<'all' | 'tanggerang'>('all');

    const toMinutes = (hhmm: string) => {
        const [h, m] = hhmm.split(":").map((x: string) => parseInt(x, 10));
        return h * 60 + m;
    };

    const toHHMM = (minsTotal: number) => {
        const h = Math.floor(minsTotal / 60) % 24;
        const m = minsTotal % 60;
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        return `${pad(h)}.${pad(m)}`;
    };

    const parseFrequencyToMinutes = (freq: string): number => {
        const matchRange = freq.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (matchRange) return parseInt(matchRange[2], 10);
        const matchSingle = freq.match(/(\d+)/);
        return matchSingle ? parseInt(matchSingle[1], 10) : 15;
    };

    const handleBackToDashboard = () => {
        setActiveTab(NavigationTab.Dashboard);
    };

    if (commuterView === "services") {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBackToDashboard}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">Commuter Line</h1>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <TrainIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Commuter Line
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Kereta komuter untuk perjalanan harian
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCommuterView("fare-check")}

                            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            PESAN TIKET
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setCommuterView("position")}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-left"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                                <LocationIcon className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Cek Posisi Kereta
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Informasi posisi kereta saat ini.
                            </p>
                        </button>

                        <button
                            onClick={() => setCommuterView("schedule")}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-left"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                                <CalendarIcon className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Jadwal Kereta
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Informasi jadwal perjalanan KRL.
                            </p>
                        </button>

                        <button
                            onClick={() => setCommuterView("route-map")}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-left"
                        >
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                                <RouteIcon className="w-6 h-6 text-purple-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Rute dan Jalur
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Peta interaktif dengan titik stasiun dan jarak.
                            </p>
                        </button>

                        <button
                            onClick={() => setCommuterView("fare-check")}
                            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md text-left"
                        >
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                                <PriceTagIcon className="w-6 h-6 text-orange-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Cek Tarif
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Informasi tarif perjalanan KRL.
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (commuterView === "fare-check") {
        const stations = TrainDataService.getAllStations();
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCommuterView("services")}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">Cek Tarif</h1>
                        <div className="w-8 h-8" />
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pilih Rute Perjalanan</h2>
                        
        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stasiun Keberangkatan
                            </label>
                            <select
                                value={fareForm.departureStation}
                                onChange={(e) => setFareForm({...fareForm, departureStation: e.target.value})}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Pilih Stasiun Keberangkatan</option>
                                {stations.map((station, idx) => (
                                    <option key={`${station.code}-${idx}`} value={station.name}>
                                        {station.name} ({station.code})
                                    </option>
                                ))}
                            </select>
                        </div>

        {}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Stasiun Tujuan
                            </label>
                            <select
                                value={fareForm.arrivalStation}
                                onChange={(e) => setFareForm({...fareForm, arrivalStation: e.target.value})}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Pilih Stasiun Tujuan</option>
                                {stations.map((station, idx) => (
                                    <option key={`${station.code}-${idx}`} value={station.name}>
                                        {station.name} ({station.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {}
                        <button
                            onClick={() => {
                                if (fareForm.departureStation && fareForm.arrivalStation) {
                                    setCommuterView("fare-result");
                                } else {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Perhatian!',
                                        text: 'Mohon pilih stasiun keberangkatan dan tujuan',
                                        confirmButtonText: 'Baik'
                                    });
                                }
                            }}
                            className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            Cek Tarif
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (commuterView === "live-position") {
        const positionData = TrainDataService.getTrainPositionData();
        console.log('Position Data:', positionData);
        const currentStation = selectedStation || positionData?.currentStations?.PSG || null;
        const liveTrains = positionData?.liveTrains || [];
        console.log('Live Trains:', liveTrains); 
        
        const dummyTrains = liveTrains.length === 0 ? [
            {
                id: "897A-898A",
                number: "#897A-898A / SF6",
                route: "COMMUTER LINE BST",
                destination: "Ke BANDARASOEKARNOHATTA",
                departureTime: "17:24",
                status: "Berangkat dari DURI",
                stationRemaining: "2 Stasiun Lagi",
                currentStation: "PSG",
                lineColor: "bg-blue-600"
            },
            {
                id: "1982A",
                number: "#1982A / SF8",
                route: "COMMUTER LINE TANGERANG",
                destination: "Ke TANGERANG",
                departureTime: "17:29",
                status: "Dijalur5",
                stationRemaining: "2 Stasiun Lagi",
                currentStation: "PSG",
                lineColor: "bg-yellow-600"
            },
            {
                id: "1983A",
                number: "#1983A / SF10",
                route: "COMMUTER LINE TANGERANG",
                destination: "Ke DURI",
                departureTime: "17:31",
                status: "Berangkat dari KALIDERES",
                stationRemaining: "4 Stasiun Lagi",
                currentStation: "PSG",
                lineColor: "bg-yellow-600"
            },
            {
                id: "1985A",
                number: "#1985A / SF10",
                route: "COMMUTER LINE TANGERANG",
                destination: "Ke DURI",
                departureTime: "17:40",
                status: "Berangkat dari TANAH",
                stationRemaining: "7 Stasiun Lagi",
                currentStation: "PSG",
                lineColor: "bg-yellow-600"
            }
        ] : liveTrains;

        const filteredTrains = selectedLineFilter === 'all' 
            ? dummyTrains 
            : dummyTrains.filter((train: any) => train.route.includes('TANGERANG'));
        
        console.log('Live Trains:', dummyTrains); 
        console.log('Filtered Trains:', filteredTrains); 

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {}
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCommuterView("position")}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">Posisi Kereta</h1>
                        <div className="w-8 h-8" />
                    </div>
                </div>

                <div className="p-4 space-y-4">
            {}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Stasiun
                        </p>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <TrainIcon className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {currentStation?.name || 'PESING'}
                            </p>
                        </div>
                    </div>

            {}
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setSelectedLineFilter('all')}
                            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                                selectedLineFilter === 'all'
                                    ? 'border-2 border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border border-gray-300 text-gray-600 bg-white dark:bg-gray-800 dark:border-gray-600'
                            }`}
                        >
                            Semua Line
                        </button>
                        <button
                            onClick={() => setSelectedLineFilter('tanggerang')}
                            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                                selectedLineFilter === 'tanggerang'
                                    ? 'border-2 border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border border-gray-300 text-gray-600 bg-white dark:bg-gray-800 dark:border-gray-600'
                            }`}
                        >
                            COMMUTER LINE TANGERANG
                        </button>
                    </div>

            {}
                    <div className="space-y-3">
                        {filteredTrains.map((train: any, idx: number) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div
                                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${train.lineColor}`}
                                    >
                                        {train.route}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                                            {train.departureTime}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                        {train.destination}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {train.number}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {train.status}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {train.stationRemaining}
                                    </p>
                                </div>
                            </div>
                        ))}
                        
                        {filteredTrains.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Tidak ada kereta yang tersedia untuk filter ini
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (commuterView === "position") {
        const stations = TrainDataService.getAllStations();
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCommuterView("services")}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">Posisi Kereta</h1>
                        <div className="w-8 h-8" />
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Pilih Stasiun
                        </p>
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <TrainIcon className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Pilih Stasiun
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700">
                        {stations.map((station, idx) => (
                            <button
                                key={`${station.code}-${idx}`}
                                onClick={() => {
                                    const positionData = TrainDataService.getTrainPositionData();
                                    const liveTrains = positionData?.liveTrains || [];
                                    
                                    if (positionData) {
                                        positionData.currentStations = {
                                            ...positionData.currentStations,
                                            [station.code]: station
                                        };
                                        
                                        positionData.liveTrains = liveTrains.map(train => ({
                                            ...train,
                                            currentStation: station.code
                                        }));
                                    }
                                    
                                    setSelectedStation(station);
                                    setCommuterView("live-position");
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <TrainIcon className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-semibold tracking-wide text-gray-800 dark:text-gray-200">
                                        {station.name.toUpperCase()}
                                    </span>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (commuterView === "position-detail" && selectedStation) {
        const commuterLines = TrainDataService.getCommuterLines();
        const matchedLine =
            commuterLines.find(
                (ln: any) =>
                    (ln.route.from.name || "")
                        .toLowerCase()
                        .includes(selectedStation.name.toLowerCase()) ||
                    (ln.route.to.name || "")
                        .toLowerCase()
                        .includes(selectedStation.name.toLowerCase())
            ) || commuterLines[0];

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCommuterView("position")}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">Posisi Kereta</h1>
                        <div className="w-8 h-8" />
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Stasiun
                        </p>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <TrainIcon className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {selectedStation.name.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            Ingin melihat Jadwal kereta
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Anda dapat melihat Jadwal Kereta
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => {
                                const line = matchedLine;
                                setSelectedLine(line);
                                const isWeekend = false;
                                const sch =
                                    line.schedule[isWeekend ? "weekends" : "weekdays"];
                                const step = parseFrequencyToMinutes(sch.frequency);
                                const first = toMinutes(sch.first.replace(".", ":"));
                                const last = toMinutes(sch.last.replace(".", ":"));
                                const times: string[] = [];
                                for (let t = first; t <= last; t += step)
                                    times.push(toHHMM(t));
                                setGeneratedSchedule(times);
                                setCommuterView("schedule");
                            }}
                            className="w-full py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                            LIHAT JADWAL KERETA
                        </button>

                        <button
                            onClick={() => {
                                const line = matchedLine;
                                const event = new CustomEvent("create-payment", {
                                    detail: {
                                        fromStation: selectedStation.name,
                                        serviceName: "Commuter Line",
                                        date: new Date().toLocaleDateString("id-ID"),
                                        passengers: 1,
                                        amount: line?.price ?? 5000,
                                        lineId: line?.id,
                                    },
                                });
                                window.dispatchEvent(event);
                            }}
                            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            BELI TIKET PERJALANAN INI
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (commuterView === "schedule" && selectedStation && selectedLine) {
        const sch = selectedLine.schedule.weekdays;
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-4 shadow-sm sticky top-0 z-10">
                    <div className="flex items-center space-x-2 text-sm">
                        <button
                            onClick={() => setCommuterView("position-detail")}
                            className="p-2 -ml-2"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                        <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-semibold capitalize">
                            Commuter line{" "}
                            {selectedLine.name?.toLowerCase?.() || selectedLine.name}
                        </span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Jadwal Kereta
                        </h2>
                        <span className="text-sm text-gray-500">
                            {sch.first} - {sch.last}
                        </span>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    {generatedSchedule.map((time, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between shadow-sm"
                        >
                            <div className="flex items-center space-x-3">
                                <TrainIcon className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        #{1900 + idx}A
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {selectedStation.name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {time}
                                </span>
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (commuterView === "schedule") {
        return (
            <TrainRouteSelectionScreen setActiveTab={setActiveTab} />
        );
    }

    if (commuterView === "route-map") {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {}
                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCommuterView("services")}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <div className="text-center">
                            <h1 className="text-xl font-bold">Peta Rute Komuter</h1>
                            <p className="text-sm opacity-90">Jabodetabek & Merak</p>
                        </div>
                        <div className="w-8 h-8" />
                    </div>
                </div>

                <div className="p-4">
                    <SimpleRouteMap />
                </div>
            </div>
        );
    }

    if (commuterView === "fare-result") {
        const fareCalculation = TrainDataService.calculateFare(fareForm.departureStation, fareForm.arrivalStation);
        const stations = TrainDataService.getAllStations();
        const fromStationData = stations.find(s => s.name === fareForm.departureStation);
        const toStationData = stations.find(s => s.name === fareForm.arrivalStation);

        const handleSwapStations = () => {
            setFareForm({
                departureStation: fareForm.arrivalStation,
                arrivalStation: fareForm.departureStation
            });
        };

        const handleBuyTicket = () => {
            setSelectedServiceType('Commuter Line');
            setBookingFormData({
                serviceType: 'Commuter Line',
                departureStation: fareForm.departureStation,
                arrivalStation: fareForm.arrivalStation,
                fare: fareCalculation.fare,
                distance: fareCalculation.distance,
                travelTime: fareCalculation.travelTime
            });
            setActiveTab(NavigationTab.Payment);
        };

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {}
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-b-3xl">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCommuterView("fare-check")}
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold">Cek Tarif</h1>
                        <div className="w-8 h-8" />
                    </div>
                </div>

                <div className="p-4 space-y-4">
            {}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
                        <div className="flex items-center justify-between">
            {}
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Keberangkatan</p>
                                <div className="flex items-center space-x-2">
                                    <TrainIcon className="w-5 h-5 text-blue-600" />
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                        {fareForm.departureStation}
                                    </p>
                                </div>
                            </div>

            {}
                            <button
                                onClick={handleSwapStations}
                                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                            >
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                            </button>

            {}
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tujuan</p>
                                <div className="flex items-center space-x-2">
                                    <TrainIcon className="w-5 h-5 text-blue-600" />
                                    <p className="font-semibold text-gray-800 dark:text-gray-gray-200">
                                        {fareForm.arrivalStation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

            {}
                    <div className="bg-orange-400 rounded-2xl p-4 shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-white font-medium">Anda akan mendapatkan QR Code setelah bayar</p>
                            <div className="bg-white px-3 py-1 rounded-full">
                                <span className="text-orange-600 text-sm font-semibold">Commuter Line</span>
                            </div>
                        </div>
                    </div>

            {}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
            {}
                        <div className = "flex flex-col items-center space-y-2 mb-4">
            {}
                            <div className="text-center">
                                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                                    {fareForm.departureStation}
                                </p>
                            </div>
                            
            {}
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                {fareCalculation.distance > 0 ? fareCalculation.distance.toFixed(3) : '0.000'} Km
                            </p>
                            
            {}

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Estimasi: {TrainDataService.formatTravelTime(fareCalculation.travelTime)}
                            </p>
                            
            {}
                            <div className="w-1 h-8 border-l-2 border-dashed border-blue-300"></div>
                            
            {}
                            <div className="text-center">
                                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                                    {fareForm.arrivalStation}
                                </p>
                            </div>
                        </div>

            {}
                        <div className="flex items-center justify-between border-t pt-3">
                            <div className="text-left">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Berlaku s.d {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { 
                                        day: '2-digit', 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}, jam 03:00
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-blue-600">
                                    Rp. {TrainDataService.formatPrice(fareCalculation.fare).replace('Rp', '').trim()}
                                </p>
                            </div>
                        </div>
                    </div>

            {}
                    <button
                        onClick={handleBuyTicket}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        BELI TIKET
                    </button>
                </div>
            </div>
        );
    }
};

export default CommuterLineScreen;