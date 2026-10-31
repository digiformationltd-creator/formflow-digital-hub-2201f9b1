import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type ClientCompany = Tables<'client_company_details'>;
export type ClientAddress = Tables<'client_addresses'>;
export type ClientDocument = Tables<'client_documents'>;
export type ClientInvoice = Tables<'invoices'>;
export type ClientSubscription = Tables<'client_subscriptions'>;
export type ClientWalletTransaction = Tables<'client_wallet_transactions'>;
export type ClientTicket = Tables<'client_tickets'>;
export type ManagedClientRow = Tables<'managed_clients'>;
export type ManagedClientInsert = TablesInsert<'managed_clients'>;
export type ClientOrder = Tables<'client_orders'> & {
  __invoice_number?: string | null;
  __invoice_pdf?: string | null;
  __invoice_status?: string | null;
};
export type ClientProfile = Partial<Tables<'profiles'>>;
export type ClientCompanyPatch = TablesUpdate<'client_company_details'>;
export type ClientAddressPatch = TablesUpdate<'client_addresses'>;
export type ClientOrderPatch = TablesUpdate<'client_orders'>;
export type ClientInvoicePatch = TablesUpdate<'invoices'>;
export type ClientSubscriptionPatch = TablesUpdate<'client_subscriptions'>;
export type ClientWalletPatch = TablesUpdate<'client_wallet_transactions'>;
export type ClientDocumentPatch = TablesUpdate<'client_documents'>;
export type ClientMutableTable = 'client_company_details' | 'client_addresses' | 'client_orders' | 'invoices' | 'client_subscriptions' | 'client_wallet_transactions' | 'client_documents';

export type ClientAdminTab = 'company' | 'addresses' | 'orders' | 'invoices' | 'wallet' | 'docs' | 'emails';
export function parseClientAdminTab(value: string | null): ClientAdminTab {
  switch (value) {
    case 'addresses': case 'orders': case 'invoices': case 'wallet': case 'docs': case 'emails': return value;
    default: return 'company';
  }
}
