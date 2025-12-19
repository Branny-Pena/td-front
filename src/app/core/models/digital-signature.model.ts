export interface DigitalSignature {
  id: string;
  signatureData: string;
}

export interface CreateDigitalSignatureDto {
  signatureData: string;
}
