// Billing Provider Types

export interface BillingProvider {
  id: number
  name: string
  description: string
  logo: string
}

export type BillingEnvironment = 'produccion' | 'prueba'
export type PdfFormat = 'A4' | 'TICKET' | '80MM'

// Nubefact Types

export interface NubefactCredentials {
  nubefact_url: string
  api_token: string
  serie_factura?: string
  numero_factura?: string | number
  serie_boleta?: string
  numero_boleta?: string | number
  environment: BillingEnvironment
  pdf_format?: PdfFormat
}

export interface NubefactConfig {
  configured: boolean
  provider: string
  blocked?: boolean
  credentials: NubefactCredentials | null
}

export interface NubefactConfigResponse {
  provider: BillingProvider
  configured: boolean
  blocked?: boolean
  credentials: NubefactCredentials | null
}

export interface SaveNubefactCredentialsRequest {
  nubefact_url: string
  api_token: string
  serie_factura?: string
  numero_factura?: string | number
  serie_boleta?: string
  numero_boleta?: string | number
  environment?: BillingEnvironment
  pdf_format?: PdfFormat
  blocked?: boolean
}

export interface TestConnectionResponse {
  connected: boolean
  environment: BillingEnvironment
  message?: string
}

// Document Types

export type DocumentType = 1 | 2 // 1=Factura, 2=Boleta

export interface BillingDocument {
  id: number
  order_code: string
  document_type: string // 'Factura' | 'Boleta'
  serie: string
  correlative: string
  customer_name: string
  customer_document: string
  total: number
  emission_date: string
  provider_id: number
  files: BillingDocumentFiles
}

export interface BillingDocumentFiles {
  pdf?: string
  xml?: string
  cdr?: string
  qr?: string
}

export interface BillingDocumentDetail extends BillingDocument {
  customer_document_type: number
  hash: string | null
  full_response: any
}

export interface EmitDocumentRequest {
  order_id: number
  document_type: DocumentType
  pdf_format?: PdfFormat
}

export interface EmitDocumentResponse {
  order_id: number
  document_type: DocumentType
  serie: string
  correlative: string
  files: BillingDocumentFiles
}
