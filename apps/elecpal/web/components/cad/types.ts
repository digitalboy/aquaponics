export interface CadHoverInfo {
  x: number;
  y: number;
  title: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger';
  details: Array<{ label: string; value: string }>;
}

/**
 * 缺省文本截断函数（工业图纸紧凑排版）
 */
export function truncateText(text: string, maxLen: number = 8): string {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '..' : text;
}
