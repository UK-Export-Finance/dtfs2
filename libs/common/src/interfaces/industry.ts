/**
 * Represents an industry classification with a code and a name.
 */
export type IndustryClassInterface = {
  /**
   * The code of the industry sector.
   */
  code: string;

  /**
   * The name of the industry sector.
   */
  name: string;
};

/**
 * Interface representing an industry sector.
 */
export type IndustrySectorInterface = {
  /**
   * The classes associated with the industry sector.
   */
  classes: IndustryClassInterface[];
} & IndustryClassInterface;
