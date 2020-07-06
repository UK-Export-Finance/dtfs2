const componentRenderer = require('../../componentRenderer');
const component = 'contract/components/contract-tabs.njk';
const render = componentRenderer(component);

describe(component, () => {
  const deal = {_id:123};

  describe("when called with selected = 'view'", () => {
    let wrapper;

    beforeAll( () => {
      wrapper = render({deal, selected: 'view'});
    })

    it("disables the link to the view tab", () =>{
      wrapper.expectLink('[data-cy="view-tab"]').toLinkTo(`#`,'View');
    });

    it("provides a link to the comments tab", () =>{
      wrapper.expectLink('[data-cy="comments-tab"]').toLinkTo(`/contract/${deal._id}/comments`,'Comments');
    });

    it("provides a link to the preview tab", () =>{
      wrapper.expectLink('[data-cy="preview-tab"]').toLinkTo(`/contract/${deal._id}/submission-details`,'Preview Deal Details');
    });

  });

  describe("when called with selected = 'comments'", () => {
    let wrapper;

    beforeAll( () => {
      wrapper = render({deal, selected: 'comments'});
    })

    it("provides a link to the view tab", () =>{
      wrapper.expectLink('[data-cy="view-tab"]').toLinkTo(`/contract/${deal._id}`,'View');
    });

    it("disables the link to the comments tab", () =>{
      wrapper.expectLink('[data-cy="comments-tab"]').toLinkTo(`#`,'Comments');
    });

    it("provides a link to the preview tab", () =>{
      wrapper.expectLink('[data-cy="preview-tab"]').toLinkTo(`/contract/${deal._id}/submission-details`,'Preview Deal Details');
    });

  });

  describe("when called with selected = 'submission-details'", () => {
    let wrapper;

    beforeAll( () => {
      wrapper = render({deal, selected: 'submission-details'});
    })

    it("provides a link to the view tab", () =>{
      wrapper.expectLink('[data-cy="view-tab"]').toLinkTo(`/contract/${deal._id}`,'View');
    });

    it("provides a link to the comments tab", () =>{
      wrapper.expectLink('[data-cy="comments-tab"]').toLinkTo(`/contract/${deal._id}/comments`,'Comments');
    });

    it("disables the link to the preview tab", () =>{
      wrapper.expectLink('[data-cy="preview-tab"]').toLinkTo(`#`,'Preview Deal Details');
    });

  });
});
