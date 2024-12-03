import { downloadFile } from '../../services/api';
import generateDownload from '.';

jest.mock('stream');

const mockPipe = jest.fn();

jest.mock('../../services/api', () => ({
  downloadFile: jest.fn(),
}));

describe('controllers/generateDownload', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      params: { fileId: 'mock-file.pdf' },
      query: {},
      session: {},
    };
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
      set: jest.fn(),
      status: jest.fn(() => res),
      send: jest.fn(),
    };
    downloadFile.mockResolvedValue({
      headers: { 'content-type': 'mock-pdf' },
      pipe: mockPipe.mockReturnValue({ pipe: mockPipe }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns 404 if there is an error finding the file', async () => {
    downloadFile.mockResolvedValueOnce();

    await generateDownload(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns an error if there is an API problem', async () => {
    downloadFile.mockRejectedValueOnce('some-error');

    await generateDownload(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('creates a file download', async () => {
    await generateDownload(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(mockPipe.mock.calls.length).toBe(2);
  });

  it('passes filename if query string is passed', async () => {
    req.query.filename = 'renamed-file.pdf';

    await generateDownload(req, res);

    expect(res.set).toHaveBeenCalledWith('Content-disposition', 'attachment; filename=renamed-file.pdf');
  });
});
