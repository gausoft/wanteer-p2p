import { useListingDraft } from './listing-draft.store';

describe('listing draft store', () => {
  afterEach(() => useListingDraft.getState().reset());

  it('keeps the draft between steps and resets it for a new publication', () => {
    useListingDraft.getState().setType('SALE');
    useListingDraft.getState().update({ title: 'Chaise', price: '2500' });

    expect(useListingDraft.getState()).toMatchObject({
      type: 'SALE',
      title: 'Chaise',
      price: '2500',
    });

    useListingDraft.getState().reset();

    expect(useListingDraft.getState()).toMatchObject({
      type: null,
      title: '',
      price: '',
      photoFileName: null,
    });
  });
});
