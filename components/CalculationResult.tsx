interface CalculationResultProps {
  label: string
  value: string | number
}

export const CalculationResult = ({ label, value }: CalculationResultProps) => {
  return (
    <div className="bg-gray-50 px-4 py-3 rounded-md">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}