import React, { useState, useEffect } from "react";
import { NavigationTab, PaymentIntent } from "../types";
import { TrainDataService } from "../services/trainDataService";
import Swal from 'sweetalert2';

interface PaymentScreenProps {
  setActiveTab: (tab: NavigationTab) => void;
  payment: PaymentIntent | null;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  setActiveTab,
  payment,
}) => {
  const [localPayment, setLocalPayment] = useState<PaymentIntent | null>(
    payment
  );
  const [allStations, setAllStations] = useState<any[]>([]);

  useEffect(() => {
    setLocalPayment(payment);
    setAllStations(TrainDataService.getAllStations());
  }, [payment]);

  const parseDistanceNumber = (d: any) => {
    if (!d && d !== 0) return 0;
    if (typeof d === "number") return d;
    const s = String(d).replace(",", ".");
    const match = s.match(/[0-9]+(?:\.[0-9]+)?/);
    return match ? parseFloat(match[0]) : 0;
  };

  const computeEstimatedFare = (line: any, from: any, to: any) => {
    try {
      if (!line) return line?.price ?? 0;
      const lineDist = parseDistanceNumber(line.distance);
      const baseFarePerKm =
        lineDist > 0 ? line.price / lineDist : line.price || 0;

      const cityKey = (from?.city || "").toLowerCase();
      const cityStations =
        TrainDataService.getStationsByCity(cityKey).length > 0
          ? TrainDataService.getStationsByCity(cityKey)
          : TrainDataService.getAllStations();

      const sortByName = (a: any, b: any) => a.name.localeCompare(b.name);
      cityStations.sort(sortByName);

      const idxFrom = cityStations.findIndex(
        (s: any) => s.code === from?.code || s.name === from?.name
      );
      const idxTo = cityStations.findIndex(
        (s: any) => s.code === to?.code || s.name === to?.name
      );

      let frac = 0.5;
      if (idxFrom >= 0 && idxTo >= 0 && cityStations.length > 1) {
        frac = Math.abs(idxTo - idxFrom) / Math.max(1, cityStations.length - 1);
      }

      const estKm = (lineDist || 1) * frac;
      const fare = Math.max(2000, Math.round(baseFarePerKm * estKm));
      return fare;
    } catch (err) {
      return line?.price ?? 0;
    }
  };

  if (!localPayment) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Tidak ada pembayaran yang dipilih.</p>
      </div>
    );
  }

  const line = localPayment.lineId
    ? TrainDataService.getCommuterLines().find(
        (l: any) => l.id === localPayment.lineId
      )
    : null;

  const handleDestinationChange = (code: string) => {
    const dest = TrainDataService.getStationByCode(code) || null;
    if (!dest) return;
    const fromStationObj = TrainDataService.getStationByCode(
      localPayment.fromStation
    ) || { name: localPayment.fromStation };
    const fare = line
      ? computeEstimatedFare(line, line.route.from, {
          name: dest.name,
          code: dest.code,
          city: dest.city,
        })
      : localPayment.amount;
    setLocalPayment({ ...localPayment, toStation: dest.name, amount: fare });
  };

  const handlePay = () => {
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pembayaran berhasil! Terima kasih.',
        confirmButtonText: 'Baik'
    });
    setActiveTab(NavigationTab.Tickets);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-b-3xl">
        <h1 className="text-xl font-bold">Pembayaran</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Ringkasan Perjalanan
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <p>
              Service:{" "}
              <span className="font-medium">{localPayment.serviceName}</span>
            </p>
            <p>
              Dari:{" "}
              <span className="font-medium">{localPayment.fromStation}</span>
            </p>
            {localPayment.toStation ? (
              <p>
                Ke:{" "}
                <span className="font-medium">{localPayment.toStation}</span>
              </p>
            ) : line ? (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">
                  Pilih Stasiun Tujuan
                </p>
                <select
                  className="w-full p-2 rounded-lg border bg-white dark:bg-gray-700"
                  onChange={(e) => handleDestinationChange(e.target.value)}
                >
                  <option value="">-- Pilih Tujuan --</option>
                  {TrainDataService.getAllStations()
                    .filter((s) => s.code !== localPayment.fromStation)
                    .map((s: any) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.city})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <p>
                Ke:{" "}
                <span className="font-medium">
                  {localPayment.toStation || "N/A"}
                </span>
              </p>
            )}
            <p>
              Tanggal: <span className="font-medium">{localPayment.date}</span>
            </p>
            <p>
              Penumpang:{" "}
              <span className="font-medium">{localPayment.passengers}</span>
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-300">Total</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Rp {localPayment.amount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Metode Pembayaran
          </h3>
          <button className="w-full border rounded-lg p-3 text-left">
            Virtual Account
          </button>
          <button className="w-full border rounded-lg p-3 text-left">
            Kartu Kredit/Debit
          </button>
          <button className="w-full border rounded-lg p-3 text-left">
            E-Wallet
          </button>
        </div>

        <button
          onClick={handlePay}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
        >
          Bayar Sekarang
        </button>
      </div>
    </div>
  );
};

export default PaymentScreen;
