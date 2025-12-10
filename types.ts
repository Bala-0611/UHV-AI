export interface UHVAnalysisResult {
  name: string;
  rollNo: string;
  self: string[];
  family: string[];
  society: string[];
  environment: string[];
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: UHVAnalysisResult | null;
}
