export interface Scene {
  id: number;
  timeStart: number; // in seconds
  timeEnd: number; // in seconds
  title: string;
  visualDirection: string;
  imageSrc: string;
  voiceOver: string;
  colorGrade: string;
  audioDescriptor: string;
}

export interface UserRegistry {
  fullName: string;
  age: number;
  region: string;
  registryId: string;
  bloodType: string;
}

export interface CapsuleDiagnostics {
  dosage: string;
  complianceRating: string;
  syntheticNutrients: string;
  flavorSuppressors: string;
  empathyRegulators: string;
  sedativeLevel: string;
}
