export function computeBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#D18A6E" };
  if (bmi < 25) return { label: "Normal", color: "#1BB6A6" };
  if (bmi < 30) return { label: "Overweight", color: "#D18A6E" };
  return { label: "Obese", color: "#C2461B" };
}
