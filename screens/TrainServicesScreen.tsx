import React, { useState } from "react";
import { NavigationTab } from "../types";
import { TrainDataService } from "../services/trainDataService";
import {
  TrainIcon,
  ArrowLeftIcon,
  LocationIcon,
  CalendarIcon,
  RouteIcon,
  PriceTagIcon,
} from "../components/icons/FeatureIcons";

interface TrainServicesScreenProps {
  setActiveTab: (tab: NavigationTab, serviceId?: string) => void;
  initialService?: string | null;
}

const TrainServicesScreen: React.FC<TrainServicesScreenProps> = ({
  setActiveTab,
  initialService,
}) => {
  const [selectedService, setSelectedService] = useState<string | null>(
    initialService || null
  );
  const [commuterView, setCommuterView] = useState<
    "home" | "position" | "position-detail" | "schedule"
  >("home");
  const [selectedStation, setSelectedStation] = useState<any | null>(null);
  const [selectedLine, setSelectedLine] = useState<any | null>(null);
  const [generatedSchedule, setGeneratedSchedule] = useState<string[]>([]);

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

  const handleServiceSelect = (serviceId: string) =>
    setSelectedService(serviceId);
  const handleBackToDashboard = () => setActiveTab(NavigationTab.Dashboard);

  // If a service is selected, show details
  if (selectedService) {
    const service = TrainDataService.getTrainServiceById(selectedService);
    if (!service) return null;

    // Commuter: position list
    if (selectedService === "commuter" && commuterView === "position") {
      const stations = TrainDataService.getAllStations();
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-b-3xl">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCommuterView("home")}
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
                Stasiun
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrainIcon className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Stasiun Tujuan
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700">
              {stations.map((st, idx) => (
                <button
                  key={`${st.code}-${idx}`}
                  onClick={() => {
                    setSelectedStation(st);
                    setCommuterView("position-detail");
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <TrainIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold tracking-wide text-gray-800 dark:text-gray-200">
                      {st.name.toUpperCase()}
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

    // Commuter: position detail (no destination picker here)
    if (
      selectedService === "commuter" &&
      commuterView === "position-detail" &&
      selectedStation
    ) {
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
                  // Dispatch payment intent without destination. Payment screen will prompt for destination and compute fare.
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

    // Commuter: schedule view
    if (
      selectedService === "commuter" &&
      commuterView === "schedule" &&
      selectedStation &&
      selectedLine
    ) {
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

    // Commuter home view
    if (selectedService === "commuter" && commuterView === "home") {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-b-3xl">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedService(null)}
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
                    Pesan tiket kereta commuter line anda sekarang menjadi lebih
                    mudah.
                  </p>
                </div>
              </div>
              <button
                onClick={() => alert("Fitur booking akan tersedia segera.")}
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

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <CalendarIcon className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Jadwal Kereta
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Informasi jadwal perjalanan KRL.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                  <RouteIcon className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Rute dan Jalur
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Informasi Rute dan Jalur KRL.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                  <PriceTagIcon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Cek Tarif
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Informasi tarif perjalanan KRL.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default layout for other services
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToDashboard}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">{service.name}</h1>
            <div></div>
          </div>
          <p className="text-sm opacity-90 mt-2">{service.description}</p>
        </div>

        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Pilih Layanan
          </h2>
          <div className="space-y-3">
            {(
              service.trains ||
              service.lines ||
              service.systems ||
              service.services ||
              []
            ).map((item: any, index: number) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.route?.from?.city && item.route?.to?.city
                        ? `${item.route.from.city} - ${item.route.to.city}`
                        : item.route || "N/A"}
                    </p>
                    {item.code && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {item.code}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 ${service.bgColor} rounded-full`}>
                    <TrainIcon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Durasi
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.duration}
                      </p>
                    </div>
                    {item.distance && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Jarak
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {item.distance}
                        </p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Harga
                      </p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {item.classes?.[0]?.price
                          ? TrainDataService.formatPrice(item.classes[0].price)
                          : item.price
                          ? TrainDataService.formatPrice(item.price)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {item.classes && item.classes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Kelas tersedia:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.classes.map(
                        (trainClass: any, classIndex: number) => (
                          <span
                            key={classIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {trainClass.name} -{" "}
                            {TrainDataService.formatPrice(trainClass.price)}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => alert("Fitur booking akan tersedia segera.")}
                  className={`w-full py-3 ${service.bgColor} text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`}
                >
                  Pesan Tiket
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main service selection
  const TRAIN_SERVICES = TrainDataService.getAllTrainServices().map(
    (service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      bgColor: service.bgColor,
      trains:
        service.trains ||
        service.lines ||
        service.systems ||
        service.services ||
        [],
    })
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToDashboard}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Layanan Kereta</h1>
          <div></div>
        </div>
        <p className="text-sm opacity-90 mt-2">
          Pilih jenis layanan kereta yang Anda butuhkan
        </p>
      </div>

      <div className="p-4 space-y-4">
        {TRAIN_SERVICES.map((service) => (
          <div
            key={service.id}
            onClick={() => handleServiceSelect(service.id)}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 ${service.bgColor} rounded-full flex items-center justify-center`}
              >
                <TrainIcon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {service.description}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {(service.trains || []).length} layanan tersedia
                </p>
              </div>
              <div className="text-gray-400">
                <svg
                  className="w-6 h-6"
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainServicesScreen;
