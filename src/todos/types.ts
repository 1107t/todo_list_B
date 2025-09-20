export type Todo = {
  title: string;
  readonly id: number;
  completed_flg: boolean;
  delete_flg: boolean;
  progress: number;
  start_date: string;
  due_date: string;
  description: string;
  start_note: string;
  images?: { name: string; url: string }[];
};

export type Filter = 'all' | 'completed' | 'unchecked' | 'delete';