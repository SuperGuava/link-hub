export type CreateLinkParams = {
  userId: string;
  originalUrl: string;
  slug?: string;
  expiresAt?: Date | null;
  clickLimit?: number | null;
};

export type CreatedLink = {
  id: string;
  slug: string;
  shortUrl: string;
  originalUrl: string;
};

export type LinkListItem = {
  id: string;
  slug: string;
  shortUrl: string;
  originalUrl: string;
  status: string;
  clickCount: number;
  clickLimit: number | null;
  expiresAtLabel: string;
  createdAtLabel: string;
};
