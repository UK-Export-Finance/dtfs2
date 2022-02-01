export interface Class {
  code: string;
  name: string;
}
export interface IndustrySector {
  code: string;
  name: string;
  classes: Class[];
}
