import { TokenData } from '../types/calculator';

interface TokenSelectorProps {
  selectedToken: string;
  selectedMethod: string;
  tokenList: TokenData[];
  onTokenChange: (token: string) => void;
  onMethodChange: (method: string) => void;
}

export const TokenSelector = ({
  selectedToken,
  selectedMethod,
  tokenList,
  onTokenChange,
  onMethodChange
}: TokenSelectorProps) => {
  return (
    <div className="mb-3">
      <div className="row mb-4">
        <div className="col-md-6 offset-md-3">
          <label className="form-label fw-bold">🔄 Pilih Metode:</label>
          <select
            className="form-select"
            value={selectedMethod}
            onChange={(e) => onMethodChange(e.target.value)}
          >
            <option value="statis">Statis</option>
            <option value="dinamis">Dinamis (Fetch dari API)</option>
          </select>
        </div>
      </div>
      
      <label className="form-label">Pilih Token</label>
      <select 
        className="form-select" 
        value={selectedToken} 
        onChange={(e) => onTokenChange(e.target.value)}
      >
        {tokenList.map(token => (
          <option key={token.id} value={token.id}>
            {token.name} ({token.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};