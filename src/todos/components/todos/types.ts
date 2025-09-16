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
  images?: { name: string; url: string }[]; // ファイル名とURLの配列に変更
};

export type ProjectDetail = {
  id: number;
  title: string;
  overview: string;
  deadline: string;
  responsible: string;
  description: string;
  implementation_items: string[];
  required_environment: string[];
  progress_items: { item: string; completed: boolean }[];
  notes: string;
  created_date: string;
};

export type Filter = 'all' | 'completed' | 'unchecked' | 'delete';

export interface SearchFormProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Todo[];
}

export interface TodoItemProps {
  todo: Todo;
  isExpanded: boolean;
  onToggleExpanded: (id: number) => void;
  onUpdateTodo: (id: number, key: keyof Todo, value: any) => void;
  onMarkClick: (todo: Todo) => void;
}

export interface MarkdownRendererProps {
  description: string;
  onBack: () => void;
}