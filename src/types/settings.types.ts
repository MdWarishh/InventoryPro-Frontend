// ─── Settings Types ────────────────────────────────────────────────────────

export type FontFamily = 'Inter' | 'Poppins' | 'Roboto' | 'Open Sans' | 'Montserrat' | 'Nunito'
export type FontSize = 'sm' | 'md' | 'lg'
export type GSTRate = 0 | 5 | 12 | 18 | 28

export interface Settings {
  id: string
  branchId: string

  // Company
  companyName?: string
  logo?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  gstin?: string
  legalName?: string
  state?: string
  stateCode?: string

  // Invoice / Tax
  defaultGSTRate: number
  invoicePrefix: string
  invoiceFooter?: string
  invoiceTerms?: string
  resetInvoiceMonthly: boolean
  placeOfSupply?: string
  placeOfSupplyCode?: string
  dueDateTerms?: string
  footerServices?: string

  // Bank
  bankAccountHolder?: string
  bankAccountNumber?: string
  bankIFSC?: string
  bankBranch?: string

  // Media
  qrCodeImage?: string
  authorizedSignature?: string

  // Currency / Locale
  currency: string
  currencySymbol: string
  timezone: string

  // Appearance
  primaryColor: string
  secondaryColor: string
  footerColor?: string
  fontSize: string
  fontFamily: string
  customPaymentModes?: string[]

  updatedAt: string
}

// ─── Request Payload ───────────────────────────────────────────────────────
// Single interface — no duplicate. Covers all fields the frontend can send.

export interface UpdateSettingsPayload {
  branchId?: string

  // Company Info
  companyName?: string
  legalName?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  gstin?: string
  state?: string
  stateCode?: string

  // Appearance
  primaryColor?: string
  secondaryColor?: string
  footerColor?: string
  fontFamily?: FontFamily
  fontSize?: FontSize

  // Invoice core
  invoicePrefix?: string
  defaultGSTRate?: number
  currency?: string
  currencySymbol?: string
  invoiceFooter?: string
  invoiceTerms?: string
  resetInvoiceMonthly?: boolean

  // Invoice extended
  placeOfSupply?: string
  placeOfSupplyCode?: string
  dueDateTerms?: string
  footerServices?: string

  // Bank details
  bankAccountHolder?: string
  bankAccountNumber?: string
  bankIFSC?: string
  bankBranch?: string
  customPaymentModes?: string[]

  // Misc
  timezone?: string
}

export interface UploadLogoPayload {
  branchId?: string
  logo: File
}