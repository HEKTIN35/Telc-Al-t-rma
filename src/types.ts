export type LV1Option = {
  key: string;
  text: string;
};

export type LV1Data = {
  title: string;
  text: string;
  options: LV1Option[];
  solution: Record<string, string>;
};

export type LV2Question = {
  id: number;
  text: string;
  solution: string;
};

export type LV2Paragraph = {
  key: string;
  text: string;
};

export type LV2Data = {
  title: string;
  questions: LV2Question[];
  paragraphs: LV2Paragraph[];
};

export type LV3Statement = {
  id: number;
  text: string;
  solution: "+" | "-" | "x" | string;
};

export type LV3Heading = {
  id: number;
  question: string;
  options: Record<string, string>;
  solution: string;
};

export type LV3Data = {
  title: string;
  text?: string;
  statements: LV3Statement[];
  heading?: LV3Heading;
};

export type SPItem = {
  id: number;
  options: Record<string, string>;
  solution: string;
};

export type SPData = {
  title: string;
  text: string;
  items: SPItem[];
};

export type TrainerData = {
  lv1?: LV1Data;
  lv2?: LV2Data;
  lv3?: LV3Data;
  sp?: SPData;
};
