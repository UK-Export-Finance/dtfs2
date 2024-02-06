export type AzureFileInfo = {
  /**
   * The folder that the file is contained within in Azure Storage
   * example: '123'
   */
  folder: string;
  /**
   * The filename
   * example: '2023_12_Bank_utilisation_report.csv'
   */
  filename: string;
  /**
   * The full path of the file in Azure Storage (i.e. the folder and filename)
   * example: '123/2023_12_Bank_utilisation_report.csv'
   */
  fullPath: string;
  /**
   * The URL used to directly access the file in Azure Storage
   * example: 'https://my-storage.file.core.windows.net/file-share-name/123/2023_12_Bank_utilisation_report.csv'
   */
  url: string;
  /**
   * MIME type - indicating the nature and format of the document
   * example: 'text/csv'
   */
  mimetype: string;
};
