export interface MessageCard {
  id: string;
  content: string;
  type: 'noise' | 'reason';
  createdAt: Date;
}

export interface SwipeResult {
  cardId: string;
  direction: 'left' | 'right';
  rating: number; // 1-5 or similar
}
