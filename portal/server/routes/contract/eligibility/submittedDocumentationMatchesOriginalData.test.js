import submittedDocumentationMatchesOriginalData from './submittedDocumentationMatchesOriginalData';

describe('submittedDocumentationMatchesOriginalData', () => {
  it('should return false when the security property is different from saved deal object', () => {
    const formData = {
      security: 'test2',
    };
    const formFiles = [];
    const savedDeal = {
      securityDetails: {
        exporter: 'test1',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);
    expect(result).toEqual(false);
  });

  it('should return false when the form files length is greater than 0', () => {
    const formData = {
      security: 'test1',
    };
    const formFiles = [{ name: 'test.pdf' }];
    const savedDeal = {
      securityDetails: {
        exporter: 'test2',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);
    expect(result).toEqual(false);
  });

  it('should return false when the form files length is greater than 0 and form data and save deal data matches', () => {
    const formData = {
      security: 'test1',
    };
    const formFiles = [{ name: 'test.pdf' }];
    const savedDeal = {
      securityDetails: {
        exporter: 'test1',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);
    expect(result).toEqual(false);
  });

  it('should return false when the form files is undefined', () => {
    const formData = {
      security: 'test1',
    };
    const formFiles = undefined;
    const savedDeal = {
      securityDetails: {
        exporter: 'test2',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);
    expect(result).toEqual(false);
  });

  it('should return false when the form files is null', () => {
    const formData = {
      security: 'test1',
    };
    const formFiles = null;
    const savedDeal = {
      securityDetails: {
        exporter: 'test2',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);
    expect(result).toEqual(false);
  });

  it('should return false when files have been submitted', () => {
    const formData = {
      security: 'abc123',
    };
    const formFiles = ['file1', 'file2'];
    const originalData = {
      securityDetails: {
        exporter: 'abc123',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, originalData);

    expect(result).toEqual(false);
  });

  it('should return false when savedDeal parameter is null', () => {
    const formData = {
      security: 'abc123',
    };
    const formFiles = [];
    const savedDeal = null;

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return false when savedDeal parameter is undefined', () => {
    const formData = {
      security: 'abc123',
    };
    const formFiles = [];
    const savedDeal = undefined;

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return false when savedDeal parameter is an empty object', () => {
    const formData = {
      security: 'abc123',
    };
    const formFiles = [];
    const savedDeal = {};

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return false when savedDeal.securityDetails property does not exist', () => {
    const formData = {
      security: 'abc123',
    };
    const formFiles = [];
    const savedDeal = {
      supportingInformation: {
        validationErrors: {
          count: 1,
          errorList: {
            exporterQuestionnaire: {
              order: 1,
              text: 'Manual Inclusion Questionnaire is required.',
            },
          },
        },
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return false when savedDeal.securityDetails is null', () => {
    const formData = {
      security: 'abc123',
    };
    const formFiles = [];
    const savedDeal = {
      securityDetails: null,
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return false when savedDeal.securityDetails is undefined', () => {
    const formData = {
      security: 'abc123',
    };
    const formFiles = [];
    const savedDeal = {
      securityDetails: undefined,
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return false when savedDeal.securityDetails is an empty object', () => {
    const formData = {
      security: 'abc123',
    };
    const formFiles = [];
    const savedDeal = {
      securityDetails: {},
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return false when form data is null', () => {
    const formData = null;
    const formFiles = [];
    const savedDeal = {
      securityDetails: {
        exporter: 'test',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return false when form data is undefined', () => {
    const formData = undefined;
    const formFiles = [];
    const savedDeal = {
      securityDetails: {
        exporter: 'test',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return false when form data is an empty object', () => {
    const formData = {};
    const formFiles = [];
    const savedDeal = {
      securityDetails: {
        exporter: 'test',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(false);
  });

  it('should return true when security field in form data matches security field in the saved deal data and no files have been submitted', () => {
    const formData = {
      security: 'abc123',
    };
    const formFiles = [];
    const savedDeal = {
      securityDetails: {
        exporter: 'abc123',
      },
    };

    const result = submittedDocumentationMatchesOriginalData(formData, formFiles, savedDeal);

    expect(result).toEqual(true);
  });
});
