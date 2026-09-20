export type ExploreToolItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  priceUsdc: string;
  priceNum: number;
  ownerLabel: string;
  ownerAddress: string;
  imageUrl?: string | null;
  category: string;
  createdAt: string;
};
