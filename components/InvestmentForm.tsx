import { FaRegCopy, FaPaste } from "react-icons/fa";

interface InvestmentFormProps {
  token: string;
  buyPrice: string;
  targetPrice: string;
  currentPrice: number | null;
  onTokenChange: (value: string) => void;
  onBuyPriceChange: (value: string) => void;
  onTargetPriceChange: (value: string) => void;
  onReset: () => void;
  onExportCSV: () => void;
  handleCopy: (value: string) => void;
  handlePaste: (setter: (val: string) => void) => void;
}

export const InvestmentForm = ({
  token,
  buyPrice,
  targetPrice,
  currentPrice,
  onTokenChange,
  onBuyPriceChange,
  onTargetPriceChange,
  onReset,
  onExportCSV,
  handleCopy,
  handlePaste
}: InvestmentFormProps) => {
  return (
    <div className="card shadow-sm p-3">
      <h5>🎯 Input Investasi</h5>
      {/* Pindahkan form input dari file utama ke sini */}
    </div>
  );
};