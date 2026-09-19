import { create } from 'zustand';
import { DEFAULT_NEIGHBORHOOD_ID } from '@p2p-local/config';
import type { ListingType } from '@p2p-local/types';

type ListingDraftState = {
  type: ListingType | null;
  photoFileName: string | null;
  title: string;
  description: string;
  price: string;
  neighborhoodId: string;
  setType: (type: ListingType) => void;
  update: (
    values: Partial<
      Pick<
        ListingDraftState,
        'photoFileName' | 'title' | 'description' | 'price' | 'neighborhoodId'
      >
    >,
  ) => void;
  reset: () => void;
};

const initialDraft = {
  type: null,
  photoFileName: null,
  title: '',
  description: '',
  price: '',
  neighborhoodId: DEFAULT_NEIGHBORHOOD_ID,
} as const;

export const useListingDraft = create<ListingDraftState>((set) => ({
  ...initialDraft,
  setType: (type) => set({ type }),
  update: (values) => set(values),
  reset: () => set(initialDraft),
}));
