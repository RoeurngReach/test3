export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;
  note: string;
}

export const CATEGORIES = {
  income: ['ប្រាក់ខែ', 'ចំណូលពីការលក់', 'ការប្រាក់', 'ផ្សេងៗ'],
  expense: [
    'ម្ហូបអាហារ',
    'ផ្ទះ/ទឹកភ្លើង',
    'ធ្វើដំណើរ',
    'សុខភាព',
    'សិក្សា',
    'កម្សាន្ត',
    'ទិញឥវ៉ាន់',
    'ផ្សេងៗ',
  ],
};
