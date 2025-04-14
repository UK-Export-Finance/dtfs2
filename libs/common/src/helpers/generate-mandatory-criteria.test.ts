import { generateMandatoryCriteria } from './generate-mandatory-criteria';
import { GEF_CRITERION } from '../types';

describe('generateMandatoryCriteria', () => {
  it('should return single test criterion', () => {
    // Arrange
    const criteria: GEF_CRITERION[] = [
      {
        id: '1',
        body: 'test',
      },
    ];

    // Act
    const result = generateMandatoryCriteria(criteria);

    // Assert
    expect(result).toEqual('1 test\n\n^True\n\n');
  });

  it('should return multiple criteria with HTML stripped out', () => {
    // Arrange
    const criteria: GEF_CRITERION[] = [
      {
        id: '1',
        body: 'test one',
      },
      {
        id: '2',
        body: 'test two',
      },
      {
        id: '3.a',
        body: 'test three',
      },
      {
        id: '4',
        body: 'test four',
        childList: [
          "child list one with link to the <a href = '/asset/file.docx'>file</a>.",
          'child list two with <b>bold text</b>.',
          'child list three no html.',
        ],
      },
    ];

    // Act
    const result = generateMandatoryCriteria(criteria);

    // Assert
    expect(result).toEqual(
      '1 test one\n\n2 test two\n\n3a test three\n\n4 test four\n\n*child list one with link to the file.\n\n*child list two with bold text.\n\n*child list three no html.\n\n^True\n\n',
    );
  });

  it('should return multiple criteria without HTML stripped out', () => {
    // Arrange
    const criteria: GEF_CRITERION[] = [
      {
        id: '1',
        body: 'test one',
      },
      {
        id: '2',
        body: 'test two',
      },
      {
        id: '3.a',
        body: 'test three',
      },
      {
        id: '4',
        body: 'test four',
        childList: [
          "child list one with link to the <a href = '/asset/file.docx'>file</a>.",
          'child list two with <b>bold text</b>.',
          'child list three no html.',
        ],
      },
    ];

    // Act
    const result = generateMandatoryCriteria(criteria, true);

    // Assert
    expect(result).toEqual(
      "1 test one\n\n2 test two\n\n3a test three\n\n4 test four\n\n*child list one with link to the <a href = '/asset/file.docx'>file</a>.\n\n*child list two with <b>bold text</b>.\n\n*child list three no html.\n\n^True\n\n",
    );
  });
});
