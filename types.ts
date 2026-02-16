
export type TransactionDestination = 'savings' | 'investments' | 'ready_to_use';
export type CurrencyCode = 'USD' | 'KES' | 'EUR' | 'GBP' | 'JPY';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  walletId: string;
  destination?: TransactionDestination;
  currency?: CurrencyCode;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'mobile' | 'bank' | 'cash' | 'mmf' | 'other';
}

export interface Investment {
  id: string;
  name: string;
  principal: number;
  profitRate: number; // Percentage
  date: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'video' | 'location';
  groundingUrls?: Array<{ uri: string; title: string }>;
  isSniperSignal?: boolean;
}

export interface ForexNewsAlert {
  id: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  assets: string[];
  signal: string;
  logic: string;
  timestamp: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  description: string;
  category: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  ADVISER = 'adviser',
  WALLET = 'wallet',
  PREDICTOR = 'predictor'
}

export type DashboardModule = 'none' | 'finance' | 'wellbeing' | 'forex' | 'study';
