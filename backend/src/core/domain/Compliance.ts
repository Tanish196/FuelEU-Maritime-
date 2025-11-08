// Domain types for Compliance operations (Fuel EU Article 21 - Pooling)

export interface AdjustedCB {
  shipId: string;
  vesselType: string;
  cb_before: number; // Compliance Balance in gCO₂e
}

export interface ComplianceCalculation {
  shipId: string;
  vesselType: string;
  targetIntensity: number;
  actualIntensity: number;
  fuelConsumption: number;
  energyInScope: number;
  cb: number;
}
